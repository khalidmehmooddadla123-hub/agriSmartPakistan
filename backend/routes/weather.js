const express = require('express');
const router = express.Router();
const Weather = require('../models/Weather');
const weatherService = require('../services/weatherService');

/**
 * @swagger
 * /weather/{locationID}:
 *   get:
 *     summary: Get current weather and 7-day forecast with farming advisories
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: locationID
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: fresh
 *         schema: { type: boolean }
 *         description: Force fresh data fetch (bypass 10-min cache)
 *     responses:
 *       200: { description: Weather data with advisories }
 *       404: { description: Weather data not available }
 */
router.get('/:locationID', async (req, res, next) => {
  try {
    const { fresh } = req.query;

    let weather = null;

    // Only use cache if not requesting fresh and cache is less than 10 min old
    if (!fresh) {
      weather = await Weather.findOne({
        locationID: req.params.locationID,
        updatedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
      }).populate('locationID', 'city cityUrdu province provinceUrdu country countryUrdu latitude longitude');
    }

    // Fetch fresh data from API
    if (!weather) {
      weather = await weatherService.fetchAndCacheWeather(req.params.locationID);
    }

    if (!weather) {
      return res.status(404).json({ success: false, message: 'Weather data not available for this location' });
    }

    // Generate agricultural advisories
    const advisories = weatherService.generateAdvisories(weather);

    res.json({
      success: true,
      data: {
        ...weather.toObject(),
        advisories
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
