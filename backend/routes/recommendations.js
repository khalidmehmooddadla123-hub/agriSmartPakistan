const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecommendations, getCurrentSeason } = require('../services/recommendationService');
const Weather = require('../models/Weather');
const User = require('../models/User');

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Get personalized crop recommendations based on user location & weather
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema: { type: string, enum: [en, ur], default: en }
 *     responses:
 *       200: { description: List of recommended crops with scores }
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('locationID');
    const language = req.query.language || user?.language || 'en';

    let temperature, humidity, province;

    // Get weather data if user has location
    if (user?.locationID) {
      province = user.locationID.province;

      const weather = await Weather.findOne({ locationID: user.locationID._id })
        .sort({ updatedAt: -1 });

      if (weather) {
        temperature = weather.temperature;
        humidity = weather.humidity;
      }
    }

    const recommendations = getRecommendations({
      temperature,
      humidity,
      province,
      language
    });

    const season = getCurrentSeason();

    res.json({
      success: true,
      data: {
        season: language === 'ur' ? season.ur : season.en,
        location: user?.locationID ? {
          city: user.locationID.city,
          cityUrdu: user.locationID.cityUrdu,
          province: user.locationID.province
        } : null,
        weather: temperature ? { temperature, humidity } : null,
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
