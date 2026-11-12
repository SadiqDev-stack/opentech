import { connectDB, mongoose } from '../config/db.js';

// Wraps a route to ensure it connects to DB before running
export default function withDB(handler) {
  return async function (req, res, next) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
      return handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
