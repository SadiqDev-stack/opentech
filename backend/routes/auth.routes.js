import express from 'express';
import { hashResetToken } from '../utils/security.js';
import { randomToken, hashPassword, comparePassword, signToken } from '../utils/helpers.js';
import { sendEmail } from '../services/email.service.js';
import { authLimiter } from '../middleware/rateLimit.js';
import validate from '../middleware/validate.js';
import validators from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';
import env from '../config/env.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', authLimiter, validate(validators.auth.register), async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const hashed = await hashPassword(password);
    const user = await User.create({ fullName, email: email.toLowerCase(), phone, password: hashed });

    const token = signToken({ id: user._id });
    res.cookie(env.cookieName, token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({ success: true, message: 'Account created', data: { user: user.toSafeJSON() } });
  } catch (err) { next(err); }
});

router.post('/login', authLimiter, validate(validators.auth.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.active) return res.status(403).json({ success: false, message: 'Account disabled' });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken({ id: user._id });
    res.cookie(env.cookieName, token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ success: true, message: 'Logged in', data: { user: user.toSafeJSON() } });
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => {
  res.clearCookie(env.cookieName);
  res.json({ success: true, message: 'Logged out' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    if (!env.smtp.host || !env.smtp.user) return res.status(503).json({ success: false, message: 'Password reset email is not configured. Please try again later.', data: null });
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required', data: null });
    }
    const user = await User.findOne({ email });
    if (user) {
      const token = randomToken(32);
      user.resetToken = hashResetToken(token);
      user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const link = `${env.appUrl}/forgot-password?token=${encodeURIComponent(token)}`;
      try { await sendEmail({ to: user.email, subject: 'Reset your OpenTech password', text: `Use this one-time link within 60 minutes to reset your password: ${link}` }); }
      catch (emailError) { user.resetToken = null; user.resetTokenExpires = null; await user.save(); throw emailError; }
    }
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.', data: null });
  } catch (err) { next(err); }
});

router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');
    if (!token || password.length < 6) {
      return res.status(400).json({ success: false, message: 'A valid reset link and a password of at least 6 characters are required', data: null });
    }
    const user = await User.findOne({ resetToken: hashResetToken(token), resetTokenExpires: { $gt: new Date() } }).select('+resetToken');
    if (!user) return res.status(400).json({ success: false, message: 'This reset link is invalid or expired. Request a new one.', data: null });
    user.password = await hashPassword(password);
    user.resetToken = null;
    user.resetTokenExpires = null;
    user.loginToken = null;
    user.loginTokenExpires = null;
    await user.save();
    return res.json({ success: true, message: 'Password updated. You can now log in.', data: null });
  } catch (err) { next(err); }
});

router.post('/admin-login', authLimiter, validate(validators.auth.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    const token = randomToken(24);
    user.loginToken = token;
    user.loginTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    if (!env.smtp.host || !env.smtp.user) {
      user.loginToken = null;
      user.loginTokenExpires = null;
      await user.save();
      return res.status(503).json({ success: false, message: 'Admin email verification is not configured. Please contact the site administrator.', data: null });
    }
    const verifyLink = `${env.appUrl}/api/auth/admin-verify?token=${encodeURIComponent(token)}`;
    await sendEmail({ to: user.email, subject: 'Admin Login', text: `Click to verify within 15 minutes: ${verifyLink}` });
    res.json({ success: true, message: 'Verification link sent to your email.' });
  } catch (err) { next(err); }
});

router.get('/admin-verify', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.redirect(`${env.appUrl}/message?type=error&title=Invalid Link&text=No token provided.`);

    const user = await User.findOne({ loginToken: token, loginTokenExpires: { $gt: new Date() } });
    if (!user) return res.redirect(`${env.appUrl}/message?type=error&title=Link Expired&text=This login link is invalid or has expired.`);

    user.loginToken = null;
    user.loginTokenExpires = null;
    await user.save();

    const sessionToken = signToken({ id: user._id });
    res.cookie(env.cookieName, sessionToken, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.redirect(`${env.appUrl}/admin`);
  } catch (err) { next(err); }
});

export default router;
