import express from 'express';
import { generateUploadSignature } from '../services/cloud.service.js';
const router = express.Router();

// Signature is public — allows anonymous project requests & reports
router.get('/signature', (req, res) => {
  try {
    res.json({ success: true, data: generateUploadSignature() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;
