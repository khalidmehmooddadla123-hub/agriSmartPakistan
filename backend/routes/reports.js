const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateAnnualReport } = require('../services/reportService');

/**
 * Get annual farm report (HTML — printable as PDF in browser)
 */
router.get('/annual', protect, async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { html } = await generateAnnualReport(req.user.id, year);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) { next(error); }
});

/**
 * Get summary stats only (JSON — for dashboard/preview)
 */
router.get('/annual/summary', protect, async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { summary } = await generateAnnualReport(req.user.id, year);
    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
});

module.exports = router;
