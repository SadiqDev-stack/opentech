import Setting from '../models/Setting.js';
import { verifyToken } from '../utils/helpers.js';
import env from '../config/env.js';
import User from '../models/User.js';

export async function checkMaintenance(req, res, next) {
  // ONLY check for API routes. Static files (HTML, CSS, JS) load instantly.
  if (!req.path.startsWith('/api')) return next();

  // Whitelist essential API routes (auth, admin, settings)
  if (
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/admin') ||
    req.path.startsWith('/api/settings') ||
    req.path.startsWith('/api/payments/webhook') ||
    req.path === '/api/health'
  ) {
    return next();
  }

  try {
    const setting = await Setting.findOne();
    if (!setting || !setting.maintenanceMode) return next();

    // Check if user is admin
    const token = req.cookies[env.cookieName];
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') return next();
      } catch {}
    }

    // Block with JSON response
    res.status(503).json({
      success: false,
      message: 'The site is currently under maintenance. Please check back soon.',
      data: null
    });
  } catch (err) {
    next();
  }
}
