import Setting from '../models/Setting.js';
import { verifyToken } from '../utils/helpers.js';
import env from '../config/env.js';
import User from '../models/User.js';

export async function checkMaintenance(req, res, next) {
  // Skip for API, assets, and admin routes
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/admin') ||
    req.path.startsWith('/assets') ||
    req.path.startsWith('/css') ||
    req.path.startsWith('/js') ||
    req.path === '/admin-login' ||
    req.path === '/admin-login.html'
  ) {
    return next();
  }

  try {
    const setting = await Setting.findOne();
    if (!setting || !setting.maintenanceMode) return next();

    // Check if user is admin (via cookie)
    const token = req.cookies[env.cookieName];
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') return next();
      } catch {}
    }

    res.status(503).send(`
      <html><body style="background:#101010;color:#fff;font-family:sans-serif;text-align:center;padding:50px;">
      <h1>Under Maintenance</h1>
      <p>OpenTech is currently undergoing scheduled maintenance. Please check back soon.</p>
      </body></html>
    `);
  } catch (err) {
    next();
  }
}
