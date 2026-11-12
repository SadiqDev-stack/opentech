import express from 'express';
import Setting from '../models/Setting.js';
import { requireAdmin } from '../middleware/auth.js';
import env from '../config/env.js';

const router = express.Router();

// GET /api/settings/status (public - returns what is configured)
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    data: {
      paystack: !!env.paystack.secretKey,
      cloudinary: !!env.cloudinary.apiSecret,
      ebulkSms: !!env.sms.apiKey,
      smtp: !!env.smtp.host
    }
  });
});

// GET /api/settings (admin only)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({});
    res.json({ success: true, data: setting });
  } catch (err) { next(err); }
});

// PUT /api/settings (admin only)
router.put('/', requireAdmin, async (req, res, next) => {
  try {
    const { maintenanceMode } = req.body;
    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();
    if (maintenanceMode !== undefined) setting.maintenanceMode = maintenanceMode;
    await setting.save();
    res.json({ success: true, data: setting });
  } catch (err) { next(err); }
});

export default router;
