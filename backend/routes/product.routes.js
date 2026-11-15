import express from 'express';
import Product from '../models/Product.js';
import withDB from '../middleware/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { slugify } from '../utils/helpers.js';

const router = express.Router();

router.get('/', withDB(async (req, res, next) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;
    let query = { archived: false };
    if (search) query.$or = [{ 'name.en': { $regex: search, $options: 'i' } }, { 'name.ha': { $regex: search, $options: 'i' } }];

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: products, meta: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}));

router.get('/:slug', withDB(async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, archived: false });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}));

export default router;
