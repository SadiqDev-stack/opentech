import express from 'express';
import Course from '../models/Course.js';
import withDB from '../middleware/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { slugify } from '../utils/helpers.js';

const router = express.Router();

// GET with pagination
router.get('/', withDB(async (req, res, next) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;
    let query = { archived: false };
    if (search) query.$or = [{ 'title.en': { $regex: search, $options: 'i' } }, { 'title.ha': { $regex: search, $options: 'i' } }];

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: courses, meta: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}));

router.get('/:slug', withDB(async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, archived: false });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
}));

// Admin Create
router.post('/', requireAdmin, withDB(async (req, res, next) => {
  try {
    const { title, description, price, image, duration, telegramLink } = req.body;
    const slug = slugify(title.en) + '-' + Date.now();
    const course = await Course.create({ title, description, price, image, duration, telegramLink, slug });
    res.status(201).json({ success: true, data: course });
  } catch (err) { next(err); }
}));

// Admin Update
router.put('/:id', requireAdmin, withDB(async (req, res, next) => {
  try {
    const { title, description, price, image, duration, telegramLink } = req.body;
    const course = await Course.findByIdAndUpdate(req.params.id, { title, description, price, image, duration, telegramLink }, { new: true });
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
}));

// Admin Archive
router.delete('/:id', requireAdmin, withDB(async (req, res, next) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { archived: true });
    res.json({ success: true, message: 'Course archived' });
  } catch (err) { next(err); }
}));

export default router;
