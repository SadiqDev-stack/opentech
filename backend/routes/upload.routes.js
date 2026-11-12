import express from 'express';
import { generateUploadSignature } from '../services/cloud.service.js';

const router = express.Router();

// GET /api/uploads/signature (No auth required for public forms)
router.get('/signature', (req, res, next) => {
  try {
    const signatureData = generateUploadSignature();
    res.json({ success: true, data: signatureData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
