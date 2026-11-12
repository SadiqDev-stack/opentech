import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';
import { slugify, formatNaira } from '../utils/helpers.js';

const router = express.Router();

// GET /api/courses (public)
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
    let coursesQuery = Course.find(query).sort({ createdAt: -1 });
    if (limit) coursesQuery = coursesQuery.limit(Number(limit));
    
    const courses = await coursesQuery;
    res.json({ success: true, data: courses });
  } catch (err) { next(err); }
});

// GET /api/courses/:slug (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, archived: false });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
});

// POST /api/courses (admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, price, image, duration, telegramLink } = req.body;
    const slug = slugify(title.en || title.ha) + '-' + Date.now().toString().slice(-4);
    
    const course = await Course.create({
      title, description, price, image, duration, telegramLink, slug
    });
    res.status(201).json({ success: true, data: course });
  } catch (err) { next(err); }
});

// PUT /api/courses/:id (admin only)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, price, image, duration, telegramLink } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id, 
      { title, description, price, image, duration, telegramLink },
      { new: true }
    );
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
});

export default router;
