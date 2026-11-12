import env from './config/env.js';
import { connectDB, mongoose } from './config/db.js';
import app from './app.js';

import User from './models/User.js';
import { hashPassword } from './utils/helpers.js';

let seeded = false;

async function seedAdmin() {
  if (seeded) return;
  if (!env.admin.email || !env.admin.password) {
    console.warn('[seed] ADMIN_EMAIL or ADMIN_PASSWORD missing in .env, skipping admin seed');
    seeded = true;
    return;
  }
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('[seed] Admin account already exists');
      seeded = true;
      return;
    }
    const hashed = await hashPassword(env.admin.password);
    await User.create({
      fullName: env.admin.name,
      email: env.admin.email.toLowerCase(),
      phone: '',
      password: hashed,
      role: 'admin',
      emailVerified: true,
      active: true
    });
    console.log(`[seed] Admin account created for ${env.admin.email}`);
    seeded = true;
  } catch (err) {
    console.error('[seed] Failed to seed admin:', err.message);
  }
}

async function tryConnectAndSeed() {
  try {
    await connectDB();
    await seedAdmin();
  } catch (err) {
    console.error('[db] Initial connection failed (server will still run):', err.message);
  }
}

mongoose.connection.on('connected', () => {
  seedAdmin().catch(() => {});
});

// ---------- LOCAL: listen on a port ----------
function startLocal() {
  app.listen(env.port, () => {
    console.log(`[server] OpenTech running on ${env.appUrl}`);
    console.log(`[server] API base: ${env.apiUrl}`);
  });
  tryConnectAndSeed();
}

// ---------- VERCEL: export the app ----------
// Vercel imports this file and treats the default export as the request handler.
// The DB is not connected at import time; `withDB` middleware connects on demand,
// which is the correct serverless pattern.
export default async function handler(req, res) {
  // Non-blocking: kick off a connection attempt so the first request is warm,
  // but do not await it here (serverless would time out on cold DB).
  tryConnectAndSeed();
  return app(req, res);
}

// Only start a listener when running directly (node backend/server.js),
// not when imported by Vercel.
const isDirectRun =
  process.argv[1] && process.argv[1].endsWith('server.js') && !process.env.VERCEL;

if (isDirectRun) {
  startLocal();
}
