import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Log from './models/log.js';
import dotenv from 'dotenv';
// load env
dotenv.config();

// ======================
// Process-level error guards
// Must be registered as early as possible so they cover the full
// lifetime of the process, including startup and async work outside
// of any request cycle.
// ======================

/**
 * Persist an unexpected error to the Log collection.
 * Wrapped in its own try/catch so a DB failure never causes a second
 * uncaught exception.
 */
async function persistCrashLog(origin, error) {
  try {
    const connection = await connectToDatabase();
    if (!connection) {
      console.error("[crash-logger] db unavailable, skipped log persistence for:", origin);
      return;
    }

    await Log.create({
      type: "error",
      event: origin,
      payload: {
        message: error?.message ?? String(error),
        name: error?.name,
        stack: error?.stack,
      },
      error: error?.message ?? String(error),
    });
  } catch (dbErr) {
    console.error("[crash-logger] failed to persist crash log:", dbErr?.message);
  }
}

// Synchronous throw that escaped every try/catch
process.on("uncaughtException", (error) => {
  console.error("\n[uncaughtException] Unhandled synchronous error — this should never happen in production:\n", error);
  persistCrashLog("uncaughtException", error);
  // Give persistCrashLog ~2 s to finish before the mandatory exit.
  // Node.js docs recommend exiting after uncaughtException because
  // the process may be in an undefined state.
  setTimeout(() => process.exit(1), 2000).unref();
});

// Rejected promise with no .catch() / try-catch
process.on("unhandledRejection", (reason, promise) => {
  console.error("\n[unhandledRejection] Unhandled promise rejection:\n", reason);
  persistCrashLog("unhandledRejection", reason instanceof Error ? reason : new Error(String(reason)));
  // Do NOT exit on unhandledRejection — most are non-fatal in a web
  // server context. Log and continue serving requests.
});

import { templates } from "./services/mail.js";
import { DB_URI, dbHandler, connectToDatabase } from "./middlewares/dbhandler.js";
import errorHandler from "./middlewares/error.js";
import { logger, log, FrontendURL } from "./middlewares/logger.js";

import { getCache, getCacheMem, useLimiter } from "./utilities/general.js";

// Rate limiters for different endpoint types
const authLimiter = useLimiter("1m", 50); // Strict for auth endpoints
const generalLimiter = useLimiter("1m", 50); // General API endpoints
const chatLimiter = useLimiter("1m", 100); // Higher for chat operations
const adminLimiter = useLimiter("1m", 30); // Stricter for admin operations
const publicLimiter = useLimiter("1m", 100); // Public endpoints

import userRouter from "./routes/user.js";
import storeRouter from "./routes/store.js";
import botRouter from "./routes/bot.js";
import chatRouter from "./routes/chat.js";
import orderRouter from "./routes/order.js";
import notificationRouter from "./routes/notification.js";
import statRouter from "./routes/stat.js";
import logRouter from "./routes/log.js";
import paymentRouter from "./routes/payment.js";
import adminRouter from "./routes/admin/central.js";
import cloudRouter from './routes/cloud.js';
import whatsappRouter from './routes/whatsapp.js'
import { adminConfigController } from './controllers/admin/configController.js';
import startCronJobs from './services/cronScheduler.js';

// import assistantRouter from './routes/assistant.js';

const app = express();

const { PORT = 8080, NODE_ENV = "development" } = process.env;

mongoose.set("bufferCommands", false);

// ======================
// Middlewares
// ======================

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://busypilot.vercel.app",
  "https://busypilot.vercel.app/",
  "https://www.busypilot.vercel.app",
  "https://busypilot.vercel.app",
  process.env.FRONTEND_LIVE_URI,
  "localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(logger);

// ======================
// Auto auth redirect
// ======================

app.use((req, res, next) => {
  const { token = false } = req.cookies;

  const isAuthPage = req.url === "/auth.html";
  const isDashboardPage = req.path.includes("/dashboard/");

  if (token && isAuthPage) {
    return res.redirect("/user/dashboard.html");
  }

  if (!token && isDashboardPage) {
    return res.redirect("/auth.html");
  }

  next();
});

// check health
app.get("/", (req, res) => {
  res.json({
    message: "server is alive and running successfully",
  });
});

// ======================
// API Routes
// ======================

app.use("/api/user/logout", userRouter); // logout dont need db connection
app.use(dbHandler);

// Chat endpoints - higher rate limit for active conversations
app.use("/api/chat", chatLimiter, chatRouter);

// Admin endpoints - stricter rate limit
app.use("/api/admin", adminLimiter, adminRouter);
app.use("/api/logs", adminLimiter, logRouter);

// General API endpoints - moderate rate limit (routes without internal rate limiting)
app.use("/api/bot", generalLimiter, botRouter);
app.use("/api/order", generalLimiter, orderRouter);

// Public endpoints - no auth required
app.get("/api/public/config", publicLimiter, adminConfigController.getPublicConfig);

// Message token endpoint — resolves a short-lived JWT into page data (no auth, no DB)
import { verifyMessageToken } from "./utilities/general.js";
app.get("/api/public/message-token", publicLimiter, (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ success: false, message: "Token required" });
  const data = verifyMessageToken(token);
  if (!data) return res.status(410).json({ success: false, message: "expired" });
  res.json({ success: true, data });
});

// Routes with mixed public/authenticated endpoints - rate limiting applied within route files
app.use("/api/user", userRouter);
app.use("/api/store", storeRouter);
app.use("/api/stats", statRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/whatsapp", whatsappRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/cloud", cloudRouter);

// app.use('/api/assistant', assistantRouter);

// ======================
// Error Handler
// ======================

/**
 * Express 4-argument error middleware.
 * Catches anything passed via next(err) or thrown inside a synchronous
 * route/middleware that Express itself intercepts. These are errors that
 * bypass every controller's own try/catch — things like:
 *   - JSON body-parser parse errors
 *   - CORS rejections thrown as errors
 *   - Middleware that calls next(new Error(...))
 *   - Any synchronous throw inside a non-async handler
 */
app.use(async (err, req, res, next) => {
  const status = err?.status ?? err?.statusCode ?? 500;
  const message = err?.message ?? "An unexpected error occurred";

  console.error(`\n[expressErrorHandler] ${req.method} ${req.originalUrl} — ${status}: ${message}\n`, err);

  // Persist to Log collection for later inspection
  try {
    const connection = await connectToDatabase();
    if (!connection) {
      console.error("[expressErrorHandler] db unavailable, skipped log persistence for:", req.originalUrl);
      return;
    }

    await Log.create({
      type: "error",
      event: "express_error_handler",
      payload: {
        method: req.method,
        url: req.originalUrl,
        statusCode: status,
        message,
        name: err?.name,
        stack: err?.stack,
        body: req.body,
      },
      error: message,
    });
  } catch (dbErr) {
    console.error("[expressErrorHandler] failed to persist log:", dbErr?.message);
  }

  if (res.headersSent) return next(err);

  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : message,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
   getCacheMem();
  log(`Server running on  http://localhost:${PORT}`);
  startCronJobs();
});

export { app };
export default app;
