import { getTokenData } from "../utilities/general.js";
import mongoose from "mongoose";
import { log } from "./logger.js";
import User from "../models/user.js";
import config from "./config.js";
const ObjectId = mongoose.Types.ObjectId;

export default async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log(req.originalRequestPath)
    if (!token) {
      throw new Error("No token found");
    }

    const userData = await getTokenData(token);
    if (!userData) {
      throw new Error("Invalid token data");
    }

    const user = await User.findOne({
      _id: userData._id,
    }).lean();

    delete user.password;

    if (!user) {
      throw new Error("user doesnt exist please login!");
    }

    req.user = user;

    // MUST CHECK CONFIG BECAUSE OF MAINTAINANCE MOOD
    // Call config middleware with next callback
    await config(req, res, () => {
      // After config completes, continue to the next middleware/route
      next();
    });
  } catch (er) {
    console.log("Authorization error:", er.message);
    res.status(401).json({
      success: false,
      message: "Unauthorized - please login again",
      redirect: "/login",
    });
  }
};
