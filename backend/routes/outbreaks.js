const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCurrentOutbreaks, detectOutbreaks } = require('../services/outbreakDetector');

/**
 * @swagger
 * /outbreaks:
 *   get:
 *     summary: Get current disease outbreaks across Pakistan
 *     tags: [Outbreaks]
 *     responses:
 *       200: { description: List of disease clusters with counts }
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const outbreaks = await getCurrentOutbreaks();
    res.json({
      success: true,
      count: outbreaks.length,
      data: outbreaks
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /outbreaks/scan:
 *   post:
 *     summary: Trigger manual outbreak scan (admin only)
 *     tags: [Outbreaks]
 */
router.post('/scan', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const result = await detectOutbreaks();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
