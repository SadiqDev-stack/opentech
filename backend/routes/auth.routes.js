import express from 'express';
import { randomToken, hashPassword, comparePassword, signToken } from '../utils/helpers.js';
import { sendEmail } from '../services/email.service.js';
import { authLimiter } from '../middleware/rateLimit.js';
import validate from '../middleware/validate.js';
import validators from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';
import withDB from '../middleware/db.js';
import env from '../config/env.js';
import User from '../models/User.js';

const router = express.Router();

// Helper to safely send email without crashing the route
async function trySendEmail(options) {
  try { await sendEmail(options); } catch (err) { console.error('[email] Failed:', err.message); }
}

// ---------- REGISTER ----------
router.post('/register', authLimiter, validate(validators.auth.register), withDB(async (req, res, next) => {
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
}));

// ---------- LOGIN ----------
router.post('/login', authLimiter, validate(validators.auth.login), withDB(async (req, res, next) => {
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
}));

// ---------- LOGOUT ----------
router.post('/logout', (req, res) => { res.clearCookie(env.cookieName); res.json({ success: true, message: 'Logged out' }); });

// ---------- ME ----------
router.get('/me', requireAuth, (req, res) => res.json({ success: true, data: { user: req.user.toSafeJSON() } }));

// ---------- FORGOT PASSWORD ----------
router.post('/forgot-password', authLimiter, validate(validators.auth.forgotPassword), withDB(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) { await new Promise(r => setTimeout(r, 500)); return res.json({ success: true, message: 'If that email exists, it has been updated.' }); }
    user.password = await hashPassword(password);
    await user.save();
    await trySendEmail({ to: user.email, subject: 'Password Changed', text: 'Your password has been reset.' });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
}));

// ---------- ADMIN LOGIN (WITH AUTO-SEED) ----------
router.post('/admin-login', authLimiter, validate(validators.auth.login), withDB(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check if this email matches the .env admin email
    if (email.toLowerCase() !== env.admin.email.toLowerCase()) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // 2. Check if admin user exists in DB
    let user = await User.findOne({ email: email.toLowerCase() });

    // 3. If no admin exists, seed from .env
    if (!user) {
      const hashed = await hashPassword(env.admin.password);
      user = await User.create({
        fullName: env.admin.name,
        email: env.admin.email.toLowerCase(),
        phone: '',
        password: hashed,
        role: 'admin',
        emailVerified: true,
        active: true
      });
      console.log('✅ Admin auto-seeded from .env on first login');
    }

    // 4. Verify the password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    // 5. Generate verification token
    const token = randomToken(24);
    user.loginToken = token;
    user.loginTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // 6. Email the link (or log it if SMTP not configured)
    const verifyLink = `${env.appUrl}/api/auth/admin-verify?token=${token}`;
    await trySendEmail({ to: user.email, subject: 'Admin Login', text: `Click to verify: ${verifyLink}` });

    res.json({ success: true, message: 'Verification link sent to your email.' });
  } catch (err) { next(err); }
}));

// ---------- ADMIN VERIFY ----------
router.get('/admin-verify', withDB(async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.redirect(`${env.appUrl}/message?type=error&title=Invalid Link&text=No token provided.`);
    const user = await User.findOne({ loginToken: token, loginTokenExpires: { $gt: new Date() } });
    if (!user) return res.redirect(`${env.appUrl}/message?type=error&title=Link Expired&text=This login link is invalid or has expired.`);
    user.loginToken = null; user.loginTokenExpires = null; await user.save();
    const sessionToken = signToken({ id: user._id });
    res.cookie(env.cookieName, sessionToken, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(`${env.appUrl}/admin`);
  } catch (err) { next(err); }
}));

export default router;
