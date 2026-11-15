import express from 'express';
import { generateUploadSignature } from '../services/cloud.service.js';
import { sensitiveLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Public project forms may request a signature without a customer account.
router.get('/signature', sensitiveLimiter, (req, res) => {
  try {
    const signatureData = generateUploadSignature();
    res.json({ success: true, data: signatureData });
  } catch {
    res.status(503).json({ success: false, message: 'File uploads are temporarily unavailable.', data: null });
  }
});

export default router;
