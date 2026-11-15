import express from 'express';
import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import InnovationRequest from '../models/InnovationRequest.js';
import Report from '../models/Report.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [orders, enrollments, requests, reports] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Enrollment.countDocuments({ user: userId, status: 'paid' }),
      InnovationRequest.countDocuments({ user: userId }),
      Report.countDocuments({ user: userId, status: 'pending' })
    ]);

    const recentOrders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(2);
    const recentEnrollments = await Enrollment.find({ user: userId, status: 'paid' })
      .populate('course', 'title')
      .sort({ updatedAt: -1 }).limit(2);
    const recentRequests = await InnovationRequest.find({ user: userId }).sort({ createdAt: -1 }).limit(2);

    const recentActivity = [
      ...recentOrders.map(o => ({ type: 'order', text: `Order #${o.orderNumber}`, date: o.createdAt })),
      ...recentEnrollments.map(e => ({ type: 'enrollment', text: `Enrolled in ${e.course?.title?.en || 'course'}`, date: e.updatedAt })),
      ...recentRequests.map(r => ({ type: 'request', text: `Project request #${r.requestNumber}`, date: r.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    res.json({
      success: true,
      data: {
        counts: { orders, courses: enrollments, requests, reports },
        recentActivity
      }
    });
  } catch (err) { next(err); }
});

export default router;
