import mongoose from "mongoose";
import { checkCache } from "../utilities/general.js";
import Config from "../models/config.js";

const { NODE_ENV = "DEVELOPMENT" } = process.env;

const DB_URI =
  NODE_ENV === "DEVELOPMENT" ? process.env.LOCAL_DB_URI : process.env.DB_URI;

export const CONFIG_CACHE_KEY = "system:config";
const CONFIG_TTL = 300; // 5 minutes — config rarely changes

let cachedDb = null;
let dbConnectPromise = null;

const getDbConnectionState = (connection = mongoose.connection) => {
  switch (connection?.readyState) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    case 0:
      return "disconnected";
    default:
      return "unknown";
  }
};

const connectToDatabase = async () => {
  console.log("db url is: ", DB_URI);
  if (mongoose.connection.readyState === 1) {
    cachedDb = mongoose.connection;
    return cachedDb;
  }

  if (dbConnectPromise) {
    return dbConnectPromise;
  }

  if (!DB_URI) {
    cachedDb = null;
    return null;
  }

  dbConnectPromise = (async () => {
    try {
      await mongoose.connect(DB_URI, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: false,
      });
      cachedDb = mongoose.connection;
      return cachedDb;
    } catch (error) {
      cachedDb = null;
      throw error;
    }
  })();

  try {
    return await dbConnectPromise;
  } finally {
    dbConnectPromise = null;
  }
};

const dbHandler = async (req, res, next) => {
  req.dbConnected = false;
  req.dbConnectionState = getDbConnectionState();

  try {
    const connection = await connectToDatabase();
    if (connection) {
      req.dbConnected = true;
      req.dbConnectionState = getDbConnectionState(connection);
    }
  } catch (error) {
    req.dbConnectionState = "error";
    req.dbConnectionError = error?.message;
    console.error("Mongo connect Error:", error);
    return res.status(503).json({
      message: "a slight issue occured, please try again 🙏",
      success: false,
    });
  }

  try {
    const config = await checkCache(
      CONFIG_CACHE_KEY,
      async () => {
        if (mongoose.connection.readyState !== 1) {
          return [null, CONFIG_TTL];
        }
        const c = await Config.getConfig();
        return [c?.toObject ? c.toObject() : c, CONFIG_TTL];
      },
      req,
    );
    req.config = config || { cacheEnabled: false };
  } catch (configErr) {
    console.error("Config load error:", configErr?.message || configErr);
    req.config = req.config || { cacheEnabled: false };
  }

  return next();
};

console.log("db url is: ", DB_URI);
export { dbHandler, DB_URI, mongoose, connectToDatabase, getDbConnectionState };
