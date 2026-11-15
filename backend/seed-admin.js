import { connectDB } from './config/db.js';
import User from './models/User.js';
import { hashPassword } from './utils/helpers.js';
import env from './config/env.js';
import mongoose from 'mongoose';

async function seed() {
  await connectDB();
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
  } else {
    const hashed = await hashPassword(env.admin.password || 'AdminPassword123!');
    await User.create({
      fullName: env.admin.name || 'Khalifa Aminu',
      email: env.admin.email || 'khalifa@opentech.ng',
      phone: '',
      password: hashed,
      role: 'admin',
      emailVerified: true,
      active: true
    });
    console.log('Admin account created:', env.admin.email);
  }
  mongoose.connection.close();
}
seed();
