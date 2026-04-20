const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const calc = require('../services/calculatorService');

/**
 * @swagger
 * /tools/irrigation:
 *   post:
 *     summary: Smart irrigation calculator
 *     tags: [Farmer Tools]
 */
router.post('/irrigation', protect, async (req, res, next) => {
  try {
    const result = await calc.calculateIrrigation(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /tools/fertilizer:
 *   post:
 *     summary: Fertilizer (NPK) calculator
 *     tags: [Farmer Tools]
 */
router.post('/fertilizer', protect, async (req, res, next) => {
  try {
    const result = await calc.calculateFertilizer(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /tools/yield:
 *   post:
 *     summary: Crop yield predictor
 *     tags: [Farmer Tools]
 */
router.post('/yield', protect, async (req, res, next) => {
  try {
    const result = await calc.predictYield(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /tools/rotation:
 *   post:
 *     summary: Crop rotation planner
 *     tags: [Farmer Tools]
 */
router.post('/rotation', protect, async (req, res, next) => {
  try {
    const result = await calc.suggestCropRotation(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /tools/zakat:
 *   post:
 *     summary: Zakat / Ushar calculator
 *     tags: [Farmer Tools]
 */
router.post('/zakat', protect, async (req, res, next) => {
  try {
    const result = calc.calculateZakat(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
