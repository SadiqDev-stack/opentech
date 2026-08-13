import { log } from "./logger.js";
import { AppError } from "./logger.js";
import Log from "../models/log.js";

export default async (req, res, next) => {
  if (req.path.includes("/api/")) {
    if (req.err && !req.message) {
      if (req.err instanceof AppError) {
        req.message = req.err.message
      } else {
        req.message = "something went wrong internally try again, if issues persist please report!";
      }
    }

    // Persist unhandled errors to the Log collection
    if (req.err) {
      log(req.err, "bad");
      try {
        await Log.create({
          type: "error",
          event: "unhandled_api_error",
          payload: {
            method: req.method,
            url: req.originalUrl,
            user: req.user ? { id: req.user._id, email: req.user.email } : null,
            message: req.err?.message ?? String(req.err),
            name: req.err?.name,
            stack: req.err?.stack,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (_) {
        // Swallow — we never want logging to crash the error handler
      }
    }

    const message = req.message || 'Api route not found';
    res.status(404).json({
      message,
      success: false
    })
  } else {
    res.redirect("/")
  }
}