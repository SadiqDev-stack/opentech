import express from 'express';
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

router.post('/forgot-password', authLimiter, validate(validators.auth.forgotPassword), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      await new Promise(r => setTimeout(r, 500));
      return res.json({ success: true, message: 'If that email exists, it has been updated.' });
    }

    user.password = await hashPassword(password);
    await user.save();

    await sendEmail({ to: user.email, subject: 'Password Changed', text: `Your password has been reset.` });

    res.json({ success: true, message: 'Password updated successfully' });
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

    const verifyLink = `${env.appUrl}/api/auth/admin-verify?token=${token}`;
    await sendEmail({ to: user.email, subject: 'Admin Login', text: `Click to verify: ${verifyLink}` });

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
