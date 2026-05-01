const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { identifyCrop } = require('../services/aiChatService');

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
    const result = await identifyCrop(req.file.buffer, req.file.mimetype, req.body.language || 'en');
    if (!result) {
      return res.status(503).json({ success: false, message: 'AI service unavailable. Try again later.' });
    }
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
