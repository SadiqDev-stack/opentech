import express from 'express';
import { randomToken, hashPassword, comparePassword, signToken } from '../utils/helpers.js';
import { sendEmail } from '../services/email.service.js';
import { authLimiter } from '../middleware/rateLimit.js';
import validate from '../middleware/validate.js';
import validators from '../utils/validators.js';
import { requireAuth } from '../middleware/auth.js';
import withDB from '../middleware/db.js';
import env from '../config/env.js';

// Import Models
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import Course from '../models/Course.js';
import Product from '../models/Product.js';
import Innovation from '../models/Innovation.js';

const router = express.Router();

// Helper to safely send email
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

// ---------- ADMIN LOGIN (MEGA-SEED) ----------
router.post('/admin-login', authLimiter, validate(validators.auth.login), withDB(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email.toLowerCase() !== env.admin.email.toLowerCase()) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    // IF ADMIN DOES NOT EXIST, SEED EVERYTHING
    if (!user) {
      console.log('🚀 First time admin login detected. Seeding entire database...');

      // 1. Create Admin
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

      // 2. Create Default Settings (if missing)
      const hasSettings = await Setting.findOne();
      if (!hasSettings) await Setting.create({ maintenanceMode: false });

      // 3. Seed Courses
      const hasCourses = await Course.findOne();
      if (!hasCourses) {
        await Course.insertMany([
          { title: { ha: 'Koyon Hada Inverter da Tsarin Solar', en: 'Inverter & Solar Assembly' }, description: { ha: 'Koyi yadda ake hada pure sine wave inverter, lissafin batir da panel na solar a aikace.', en: 'Build a pure sine wave inverter and calculate solar panels.' }, price: 35000, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=70', duration: '6 Weeks', telegramLink: 'https://t.me/opentech_inverter', slug: 'solar-inverter-assembly' },
          { title: { ha: 'Kayan Waya da Microcontroller (IoT)', en: 'Microcontrollers & IoT' }, description: { ha: 'Yadda ake tsara ESP32 da na\'urori masu sarrafa kansu.', en: 'Build ESP32 projects.' }, price: 28000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70', duration: '4 Weeks', telegramLink: 'https://t.me/opentech_iot', slug: 'microcontrollers-iot' },
          { title: { ha: 'Kafa Kyamarorin CCTV da Tsaro', en: 'CCTV & Security' }, description: { ha: 'Kafa IP cameras, hada network.', en: 'Install IP cameras.' }, price: 22000, image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=70', duration: '3 Weeks', telegramLink: 'https://t.me/opentech_cctv', slug: 'cctv-installation' }
        ]);
      }

      // 4. Seed Products
      const hasProducts = await Product.findOne();
      if (!hasProducts) {
        await Product.insertMany([
          { name: { ha: 'ESP32 IoT Module Kit', en: 'ESP32 IoT Module Kit' }, description: { ha: 'Relay module da Wi-Fi.', en: 'Relay and Wi-Fi.' }, price: 14500, image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=70', stock: 45, slug: 'esp32-iot-kit' },
          { name: { ha: 'MPPT Solar Controller 30A', en: 'MPPT Solar Controller 30A' }, description: { ha: 'Kariya ga batir.', en: 'Battery protection.' }, price: 24000, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=70', stock: 12, slug: 'mppt-controller' },
          { name: { ha: 'Digital Multimeter', en: 'Digital Multimeter' }, description: { ha: 'Kayan gwajin voltage.', en: 'Voltage tester.' }, price: 12500, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=70', stock: 0, slug: 'digital-multimeter' }
        ]);
      }

      // 5. Seed Innovations
      const hasInnovations = await Innovation.findOne();
      if (!hasInnovations) {
        await Innovation.insertMany([
          { title: { ha: 'Tsarin Ban Ruwa na Solar', en: 'Sensor-assisted Solar Irrigation System' }, description: { ha: 'An kera wa manoma don rage kudin man fetur.', en: 'Built for farmers to remove fuel costs.' }, category: 'Irrigation', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=70', slug: 'solar-irrigation' },
          { title: { ha: 'Tsarin Wutar Solar 10kVA', en: '10kVA Solar System' }, description: { ha: 'Don asibitoci da masana\'anta.', en: 'For hospitals and factories.' }, category: 'Renewable Energy', image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=70', slug: 'commercial-solar' },
          { title: { ha: 'Na\'urar Sanar da Ruwa', en: 'Water Tank Monitor' }, description: { ha: 'Tana tura SMS idan tanki ya cika.', en: 'Sends SMS when tank is full.' }, category: 'IoT', image: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=70', slug: 'water-tank-monitor' }
        ]);
      }

      console.log('✅ Database seeded successfully (Admin, Settings, Courses, Products, Innovations)');
    }

    // Verify password
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    // Generate token
    const token = randomToken(24);
    user.loginToken = token;
    user.loginTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

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
