// for jwt
// i use this my code mostly from previous code it help me build faster
import jwt from "jsonwebtoken";
import crypto from "bcryptjs";
import mailer from "nodemailer";
import User from "../models/user.js";
import fs from "fs/promises";
import path from "path";
import { log } from "../middlewares/logger.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { AppError } from "../middlewares/logger.js";
import rateLimit from "express-rate-limit";
import { Resend } from 'resend';

const {
  ENV_TYPE = "development",
  CACHE_REDIS_URI,
  CACHE_ENABLED = "true",
  APP_ID,
  APP_NAME,
  HASH_KEY,
  HASH_ROUNDS,
  MAIL_APP_KEY,
  TOKEN_EXPIRE_TIME,
} = process.env;
let { SENDER_MAIL } = process.env;
const CACHE_EXPIRE_TIME = Number(process.env.CACHE_EXPIRE_TIME || 3600);

// for json web token
const createToken = (data, expiresIn = TOKEN_EXPIRE_TIME) => {
  return expiresIn
    ? jwt.sign(data, HASH_KEY, { expiresIn })
    : jwt.sign(data, HASH_KEY);
};

const getTokenData = (token) => {
  return !token ? new Error() : jwt.verify(token, HASH_KEY);
};

/**
 * Create a short-lived JWT for the /message page.
 * Keeps redirect URLs clean and prevents XSS from raw URL params.
 *
 * Payload: { title, description, type, redirect, _msg: true }
 * Default TTL: 30 minutes
 *
 * @param {{ title: string, description?: string, type?: 'success'|'error'|'warning'|'info', redirect?: string }} data
 * @param {string|number} [ttl='30m']
 * @returns {string} signed JWT
 */
const createMessageToken = (data, ttl = "30m") => {
  return jwt.sign(
    {
      _msg: true,
      title: data.title || "",
      description: data.description || "",
      type: data.type || "info",
      redirect: data.redirect || null,
    },
    HASH_KEY,
    { expiresIn: ttl },
  );
};

/**
 * Verify and decode a message JWT.
 * Returns null if invalid or expired.
 *
 * @param {string} token
 * @returns {{ title, description, type, redirect }|null}
 */
const verifyMessageToken = (token) => {
  try {
    const data = jwt.verify(token, HASH_KEY);
    if (!data._msg) return null;
    return { title: data.title, description: data.description, type: data.type, redirect: data.redirect };
  } catch {
    return null;
  }
};

// for cypto
const hash = (data) => crypto.hashSync(data, HASH_KEY, parseInt(HASH_ROUNDS));
const compareHashes = crypto.compareSync;
const randomHash = (HASH_ROUNDS) => crypto.genSalt(parseInt(HASH_ROUNDS));

const sendEmailViaResend = async (to, subject, html, from = 'support@mail.busypilot.store', config) => {
  try {

    const resend = new Resend(config.auth.pass);

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Email sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


// const composeMail = async (req, receiver, subject, body, other = {}) => {
//   const emailOptions = req.config?.mail;
//   SENDER_MAIL = emailOptions.senderEmail || SENDER_MAIL || 'support@mail.busypilot.store';

//   const options = {
//     subject,
//     from: SENDER_MAIL,
//     to: receiver,
//     html: body,
//     ...other,
//   };

//   console.log('📧 Sending email to:', receiver);
//   console.log('📧 From:', SENDER_MAIL);

//   // for nodemailer
//   const config = {
//     port: 465, // for resend 465
//     host: "smtp.gmail.com", // for resend ues  smtp.resend.com
//     secure: true, // for resend true
//     auth: {
//       user:  req.config?.mail.senderEmail, // SENDER_MAIL for resend is resend 
//       pass: req.config?.apiKeys?.mailPassword || MAIL_APP_KEY,
//     },
//   };

  

//   const transporter = mailer.createTransport(config);

//   const sent = await transporter.sendMail(options);
//   //sendEmailViaResend(options.to, options.subject, options.html, options.from, config)

//   // const sent = await transporter.sendMail(options);
//   console.log('email sending status', sent);
// //   return sent ? true : false;
// };

const composeMail = async (req, receiver, subject, body, other = {}) => {
  const emailOptions = req.config?.mail;
  // Fallback to SENDER_MAIL variable or hardcoded default
  const senderEmail = emailOptions?.senderEmail || SENDER_MAIL || 'support@mail.busypilot.store';
  
  // Grab the API Key from req config or fallback to your environment variable
  const brevoApiKey = req.config?.apiKeys?.mailPassword || MAIL_APP_KEY;

  console.log('📧 Sending email to:', receiver);
  console.log('📧 From:', senderEmail);

  try {
    // Make an HTTP POST request to Brevo API over open port 443
    const response = await fetch('https://brevo.com', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail },
        to: [{ email: receiver }],
        subject: subject,
        htmlContent: body,
        }),
    });

    const result = await response.json();
    console.log('email sending status', result);

    // Brevo returns a messageId on successful API calls
    return response.ok && result.messageId ? true : false;
  } catch (error) {
    console.error('❌ Brevo API Error:', error);
    return false;
  }
};


// fs for adding and retrieving files
const readFile = (url, callback) => {
  return fs.readFile(url);
};

function writeFile(path, buffer) {
  return fs.writeFile(path, buffer);
}

const deleteFile = (url, callback) => {
  return fs.unlink(url);
};

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// helper for managing files to upload folder
const getFileData = (file) => {
  const { mimetype, buffer, size } = file;
  const ext = mimetype.split("/")[1];

  return {
    type: mimetype,
    size,
    ext,
    buffer,
  };
};

const uploadFile = async (file, folder) => {
  const { type, size, ext, buffer } = getFileData(file);

  const fileName = `${new ObjectId().toString()}.${ext}`;
  console.log(fileName);
  const savePath = path.join(__dirname, "uploads", folder, fileName); // adjust to your structure
  await fs.writeFile(savePath, buffer);

  return {
    name: fileName,
    type,
    size,
    url: `uploads/${folder}/${fileName}`,
  };
};

const rewriteFile = async (file, location) => {
  const { type, buffer, size, ext } = getFileData(file);
  const savePath = path.join(__dirname, location); // adjust to your structure
  await fs.writeFile(savePath, buffer);
  return {
    name: location,
    type,
    size,
    url: location,
  };
};

process.__dirname = __dirname;

const generateKey = () => "smartpharm_" + new ObjectId().toString();

const { NODE_ENV = "DEVELOPMENT" } = process.env;

const cookieConfig = {
  httpOnly: NODE_ENV === "PRODUCTION" ? true : false,
  sameSite: NODE_ENV === "PRODUCTION" ? "None" : "lax",
  path: "/",
  secure: NODE_ENV === "PRODUCTION" ? true : false,
};

const setCookie = (
  res,
  key = "key",
  value = "value",
  expiresInMs = 1000 * 60 * 60 * 24,
) => {
  res.cookie(key, value, cookieConfig);
};

console.log(cookieConfig);
const deleteCookie = (res, key, config = cookieConfig) => {
  res.clearCookie(key, config);
};

// for input and data
const specialChars = "{}|$[]<>()!?;:*\'\"&`/\\";

function sanitizeInput(input) {
  if (typeof input !== "string") throw new AppError("invalid input data");
  let sanitizedInput = "";
  for (const char of input) {
    if (!specialChars.includes(char)) sanitizedInput += char;
  }
  return sanitizedInput;
}

const useLimiter = (timeString, max, handler = null) => {
  // Convert human-readable time to milliseconds
  const getTimeMs = (timeStr) => {
    const units = {
      s: 1000, // seconds
      m: 60 * 1000, // minutes
      h: 60 * 60 * 1000, // hours
      d: 24 * 60 * 60 * 1000, // days
      w: 7 * 24 * 60 * 60 * 1000, // weeks
    };

    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));

    return value * (units[unit] || 1000); // default to seconds
  };

  const windowMs = getTimeMs(timeString);

  const limiter = rateLimit({
    windowMs: windowMs,
    max: max,
    handler:
      handler ||
      ((req, res) => {
        res.status(429).json({
          success: false,
          message: `Too many requests, please try again in ${timeString}.`,
        });
      }),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: function (req) {
      return req.headers["x-real-ip"];
    },
  });

  return limiter;
};

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const generateUniqueId = (prefix) => {
  return `${prefix}${Date.now()}`;
};



// ─── Redis cache (redis, Railway REDIS_URL) ──────────────────────────────
import { createClient, RedisClient } from "redis";
import { sendMail } from "../services/mail.js";

const { REDIS_URL } = process.env;

// Lazy-connect singleton — connects once, reuses for the process lifetime
let _redisClient = null;
let _redisConnecting = false;
let _redisUnavailable = false;

const getCacheMem = async () => {
  console.log("redis url", REDIS_URL)
  if (!REDIS_URL) return null;
  if (_redisUnavailable) return null;
  if (_redisClient && (_redisClient.isReady || _redisClient.isOpen)) return _redisClient;
  if (_redisConnecting) return null;

  _redisConnecting = true;
  try {
    if (!_redisClient) {
      _redisClient = createClient({ url: REDIS_URL });
      _redisClient.on("error", (err) => {
        _redisUnavailable = true;
        // log(`Redis error: ${err}`, "bad");
      });
    }

    console.log("connecting redis")
    await _redisClient.connect();
    console.log("redis conneected", _redisClient)
    _redisUnavailable = false;
    return _redisClient;
  } catch (err) {
    _redisUnavailable = true;
    log(`Redis unavailable: ${err.message || "connection failed"}`, "bad");
    return null;
  } finally {
    _redisConnecting = false;
  }
};

// Expose for external usage (backwards compat) — resolves to the connected client
const cacheMem = {
  get: async (...a) => {
    const client = await getCacheMem();
    if (!client) return null;
    return client.get(...a);
  },
  set: async (...a) => {
    const client = await getCacheMem();
    if (!client) return false;
    return client.set(...a);
  },
  del: async (...a) => {
    const client = await getCacheMem();
    if (!client) return false;
    return client.del(...a);
  },
  scan: async (...a) => {
    const client = await getCacheMem();
    if (!client) return [0, []];
    return client.scan(...a);
  },
};

const _cachePrefix = (key) => `${APP_NAME}:${APP_ID}:${key}`;

/**
 * Whether caching is enabled.
 * Priority: req.config.cacheEnabled (DB toggle) → CACHE_ENABLED env → default true
 */
const isCacheEnabled = (req) => {
  if (req?.config && typeof req.config.cacheEnabled === "boolean") {
    return req.config.cacheEnabled;
  }
  return CACHE_ENABLED !== "false";
};

const setCache = async (key, data, expiring = true, req = null) => {
  if (!isCacheEnabled(req)) {
    log(`Cache set skipped for ${key}: caching disabled`, "info");
    return false;
  }
  if (data == null) {
    log(`Cache set skipped for ${key}: empty payload`, "info");
    return false;
  }
  try {
    const client = await getCacheMem();
    if (!client) return false;
    const prefixed = _cachePrefix(key);
    const serialized = JSON.stringify(data);
    const result = expiring === true
      ? await client.set(prefixed, serialized, { EX: CACHE_EXPIRE_TIME })
      : typeof expiring === "number"
        ? await client.set(prefixed, serialized, { EX: expiring })
        : await client.set(prefixed, serialized);
    log(`Cache set: ${key} -> ${prefixed} (${typeof expiring === "number" ? expiring : CACHE_EXPIRE_TIME}s)`, "info");
    return result;
  } catch (er) {
    log(`Cache set failed for ${key}: ${er.message || er}`, "bad");
    return false;
  }
};

const getCache = async (key, req = null) => {
  if (!isCacheEnabled(req)) {
    log(`Cache get skipped for ${key}: caching disabled`, "info");
    return null;
  }
  if (!key) return null;
  try {
    const client = await getCacheMem();
    if (!client) return null;
    const prefixed = _cachePrefix(key);
    const data = await client.get(prefixed);
    if (!data) {
      log(`Cache miss: ${key} (${prefixed})`, "info");
      return null;
    }
    try {
      const parsed = JSON.parse(data);
      log(`Cache hit: ${key} (${prefixed})`, "info");
      return parsed;
    } catch {
      log(`Cache hit: ${key} (${prefixed})`, "info");
      return data;
    }
  } catch (err) {
    log(`Cache get failed for ${key}: ${err.message || err}`, "bad");
    return null;
  }
};

/** Delete a single cache key */
const deleteCache = async (key) => {
  try {
    const client = await getCacheMem();
    if (!client) return false;
    const prefixed = _cachePrefix(key);
    const deleted = await client.del(prefixed);
    log(`Cache delete: ${key} (${prefixed}) -> ${deleted}`, "info");
    return deleted;
  } catch (err) {
    log(`Cache delete failed for ${key}: ${err.message || err}`, "bad");
    return false;
  }
};

/**
 * Flush all cache keys for this app instance (APP_NAME:APP_ID:*).
 * Called by admin "Flush Cache" button.
 */
const flushCache = async () => {
  try {
    const client = await getCacheMem();
    if (!client) return 0;
    const pattern = `${APP_NAME}:${APP_ID}:*`;
    let cursor = 0;
    let deleted = 0;
    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length) {
        await client.del(result.keys);
        deleted += result.keys.length;
      }
    } while (cursor !== 0);
    log(`Cache flushed — ${deleted} key(s) removed`, "info");
    return deleted;
  } catch (err) {
    log(`Cache flush failed: ${err.message}`, "bad");
    return 0;
  }
};

/**
 * Check cache first; on miss call notFoundCb, store result, return it.
 * Skips cache entirely when caching is disabled.
 *
 * @param {string}   key
 * @param {function} notFoundCb  async fn returning data or [data, ttlSeconds]
 * @param {object}   [req]       optional — for runtime cache-enabled check
 */
const checkCache = async (key, notFoundCb, req = null) => {
  try {
    if (isCacheEnabled(req)) {
      const cached = await getCache(key, req);
      if (cached != null) return cached;
    }
    if (!notFoundCb) return null;
    const result = await notFoundCb();
    const [freshData, expiring = true] = Array.isArray(result) ? result : [result];
    if (freshData != null) setCache(key, freshData, expiring, req);
    return freshData;
  } catch (err) {
    throw err;
  }
};



export {
  createToken,
  getTokenData,
  createMessageToken,
  verifyMessageToken,
  hash,
  compareHashes,
  composeMail,
  randomHash,
  readFile,
  writeFile,
  deleteFile,
  __dirname,
  path,
  uploadFile,
  rewriteFile,
  generateKey,
  setCookie,
  sanitizeInput,
  useLimiter,
  random,
  cacheMem,
  isCacheEnabled,
  checkCache,
  getCache,
  getCacheMem,
  setCache,
  deleteCache,
  flushCache,
  deleteCookie,
  generateUniqueId,
};
