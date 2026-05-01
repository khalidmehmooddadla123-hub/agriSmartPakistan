const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const SoilTest = require('../models/SoilTest');
const Farm = require('../models/Farm');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
let genAI = null;

const getGemini = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

const extractJSON = (text) => {
  let cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { return null; } }
  return null;
};

/**
 * AI: Analyze soil test results and generate Pakistani-specific recommendations
 */
const analyzeSoil = async (test) => {
  const client = getGemini();
  if (!client) return null;

  const prompt = `A Pakistani farmer's soil test report:
- pH: ${test.pH || 'N/A'}
- EC: ${test.ec || 'N/A'} dS/m
- Organic Matter: ${test.organicMatter || 'N/A'}%
- Nitrogen (N): ${test.nitrogenN || 'N/A'} ppm
- Phosphorus (P): ${test.phosphorusP || 'N/A'} ppm
- Potassium (K): ${test.potassiumK || 'N/A'} ppm
- Zinc: ${test.zinc || 'N/A'} ppm
- Iron: ${test.iron || 'N/A'} ppm
- Texture: ${test.textureClass || 'unknown'}

Provide assessment + recommendations specific to Pakistani agriculture (mention local fertilizer brands like DAP, Urea Engro, Sona DAP, gypsum, etc. with PKR costs per acre where relevant).

Return ONLY valid JSON:
{
  "healthScore": 0-100,
  "assessment": "2-3 sentence summary in English",
  "assessmentUrdu": "اردو میں خلاصہ",
  "recommendations": "Numbered list of actionable recommendations in English (use \\n between items, mention specific products + dose + cost)",
  "recommendationsUrdu": "اردو میں سفارشات"
}`;

  let lastErr;
  for (const model of MODEL_CHAIN) {
    try {
      const m = client.getGenerativeModel({
        model,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      });
      const result = await m.generateContent(prompt);
      const data = extractJSON(result.response.text().trim());
      if (data && data.assessment) return data;
    } catch (err) {
      lastErr = err;
      if (!/(503|429|overload)/.test(err.message || '')) break;
    }
  }
  console.error('[SOIL-AI]', lastErr?.message);
  return null;
};

/**
 * Get all soil tests for current user (or for a specific farm)
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = { userID: req.user.id };
    if (req.query.farmID) filter.farmID = req.query.farmID;

    const tests = await SoilTest.find(filter)
      .populate('farmID', 'name village')
      .sort({ testDate: -1 });
    res.json({ success: true, count: tests.length, data: tests });
  } catch (error) { next(error); }
});

/**
 * Get single soil test
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const test = await SoilTest.findOne({ _id: req.params.id, userID: req.user.id })
      .populate('farmID', 'name village totalAreaAcres');
    if (!test) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: test });
  } catch (error) { next(error); }
});

/**
 * Create new soil test (with AI analysis)
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.body.farmID, userID: req.user.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    const data = { ...req.body, userID: req.user.id };

    // AI analysis if at least pH or NPK provided
    if (data.pH || data.nitrogenN || data.phosphorusP) {
      const ai = await analyzeSoil(data);
      if (ai) {
        data.healthScore = ai.healthScore;
        data.aiAssessment = ai.assessment;
        data.aiAssessmentUrdu = ai.assessmentUrdu;
        data.recommendations = ai.recommendations;
        data.recommendationsUrdu = ai.recommendationsUrdu;
      }
    }

    const test = await SoilTest.create(data);
    await test.populate('farmID', 'name village');
    res.status(201).json({ success: true, data: test });
  } catch (error) { next(error); }
});

/**
 * Update soil test (re-runs AI analysis if values changed)
 */
router.put('/:id', protect, async (req, res, next) => {
  try {
    const updates = req.body;

    // Re-analyze if soil chemistry changed
    if (updates.pH || updates.nitrogenN || updates.phosphorusP || updates.potassiumK) {
      const ai = await analyzeSoil(updates);
      if (ai) {
        updates.healthScore = ai.healthScore;
        updates.aiAssessment = ai.assessment;
        updates.aiAssessmentUrdu = ai.assessmentUrdu;
        updates.recommendations = ai.recommendations;
        updates.recommendationsUrdu = ai.recommendationsUrdu;
      }
    }

    const test = await SoilTest.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      updates,
      { new: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: test });
  } catch (error) { next(error); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const result = await SoilTest.findOneAndDelete({ _id: req.params.id, userID: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

/**
 * History trend for a farm (multiple tests over time)
 */
router.get('/farm/:farmID/trend', protect, async (req, res, next) => {
  try {
    const tests = await SoilTest.find({ farmID: req.params.farmID, userID: req.user.id })
      .sort({ testDate: 1 })
      .select('testDate pH nitrogenN phosphorusP potassiumK organicMatter healthScore');
    res.json({ success: true, count: tests.length, data: tests });
  } catch (error) { next(error); }
});

module.exports = router;
