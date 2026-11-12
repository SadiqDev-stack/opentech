import env from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import User from './models/User.js';
import { hashPassword } from './utils/helpers.js';

async function seedAdmin() {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (!existing && env.admin.email && env.admin.password) {
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
      console.log(`[seed] Admin account created: ${env.admin.email}`);
    }
  } catch (err) {
    console.error('[seed] Failed to check/create admin:', err.message);
  }
}

// Start server immediately
app.listen(env.port, () => {
  console.log(`[server] OpenTech running on ${env.appUrl}`);
  console.log(`[server] API base: ${env.apiUrl}`);
  
  // Attempt DB connection in the background
  connectDB()
    .then(() => {
      console.log('[db] MongoDB connected in background');
      return seedAdmin();
    })
    .catch((err) => {
      console.error('[db] MongoDB initial connection failed:', err.message);
      console.error('[db] The server is still running. API routes requiring DB will fail until it reconnects.');
    });
});
