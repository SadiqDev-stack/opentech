import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword, comparePassword } from '../utils/helpers.js';

const router = express.Router();

// PUT /api/users/profile
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone },
      { new: true }
    );
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (err) { next(err); }
});

// PUT /api/users/password
router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid current and new passwords required (min 6 chars)' });
    }

    const user = await User.findById(req.user._id);
    const match = await comparePassword(currentPassword, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

export default router;
