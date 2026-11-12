import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Innovation from '../models/Innovation.js';
import InnovationRequest from '../models/InnovationRequest.js';
import Report from '../models/Report.js';
import { requireAdmin } from '../middleware/auth.js';
import { hashPassword, generateTempPassword } from '../utils/helpers.js';
import { sendEmail } from '../services/email.service.js';
import { sendSMS } from '../services/sms.service.js';

const router = express.Router();
router.use(requireAdmin);

// Stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, orders, enrollments, innovations, pendingOrders, pendingRequests, unresolvedReports] = await Promise.all([
      User.countDocuments(), Order.countDocuments(), Enrollment.countDocuments({ status: 'paid' }),
      Innovation.countDocuments(), Order.countDocuments({ paymentStatus: 'paid', deliveryStatus: 'pending' }),
      InnovationRequest.countDocuments({ status: 'submitted' }), Report.countDocuments({ status: 'pending' })
    ]);
    res.json({ success: true, data: { users, orders, enrollments, innovations, pendingOrders, pendingRequests, unresolvedReports } });
  } catch (err) { next(err); }
});

// Orders
router.get('/orders', async (req, res, next) => {
  try { const orders = await Order.find().populate('user', 'fullName email phone').sort({ createdAt: -1 }); res.json({ success: true, data: orders }); } catch (err) { next(err); }
});

router.put('/orders/:id', async (req, res, next) => {
  try {
    const { deliveryStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { deliveryStatus }, { new: true }).populate('user', 'email');
    if (order && order.user) sendEmail({ to: order.user.email, subject: 'Order Update', text: `Order #${order.orderNumber} is now ${deliveryStatus}.` }).catch(console.error);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// Enrollments
router.get('/enrollments', async (req, res, next) => {
  try { const e = await Enrollment.find().populate('user', 'fullName email').populate('course', 'title').sort({ createdAt: -1 }); res.json({ success: true, data: e }); } catch (err) { next(err); }
});

// Products
router.post('/products', async (req, res, next) => {
  try {
    const { name, description, price, image, stock } = req.body;
    const slug = name.en.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const product = await Product.create({ name, description, price, image, stock, slug });
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const { name, description, price, image, stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { name, description, price, image, stock }, { new: true });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

router.delete('/products/:id', async (req, res, next) => {
  try { await Product.findByIdAndUpdate(req.params.id, { archived: true }); res.json({ success: true }); } catch (err) { next(err); }
});

// Innovations
router.post('/innovations', async (req, res, next) => {
  try {
    const { title, description, category, image } = req.body;
    const slug = title.en.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const innovation = await Innovation.create({ title, description, category, image, slug });
    res.status(201).json({ success: true, data: innovation });
  } catch (err) { next(err); }
});

router.put('/innovations/:id', async (req, res, next) => {
  try {
    const { title, description, category, image } = req.body;
    const innovation = await Innovation.findByIdAndUpdate(req.params.id, { title, description, category, image }, { new: true });
    res.json({ success: true, data: innovation });
  } catch (err) { next(err); }
});

router.delete('/innovations/:id', async (req, res, next) => {
  try { await Innovation.findByIdAndUpdate(req.params.id, { archived: true }); res.json({ success: true }); } catch (err) { next(err); }
});

// Requests
router.get('/requests', async (req, res, next) => {
  try { const r = await InnovationRequest.find().populate('user', 'fullName email').sort({ createdAt: -1 }); res.json({ success: true, data: r }); } catch (err) { next(err); }
});
router.put('/requests/:id', async (req, res, next) => {
  try { const r = await InnovationRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); res.json({ success: true, data: r }); } catch (err) { next(err); }
});

// Users
router.get('/users', async (req, res, next) => {
  try { const u = await User.find().sort({ createdAt: -1 }); res.json({ success: true, data: u.map(x => x.toSafeJSON()) }); } catch (err) { next(err); }
});
router.put('/users/:id/role', async (req, res, next) => {
  try { const u = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }); res.json({ success: true, data: u.toSafeJSON() }); } catch (err) { next(err); }
});
router.put('/users/:id/status', async (req, res, next) => {
  try { const u = await User.findByIdAndUpdate(req.params.id, { active: req.body.active }, { new: true }); res.json({ success: true, data: u.toSafeJSON() }); } catch (err) { next(err); }
});
router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const tempPassword = generateTempPassword();
    const hashed = await hashPassword(tempPassword);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true });
    if (user) sendEmail({ to: user.email, subject: 'Password Reset', text: `Your temporary password is: ${tempPassword}` }).catch(console.error);
    res.json({ success: true, data: { tempPassword } });
  } catch (err) { next(err); }
});

// Reports
router.get('/reports', async (req, res, next) => {
  try { const r = await Report.find().populate('user', 'fullName email').sort({ createdAt: -1 }); res.json({ success: true, data: r }); } catch (err) { next(err); }
});

// BROADCAST (Max 100 per day, tracked in memory for simplicity)
const broadcastLimits = new Map(); // ip -> { count, date }
router.post('/broadcast', async (req, res, next) => {
  try {
    const { channel, message } = req.body;
    const ip = req.ip;
    const today = new Date().toISOString().split('T')[0];
    const limitData = broadcastLimits.get(ip) || { count: 0, date: today };

    if (limitData.date !== today) { limitData.count = 0; limitData.date = today; }
    if (limitData.count >= 100) return res.status(429).json({ success: false, message: 'Daily limit of 100 broadcasts reached. Try again tomorrow.' });

    // Send to the first 100 users only to stay safe
    const users = await User.find({ active: true }).limit(100);
    let sent = 0;
    for (const u of users) {
      try {
        if (channel === 'email') await sendEmail({ to: u.email, subject: 'OpenTech Update', text: message });
        else if (channel === 'sms') await sendSMS(u.phone, message);
        sent++;
      } catch (err) { console.error('Broadcast fail for', u.email, err.message); }
    }

    limitData.count += sent;
    broadcastLimits.set(ip, limitData);

    res.json({ success: true, message: `Broadcast sent to ${sent} users. ${100 - limitData.count} remaining today.` });
  } catch (err) { next(err); }
});

export default router;
