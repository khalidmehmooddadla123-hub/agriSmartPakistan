const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

/**
 * @swagger
 * /crops:
 *   get:
 *     summary: Get all active crops
 *     tags: [Crops]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [grain, vegetable, fruit, fiber, oilseed, spice, other] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by crop name (English or Urdu)
 *     responses:
 *       200: { description: List of crops }
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { cropName: { $regex: search, $options: 'i' } },
        { cropNameUrdu: { $regex: search, $options: 'i' } }
      ];
    }

    const crops = await Crop.find(filter).sort('cropName');
    res.json({ success: true, count: crops.length, data: crops });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /crops/{id}:
 *   get:
 *     summary: Get crop by ID
 *     tags: [Crops]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Crop details }
 *       404: { description: Crop not found }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    res.json({ success: true, data: crop });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
