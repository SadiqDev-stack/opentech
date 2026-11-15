import express from 'express';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import env from '../config/env.js';

const router = express.Router();

// GET /api/payments/mock-checkout?reference=XXX
router.get('/mock-checkout', async (req, res, next) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.send('Invalid reference');

    const payment = await Payment.findOne({ reference });
    if (!payment) return res.send('Payment record not found');

    payment.status = 'success';
    await payment.save();

    if (payment.type === 'enrollment') {
      await Enrollment.findByIdAndUpdate(payment.relatedId, { status: 'paid' });
      res.redirect(`${env.appUrl}/account/academy?verify=${reference}`);
    } else if (payment.type === 'order') {
      const order = await Order.findById(payment.relatedId);
      order.paymentStatus = 'paid';
      order.deliveryStatus = 'processing';
      await order.save();
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
      res.redirect(`${env.appUrl}/account/orders?verify=${reference}`);
    } else {
      res.send('Unknown payment type');
    }
  } catch (err) { next(err); }
});

export default router;
