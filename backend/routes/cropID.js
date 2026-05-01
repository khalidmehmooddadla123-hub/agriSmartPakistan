const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { identifyCrop, agriImageGate } = require('../services/aiChatService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else cb(new Error('Only JPG, PNG, WEBP images allowed'));
  }
});

/**
 * POST /api/crop-id — identify crop from image using Gemini Vision
 */
router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image required' });
    }

    // Off-topic guard: reject non-agri images before running crop identification
    const gate = await agriImageGate(req.file.buffer, req.file.mimetype);
    if (gate && gate.isAgri === false) {
      return res.status(422).json({
        success: false,
        offTopic: true,
        subject: gate.subject || gate.kind || 'unknown',
        message: `This image doesn't show a crop or plant (${gate.subject || gate.kind || 'unrecognized'}). Please upload a clear photo of a crop, leaf, fruit, or plant.`,
        messageUrdu: 'یہ تصویر کسی فصل یا پودے کی نہیں لگتی۔ براہ کرم فصل، پتے، پھل، یا پودے کی واضح تصویر اپلوڈ کریں۔'
      });
    }

    const result = await identifyCrop(req.file.buffer, req.file.mimetype, req.body.language || 'en');
    if (!result) {
      return res.status(503).json({ success: false, message: 'AI service unavailable. Try again later.' });
    }
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
