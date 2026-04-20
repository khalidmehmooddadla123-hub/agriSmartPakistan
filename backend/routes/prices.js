const express = require('express');
const router = express.Router();
const Price = require('../models/Price');

/**
 * @swagger
 * /prices:
 *   get:
 *     summary: Get crop prices with filters
 *     tags: [Prices]
 *     parameters:
 *       - in: query
 *         name: cropID
 *         schema: { type: string }
 *       - in: query
 *         name: locationID
 *         schema: { type: string }
 *       - in: query
 *         name: priceType
 *         schema: { type: string, enum: [international, national, local] }
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Price list }
 */
router.get('/', async (req, res, next) => {
  try {
    const { cropID, locationID, priceType, days = 1 } = req.query;
    const filter = {};

    if (cropID) filter.cropID = cropID;
    if (locationID) filter.locationID = locationID;
    if (priceType) filter.priceType = priceType;

    // Get prices from the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    filter.recordedAt = { $gte: startDate };

    const prices = await Price.find(filter)
      .populate('cropID', 'cropName cropNameUrdu category unit')
      .populate('locationID', 'city province country cityUrdu')
      .sort({ recordedAt: -1 })
      .limit(500);

    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /prices/latest:
 *   get:
 *     summary: Get latest prices for all crops (aggregated)
 *     tags: [Prices]
 *     parameters:
 *       - in: query
 *         name: priceType
 *         schema: { type: string, enum: [international, national, local] }
 *       - in: query
 *         name: locationID
 *         schema: { type: string }
 *     responses:
 *       200: { description: Latest price per crop }
 */
router.get('/latest', async (req, res, next) => {
  try {
    const { priceType, locationID } = req.query;
    const match = {};
    if (priceType) match.priceType = priceType;
    if (locationID) match.locationID = require('mongoose').Types.ObjectId.createFromHexString(locationID);

    const prices = await Price.aggregate([
      { $match: match },
      { $sort: { recordedAt: -1 } },
      {
        $group: {
          _id: { cropID: '$cropID', priceType: '$priceType' },
          price: { $first: '$price' },
          previousPrice: { $first: '$previousPrice' },
          currency: { $first: '$currency' },
          msp: { $first: '$msp' },
          source: { $first: '$source' },
          recordedAt: { $first: '$recordedAt' },
          priceId: { $first: '$_id' },
          locationID: { $first: '$locationID' }
        }
      }
    ]);

    // Populate crop and location info
    const populatedPrices = await Price.populate(prices.map(p => ({
      _id: p.priceId,
      cropID: p._id.cropID,
      priceType: p._id.priceType,
      price: p.price,
      previousPrice: p.previousPrice,
      currency: p.currency,
      msp: p.msp,
      source: p.source,
      recordedAt: p.recordedAt,
      locationID: p.locationID
    })), [
      { path: 'cropID', select: 'cropName cropNameUrdu category unit' },
      { path: 'locationID', select: 'city province country cityUrdu' }
    ]);

    res.json({ success: true, count: populatedPrices.length, data: populatedPrices });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /prices/history/{cropID}:
 *   get:
 *     summary: Get price history for a crop (for 30-day chart)
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: cropID
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: priceType
 *         schema: { type: string, default: national }
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *       - in: query
 *         name: locationID
 *         schema: { type: string }
 *     responses:
 *       200: { description: Price history array for charting }
 */
router.get('/history/:cropID', async (req, res, next) => {
  try {
    const { priceType = 'national', days = 30, locationID } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = {
      cropID: req.params.cropID,
      priceType,
      recordedAt: { $gte: startDate }
    };
    if (locationID) filter.locationID = locationID;

    const history = await Price.find(filter)
      .select('price recordedAt currency')
      .sort({ recordedAt: 1 });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
