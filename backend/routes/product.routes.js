import express from 'express';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
import { slugify } from '../utils/helpers.js';

const router = express.Router();

// GET /api/products (public)
router.get('/', async (req, res, next) => {
  try {
    const { search, limit } = req.query;
    let query = { archived: false };
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ha': { $regex: search, $options: 'i' } }
      ];
    }
    let queryBuilder = Product.find(query).sort({ createdAt: -1 });
    if (limit) queryBuilder = queryBuilder.limit(Number(limit));
    
    const products = await queryBuilder;
    res.json({ success: true, data: products });
  } catch (err) { next(err); }
});

// GET /api/products/:slug (public)
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, archived: false });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

// POST /api/products (admin only)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, price, image, stock } = req.body;
    const slug = slugify(name.en || name.ha) + '-' + Date.now().toString().slice(-4);
    
    const product = await Product.create({ name, description, price, image, stock, slug });
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
});

// PUT /api/products/:id (admin only)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, price, image, stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { name, description, price, image, stock },
      { new: true }
    );
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
});

export default router;
