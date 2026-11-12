import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import { verifyWebhookSignature } from '../services/payment.service.js';
import { sendEmail } from '../services/email.service.js';

const router = express.Router();

// POST /api/webhooks/paystack
router.post('/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const rawBody = req.body.toString();

    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(rawBody);
    if (event.event !== 'charge.success') return res.sendStatus(200);

    const { reference, amount, currency } = event.data;
    
    // Idempotency check
    const payment = await Payment.findOne({ reference });
    if (!payment || payment.status === 'success') return res.sendStatus(200);

    // Verify amount (Paystack sends in kobo)
    if (Number(amount) !== payment.amount * 100) {
      console.error('[webhook] Amount mismatch');
      return res.status(400).send('Amount mismatch');
    }

    payment.status = 'success';
    await payment.save();

    if (payment.type === 'enrollment') {
      await Enrollment.findByIdAndUpdate(payment.relatedId, { status: 'paid' });
    } else if (payment.type === 'order') {
      const order = await Order.findById(payment.relatedId);
      order.paymentStatus = 'paid';
      order.deliveryStatus = 'processing';
      await order.save();
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }
    }

    // Fire and forget email
    if (payment.user) {
      sendEmail({
        to: 'customer@example.com', // In production, fetch user email
        subject: 'Payment Confirmed',
        text: `Your payment of N${payment.amount} was successful. Ref: ${reference}`
      }).catch(console.error);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[webhook] Error:', err);
    res.sendStatus(500);
  }
});

export default router;
