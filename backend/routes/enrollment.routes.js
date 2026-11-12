import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { requireAuth } from '../middleware/auth.js';
import { initializePayment, verifyPayment } from '../services/payment.service.js';
import { hashPassword, signToken, randomToken, generateOrderNumber } from '../utils/helpers.js';
import env from '../config/env.js';

const router = express.Router();

// POST /api/enrollments/checkout
// Handles both auto-registration and payment init
router.post('/checkout', async (req, res, next) => {
  try {
    const { fullName, email, phone, courseId } = req.body;

    if (!fullName || !email || !phone || !courseId) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // 1. Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const tempPassword = randomToken(8);
      const hashed = await hashPassword(tempPassword);
      user = await User.create({
        fullName, email: email.toLowerCase(), phone, password: hashed
      });
      // In real app, email the tempPassword to the user here
    }

    // 2. Create pending enrollment
    const enrollment = await Enrollment.create({
      user: user._id,
      course: course._id,
      status: 'pending'
    });

    // 3. Initialize payment
    const reference = generateOrderNumber() + '-' + Date.now();
    const payment = await initializePayment({
      email: user.email,
      amount: course.price,
      reference,
      callbackUrl: `${env.appUrl}/account/academy?verify=${reference}`
    });

    // 4. Save payment record
    await Payment.create({
      reference,
      user: user._id,
      amount: course.price,
      currency: 'NGN',
      status: 'pending',
      type: 'enrollment',
      relatedId: enrollment._id
    });

    // Auto-login the user after they pay
    const token = signToken({ id: user._id });
    res.cookie(env.cookieName, token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ 
      success: true, 
      message: 'Redirecting to payment...', 
      data: { authorization_url: payment.authorization_url, reference } 
    });
  } catch (err) { next(err); }
});

// POST /api/enrollments/verify
router.post('/verify', async (req, res, next) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ success: false, message: 'Reference required' });

    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status === 'success') return res.json({ success: true, message: 'Already verified' });

    const verification = await verifyPayment(reference);
    if (verification.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    // Update Payment
    payment.status = 'success';
    await payment.save();

    // Update Enrollment
    await Enrollment.findByIdAndUpdate(payment.relatedId, { status: 'paid' });

    res.json({ success: true, message: 'Enrollment successful' });
  } catch (err) { next(err); }
});

// GET /api/enrollments/mine (customer only)
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id, status: 'paid' })
      .populate('course', 'title image duration telegramLink');
    res.json({ success: true, data: enrollments });
  } catch (err) { next(err); }
});

export default router;
