const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const fs = require('fs');
const { detectDisease, chatResponse, getDiseasesByCrop, diseaseDatabase } = require('../services/diseaseService');
const { chatWithAI, agriImageGate, agriTextGate, plantImageGate } = require('../services/aiChatService');
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

    // === STRICT plant-only guard for disease scanner ===
    // The Hugging Face plant-disease model will hallucinate a fake diagnosis
    // for any image (cat, building, food). We must reject non-plant images
    // BEFORE running the ML pipeline. This gate fails CLOSED — if Gemini is
    // unreachable, we still reject (better than a false diagnosis).
    if (req.file) {
      const buf = fs.readFileSync(req.file.path);
      const gate = await plantImageGate(buf, req.file.mimetype);
      console.log(`[DETECT] Plant gate: isPlant=${gate.isPlant} subject="${gate.subject}" conf=${gate.confidence} (${gate.source})`);

      if (!gate.isPlant) {
        // Clean up the rejected upload to save disk
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(422).json({
          success: false,
          offTopic: true,
          subject: gate.subject || 'unknown',
          confidence: gate.confidence,
          message: `This image doesn't show a plant or leaf — detected: ${gate.subject || 'unrecognized'}. The disease scanner only works on photos of plant material (leaves, fruits, vegetables, or crop fields). Please upload a clear photo of the affected plant.`,
          messageUrdu: `یہ تصویر کسی پودے یا پتے کی نہیں ہے — اس میں ${gate.subject || 'نامعلوم'} نظر آ رہا ہے۔ بیماری کا اسکینر صرف پودوں کی تصاویر (پتے، پھل، سبزیاں، یا فصل کے کھیت) پر کام کرتا ہے۔ براہ کرم متاثرہ پودے کی واضح تصویر اپلوڈ کریں۔`
        });
      }
    } else if (description) {
      // For description-only requests, run text gate too
      const txtGate = await agriTextGate(description);
      if (txtGate && txtGate.isAgri === false) {
        return res.status(422).json({
          success: false,
          offTopic: true,
          message: 'Your description doesn\'t look farming-related. Please describe symptoms of a crop, plant, or livestock issue.',
          messageUrdu: 'آپ کی تفصیل زراعت سے متعلق نہیں لگتی۔ براہ کرم فصل، پودے یا مویشی کی علامات بیان کریں۔'
        });
      }
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
    const lang = language || 'en';
    const isUrdu = lang === 'ur';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Off-topic guard: refuse non-agriculture questions cleanly
    const gate = await agriTextGate(message);
    if (gate && gate.isAgri === false) {
      return res.json({
        success: true,
        data: {
          offTopic: true,
          topic: gate.topic || 'unrelated',
          reply: isUrdu
            ? `یہ سوال زراعت یا کاشتکاری سے متعلق نہیں لگتا۔ میں صرف فصلوں، بیماریوں، موسم، آبپاشی، کھاد، اور کسانوں کے سوالات کا جواب دے سکتا ہوں۔ براہ کرم کوئی زرعی سوال پوچھیں۔`
            : `This question doesn't appear to be about farming or agriculture. I can only help with crops, diseases, weather, irrigation, fertilizers, livestock, and other farming topics. Please ask me an agriculture-related question.`,
          source: 'gate',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Use AI chat service (falls back to keyword-based if Gemini not configured)
    const result = await chatWithAI(message, lang, history || []);

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
