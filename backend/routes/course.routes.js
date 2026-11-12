import express from 'express';
import Course from '../models/Course.js';
import withDB from '../middleware/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', withDB(async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { archived: false };
    if (search) query.$or = [{ 'title.en': { $regex: search, $options: 'i' } }, { 'title.ha': { $regex: search, $options: 'i' } }];
    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (err) { next(err); }
}));

router.get('/:slug', withDB(async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, archived: false });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
}));

router.post('/', requireAdmin, withDB(async (req, res, next) => {
  try {
    const { title, description, price, image, duration, telegramLink } = req.body;
    const slug = title.en.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const course = await Course.create({ title, description, price, image, duration, telegramLink, slug });
    res.status(201).json({ success: true, data: course });
  } catch (err) { next(err); }
}));

export default router;
