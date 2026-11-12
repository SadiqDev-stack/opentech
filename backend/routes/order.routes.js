import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { requireAuth } from '../middleware/auth.js';
import { initializePayment, verifyPayment } from '../services/payment.service.js';
import { hashPassword, signToken, randomToken, generateOrderNumber } from '../utils/helpers.js';
import env from '../config/env.js';

const router = express.Router();

// POST /api/orders/checkout
router.post('/checkout', async (req, res, next) => {
  try {
    const { fullName, email, phone, address, items } = req.body;
    // items: [{ productId, quantity }]

    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    // 1. Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const tempPassword = randomToken(8);
      const hashed = await hashPassword(tempPassword);
      user = await User.create({ fullName, email: email.toLowerCase(), phone, password: hashed });
    }

    // 2. Verify products and calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found`);
      if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name.en}`);
      
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name.en,
        price: product.price,
        quantity: item.quantity
      });
    }

    // 3. Create pending order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      user: user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress: address,
      paymentStatus: 'pending',
      deliveryStatus: 'pending'
    });

    // 4. Init Payment
    const reference = orderNumber + '-' + Date.now();
    const payment = await initializePayment({
      email: user.email,
      amount: totalAmount,
      reference,
      callbackUrl: `${env.appUrl}/account/orders?verify=${reference}`
    });

    await Payment.create({
      reference,
      user: user._id,
      amount: totalAmount,
      currency: 'NGN',
      status: 'pending',
      type: 'order',
      relatedId: order._id
    });

    const token = signToken({ id: user._id });
    res.cookie(env.cookieName, token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ success: true, data: { authorization_url: payment.authorization_url, reference } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/orders/verify
router.post('/verify', async (req, res, next) => {
  try {
    const { reference } = req.body;
    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status === 'success') return res.json({ success: true, message: 'Already verified' });

    const verification = await verifyPayment(reference);
    if (verification.status !== 'success') return res.status(400).json({ success: false, message: 'Payment failed' });

    payment.status = 'success';
    await payment.save();

    const order = await Order.findById(payment.relatedId);
    order.paymentStatus = 'paid';
    order.deliveryStatus = 'processing';
    await order.save();

    // Reduce stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (err) { next(err); }
});

// GET /api/orders/mine (customer only)
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
});

export default router;
