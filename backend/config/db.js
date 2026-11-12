import mongoose from 'mongoose';
import env from './env.js';

mongoose.set('strictQuery', true);

let connecting = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;

  connecting = mongoose
    .connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      console.log('[db] MongoDB connected');
      return mongoose.connection;
    })
    .catch((err) => {
      console.error('[db] MongoDB connection failed:', err.message);
      connecting = null;
      throw err;
    });

  return connecting;
}

export { mongoose };
