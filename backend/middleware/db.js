import { connectDB, mongoose } from '../config/db.js';

function withDB(handler) {
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

export default withDB;
