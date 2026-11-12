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

const router = express.Router();

// All routes require admin
router.use(requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, orders, enrollments, innovations, pendingOrders, pendingRequests, unresolvedReports] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Enrollment.countDocuments({ status: 'paid' }),
      Innovation.countDocuments(),
      Order.countDocuments({ paymentStatus: 'paid', deliveryStatus: 'pending' }),
      InnovationRequest.countDocuments({ status: 'submitted' }),
      Report.countDocuments({ status: 'pending' })
    ]);
    res.json({ success: true, data: { users, orders, enrollments, innovations, pendingOrders, pendingRequests, unresolvedReports } });
  } catch (err) { next(err); }
});

// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'fullName email phone').sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

// PUT /api/admin/orders/:id
router.put('/orders/:id', async (req, res, next) => {
  try {
    const { deliveryStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { deliveryStatus }, { new: true });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
});

// GET /api/admin/enrollments
router.get('/enrollments', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find().populate('user', 'fullName email phone').populate('course', 'title').sort({ createdAt: -1 });
    res.json({ success: true, data: enrollments });
  } catch (err) { next(err); }
});

// GET /api/admin/requests
router.get('/requests', async (req, res, next) => {
  try {
    const requests = await InnovationRequest.find().populate('user', 'fullName email phone').sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
});

// PUT /api/admin/requests/:id
router.put('/requests/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await InnovationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: request });
  } catch (err) { next(err); }
});

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users.map(u => u.toSafeJSON()) });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { active } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { active }, { new: true });
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (err) { next(err); }
});

// GET /api/admin/reports
router.get('/reports', async (req, res, next) => {
  try {
    const reports = await Report.find().populate('user', 'fullName email').sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
});

export default router;
