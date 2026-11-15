import express from 'express';
import Setting from '../models/Setting.js';
import { requireAdmin } from '../middleware/auth.js';
import env from '../config/env.js';

const router = express.Router();

router.get('/status', async (req, res) => {
  res.json({ success: true, data: { paystack: !!env.paystack.secretKey, cloudinary: !!env.cloudinary.apiSecret, ebulksms: !!env.sms.apiKey, smtp: !!env.smtp.host } });
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    let s = await Setting.findOne();
    if (!s) s = await Setting.create({});
    res.json({ success: true, data: s });
  } catch (err) { next(err); }
});

router.put('/', requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['maintenanceMode','paystackPublicKey','paystackSecretKey','cloudinaryCloudName','cloudinaryApiKey','cloudinaryApiSecret','ebulkSmsUsername','ebulkSmsApiKey','smtpHost','smtpPort','smtpUser','smtpPass'];
    let s = await Setting.findOne();
    if (!s) s = new Setting();
    allowed.forEach(k => { if (req.body[k] !== undefined) s[k] = req.body[k]; });
    await s.save();
    res.json({ success: true, data: s });
  } catch (err) { next(err); }
});

export default router;
