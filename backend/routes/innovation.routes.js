import express from 'express';
import Innovation from '../models/Innovation.js';
import InnovationRequest from '../models/InnovationRequest.js';
import User from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { slugify, generateRequestNumber, hashPassword, signToken, randomToken } from '../utils/helpers.js';
import env from '../config/env.js';

const router = express.Router();

// GET /api/innovations (public)
router.get('/', async (req, res, next) => {
  try {
    const { search, limit } = req.query;
    let query = { archived: false };
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.ha': { $regex: search, $options: 'i' } }
      ];
    }
    let queryBuilder = Innovation.find(query).sort({ createdAt: -1 });
    if (limit) queryBuilder = queryBuilder.limit(Number(limit));
    
    const innovations = await queryBuilder;
    res.json({ success: true, data: innovations });
  } catch (err) { next(err); }
});

// GET /api/innovations/:slug (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const innovation = await Innovation.findOne({ slug: req.params.slug, archived: false });
    if (!innovation) return res.status(404).json({ success: false, message: 'Innovation not found' });
    res.json({ success: true, data: innovation });
  } catch (err) { next(err); }
});

// POST /api/innovations (admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, category, image } = req.body;
    const slug = slugify(title.en || title.ha) + '-' + Date.now().toString().slice(-4);
    const innovation = await Innovation.create({ title, description, category, image, slug });
    res.status(201).json({ success: true, data: innovation });
  } catch (err) { next(err); }
});

// POST /api/innovations/requests (public/customer)
router.post('/requests', async (req, res, next) => {
  try {
    const { fullName, email, phone, title, description, budget, attachmentUrl } = req.body;
    if (!fullName || !email || !phone || !title || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const tempPassword = randomToken(8);
      const hashed = await hashPassword(tempPassword);
      user = await User.create({ fullName, email: email.toLowerCase(), phone, password: hashed });
    }

    const requestNumber = generateRequestNumber();
    const request = await InnovationRequest.create({
      requestNumber,
      user: user._id,
      title,
      description,
      budget: Number(budget) || 0,
      attachmentUrl: attachmentUrl || '',
      status: 'submitted'
    });

    const token = signToken({ id: user._id });
    res.cookie(env.cookieName, token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({ success: true, message: 'Request submitted', data: request });
  } catch (err) { next(err); }
});

// GET /api/innovations/requests/mine (customer only)
router.get('/requests/mine', requireAuth, async (req, res, next) => {
  try {
    const requests = await InnovationRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
});

// PUT /api/innovations/requests/:id (admin only - update status)
router.put('/requests/:id', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await InnovationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: request });
  } catch (err) { next(err); }
});

export default router;
