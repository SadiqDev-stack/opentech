import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateUploadSignature } from '../services/cloud.service.js';

const router = express.Router();

// GET /api/uploads/signature
router.get('/signature', requireAuth, (req, res, next) => {
  try {
    const signatureData = generateUploadSignature();
    res.json({ success: true, data: signatureData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
