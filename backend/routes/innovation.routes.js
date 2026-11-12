import express from 'express';
import Innovation from '../models/Innovation.js';
import InnovationRequest from '../models/InnovationRequest.js';
import User from '../models/User.js';
import withDB from '../middleware/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { slugify, generateRequestNumber, hashPassword, signToken, randomToken } from '../utils/helpers.js';
import env from '../config/env.js';

const router = express.Router();

router.get('/', withDB(async (req, res, next) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;
    let query = { archived: false };
    if (search) query.$or = [{ 'title.en': { $regex: search, $options: 'i' } }, { 'title.ha': { $regex: search, $options: 'i' } }];

    const total = await Innovation.countDocuments(query);
    const innovations = await Innovation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: innovations, meta: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}));

router.get('/:slug', withDB(async (req, res, next) => {
  try {
    const innovation = await Innovation.findOne({ slug: req.params.slug, archived: false });
    if (!innovation) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: innovation });
  } catch (err) { next(err); }
}));

router.post('/', requireAdmin, withDB(async (req, res, next) => {
  try {
    const { title, description, category, image } = req.body;
    const slug = slugify(title.en) + '-' + Date.now();
    const innovation = await Innovation.create({ title, description, category, image, slug });
    res.status(201).json({ success: true, data: innovation });
  } catch (err) { next(err); }
}));

router.put('/:id', requireAdmin, withDB(async (req, res, next) => {
  try {
    const { title, description, category, image } = req.body;
    const innovation = await Innovation.findByIdAndUpdate(req.params.id, { title, description, category, image }, { new: true });
    res.json({ success: true, data: innovation });
  } catch (err) { next(err); }
}));

router.delete('/:id', requireAdmin, withDB(async (req, res, next) => {
  try {
    await Innovation.findByIdAndUpdate(req.params.id, { archived: true });
    res.json({ success: true, message: 'Archived' });
  } catch (err) { next(err); }
}));

// Requests
router.post('/requests', withDB(async (req, res, next) => {
  try {
    const { fullName, email, phone, title, description, budget, attachmentUrl } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const tempPassword = randomToken(8);
      const hashed = await hashPassword(tempPassword);
      user = await User.create({ fullName, email: email.toLowerCase(), phone, password: hashed });
    }
    const requestNumber = generateRequestNumber();
    const request = await InnovationRequest.create({ requestNumber, user: user._id, title, description, budget: Number(budget) || 0, attachmentUrl: attachmentUrl || '', status: 'submitted' });
    const token = signToken({ id: user._id });
    res.cookie(env.cookieName, token, { httpOnly: true, secure: env.cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, data: request });
  } catch (err) { next(err); }
}));

router.get('/requests/mine', requireAuth, withDB(async (req, res, next) => {
  try {
    const requests = await InnovationRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
}));

router.put('/requests/:id', requireAdmin, withDB(async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await InnovationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: request });
  } catch (err) { next(err); }
}));

export default router;
