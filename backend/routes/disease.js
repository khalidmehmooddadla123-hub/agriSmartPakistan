const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { detectDisease, chatResponse, getDiseasesByCrop, diseaseDatabase } = require('../services/diseaseService');
const { chatWithAI } = require('../services/aiChatService');
const { detectDiseaseFromImage } = require('../services/mlDiseaseService');
const DiseaseReport = require('../models/DiseaseReport');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `scan-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (JPG, PNG, WEBP) are allowed'));
  }
});

/**
 * @swagger
 * /disease/detect:
 *   post:
 *     summary: Detect crop disease from image or symptom description
 *     tags: [Disease Detection]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary, description: "Leaf image (JPG, PNG, WEBP, max 10MB)" }
 *               description: { type: string, description: "Symptom description" }
 *               crop: { type: string, description: "Crop name hint (e.g. Wheat, Rice)" }
 *     responses:
 *       200: { description: Disease detected with bilingual details }
 *       400: { description: No image or description provided }
 *       404: { description: Could not identify disease }
 */
router.post('/detect', protect, upload.single('image'), async (req, res, next) => {
  try {
    const { description, crop } = req.body;

    if (!req.file && !description) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image or provide a description of symptoms'
      });
    }

    // Try ML-based detection first (falls back to keyword if HF unavailable)
    const result = await detectDiseaseFromImage({
      imagePath: req.file?.path,
      description: description || '',
      cropHint: crop || ''
    });

    if (!result.disease) {
      return res.status(404).json({
        success: false,
        message: 'Could not identify the disease. Please try a clearer image or describe symptoms in more detail.'
      });
    }

    const d = result.disease;

    // Log this report for pest outbreak detection
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id).select('locationID');
      if (user?.locationID) {
        await DiseaseReport.create({
          userID: req.user.id,
          locationID: user.locationID,
          diseaseID: d.id,
          diseaseName: d.name,
          crop: d.crop,
          severity: d.severity,
          confidence: result.confidence,
          source: result.source
        });
      }
    } catch (reportErr) {
      // Don't fail the request if logging fails
      console.error('[DETECT] Report logging failed:', reportErr.message);
    }

    res.json({
      success: true,
      data: {
        disease: {
          id: d.id,
          name: d.name,
          nameUrdu: d.nameUrdu,
          scientificName: d.scientificName,
          crop: d.crop,
          cropUrdu: d.cropUrdu,
          severity: d.severity,
          symptoms: d.symptoms,
          symptomsUrdu: d.symptomsUrdu,
          cause: d.cause,
          causeUrdu: d.causeUrdu,
          solution: d.solution,
          solutionUrdu: d.solutionUrdu
        },
        confidence: result.confidence,
        source: result.source,
        mlLabel: result.mlLabel,
        mlConfidence: result.mlConfidence,
        imageFile: req.file ? req.file.filename : null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /disease/chat:
 *   post:
 *     summary: Chat about crop diseases and farming advice
 *     tags: [Disease Detection]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, example: "How to treat wheat rust?" }
 *               language: { type: string, enum: [en, ur], default: en }
 *     responses:
 *       200: { description: Chat reply }
 */
router.post('/chat', protect, async (req, res, next) => {
  try {
    const { message, language, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Use AI chat service (falls back to keyword-based if Gemini not configured)
    const result = await chatWithAI(message, language || 'en', history || []);

    res.json({
      success: true,
      data: {
        reply: result.reply,
        source: result.source,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /disease/list:
 *   get:
 *     summary: Get all diseases in database
 *     tags: [Disease Detection]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: crop
 *         schema: { type: string }
 *         description: Filter diseases by crop name
 *     responses:
 *       200: { description: List of diseases }
 */
router.get('/list', async (req, res) => {
  const { crop } = req.query;
  const diseases = crop ? getDiseasesByCrop(crop) : diseaseDatabase;

  res.json({
    success: true,
    count: diseases.length,
    data: diseases.map(d => ({
      id: d.id,
      name: d.name,
      nameUrdu: d.nameUrdu,
      crop: d.crop,
      cropUrdu: d.cropUrdu,
      severity: d.severity
    }))
  });
});

module.exports = router;
