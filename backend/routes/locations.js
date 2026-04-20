const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

/**
 * @swagger
 * /locations/countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Locations]
 *     security: []
 *     responses:
 *       200: { description: List of countries with Urdu names }
 */
router.get('/countries', async (req, res, next) => {
  try {
    const countries = await Location.distinct('country');
    const countriesUrdu = await Location.aggregate([
      { $group: { _id: '$country', countryUrdu: { $first: '$countryUrdu' } } }
    ]);
    const map = {};
    countriesUrdu.forEach(c => { map[c._id] = c.countryUrdu; });

    res.json({
      success: true,
      data: countries.map(c => ({ name: c, nameUrdu: map[c] || c }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /locations/provinces/{country}:
 *   get:
 *     summary: Get provinces by country
 *     tags: [Locations]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema: { type: string, example: "Pakistan" }
 *     responses:
 *       200: { description: List of provinces }
 */
router.get('/provinces/:country', async (req, res, next) => {
  try {
    const provinces = await Location.aggregate([
      { $match: { country: req.params.country } },
      { $group: { _id: '$province', provinceUrdu: { $first: '$provinceUrdu' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: provinces.map(p => ({ name: p._id, nameUrdu: p.provinceUrdu || p._id }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /locations/cities/{country}/{province}:
 *   get:
 *     summary: Get cities by country and province
 *     tags: [Locations]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: province
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of cities with coordinates }
 */
router.get('/cities/:country/:province', async (req, res, next) => {
  try {
    const cities = await Location.find({
      country: req.params.country,
      province: req.params.province
    }).select('city cityUrdu latitude longitude').sort('city');

    res.json({
      success: true,
      data: cities.map(c => ({
        id: c._id,
        name: c.city,
        nameUrdu: c.cityUrdu || c.city,
        latitude: c.latitude,
        longitude: c.longitude
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     security: []
 *     responses:
 *       200: { description: All locations }
 */
router.get('/', async (req, res, next) => {
  try {
    const locations = await Location.find().sort('country province city');
    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
