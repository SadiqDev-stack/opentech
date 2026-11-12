import { verifyToken } from '../utils/helpers.js';
import env from '../config/env.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[env.cookieName];
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.active) return res.status(401).json({ success: false, message: 'User not found or disabled' });
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
}
