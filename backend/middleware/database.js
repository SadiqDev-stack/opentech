import { connectDB, mongoose } from '../config/db.js';
import env from '../config/env.js';

export async function ensureDatabase(req, res, next) {
  if (req.path === '/api/health' || req.path === '/api/uploads/signature') return next();
  try {
    if (!env.mongoUri) {
      return res.status(503).json({ success: false, message: 'Service is temporarily unavailable', data: null });
    }
    if (mongoose.connection.readyState !== 1) await connectDB();
    return next();
  } catch (err) {
    console.error(`[database] ${req.method} ${req.path}: ${err.message}`);
    return res.status(503).json({ success: false, message: 'Service is temporarily unavailable. Please try again shortly.', data: null });
  }
}
