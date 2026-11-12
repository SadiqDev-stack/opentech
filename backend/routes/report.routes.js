import express from 'express';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { sendEmail } from '../services/email.service.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { generateReportNumber } from '../utils/helpers.js';

const router = express.Router();

// POST /api/reports (customer only)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { subject, category, description, attachmentUrl } = req.body;
    if (!subject || !category || !description) {
      return res.status(400).json({ success: false, message: 'Subject, category and description are required' });
    }

    const reportNumber = generateReportNumber();
    const report = await Report.create({
      reportNumber,
      user: req.user._id,
      subject,
      category,
      description,
      attachmentUrl: attachmentUrl || '',
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Report submitted', data: report });
  } catch (err) { next(err); }
});

// GET /api/reports/mine (customer only)
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
});

// PUT /api/reports/:id (admin only)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse },
      { new: true }
    );
    
  } catch (err) { next(err); }
});

export default router;
