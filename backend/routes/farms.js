const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Farm = require('../models/Farm');
const { calculateHarvestDate } = require('../services/harvestReminder');

/**
 * @swagger
 * /farms:
 *   get:
 *     summary: Get all farms for current user
 *     tags: [Farms]
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const farms = await Farm.find({ userID: req.user.id, isActive: true })
      .populate('locationID', 'city cityUrdu province')
      .populate('crops.cropID', 'cropName cropNameUrdu unit')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: farms.length, data: farms });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /farms/{id}:
 *   get:
 *     summary: Get single farm with all crops
 *     tags: [Farms]
 */
router.get('/:id', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userID: req.user.id })
      .populate('locationID')
      .populate('crops.cropID', 'cropName cropNameUrdu unit category');
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, data: farm });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /farms:
 *   post:
 *     summary: Create a new farm
 *     tags: [Farms]
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const farm = await Farm.create({ ...req.body, userID: req.user.id });
    await farm.populate('locationID', 'city cityUrdu province');
    res.status(201).json({ success: true, data: farm });
  } catch (error) { next(error); }
});

/**
 * Update farm details
 */
router.put('/:id', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('locationID', 'city cityUrdu province');
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, data: farm });
  } catch (error) { next(error); }
});

/**
 * Delete (soft delete) a farm
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, message: 'Farm archived' });
  } catch (error) { next(error); }
});

// ============ CROPS ON FARM ============

/**
 * Add a crop to a farm
 */
router.post('/:id/crops', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userID: req.user.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    const newCrop = { ...req.body };

    // Auto-calculate expected harvest if sowDate + cropName provided
    if (newCrop.sowDate && newCrop.cropID) {
      const Crop = require('../models/Crop');
      const cropDoc = await Crop.findById(newCrop.cropID);
      if (cropDoc) {
        newCrop.expectedHarvestDate = calculateHarvestDate(cropDoc.cropName, newCrop.sowDate);
      }
    }

    farm.crops.push(newCrop);
    await farm.save();
    await farm.populate('crops.cropID', 'cropName cropNameUrdu unit');
    res.status(201).json({ success: true, data: farm });
  } catch (error) { next(error); }
});

/**
 * Update a specific crop on a farm
 */
router.put('/:id/crops/:cropEntryId', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userID: req.user.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    const cropEntry = farm.crops.id(req.params.cropEntryId);
    if (!cropEntry) return res.status(404).json({ success: false, message: 'Crop entry not found' });

    Object.assign(cropEntry, req.body);
    await farm.save();
    await farm.populate('crops.cropID', 'cropName cropNameUrdu unit');
    res.json({ success: true, data: farm });
  } catch (error) { next(error); }
});

/**
 * Remove a crop from a farm
 */
router.delete('/:id/crops/:cropEntryId', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userID: req.user.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    farm.crops.pull(req.params.cropEntryId);
    await farm.save();
    res.json({ success: true, data: farm });
  } catch (error) { next(error); }
});

/**
 * Get farm summary statistics
 */
router.get('/:id/summary', protect, async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userID: req.user.id })
      .populate('crops.cropID', 'cropName cropNameUrdu unit');
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    const Expense = require('../models/Expense');
    const year = new Date().getFullYear();

    const expenses = await Expense.find({ userID: req.user.id, year });
    const totalExpenses = expenses.filter(e => !e.isRevenue).reduce((s, e) => s + e.amountPKR, 0);
    const totalRevenue = expenses.filter(e => e.isRevenue).reduce((s, e) => s + e.amountPKR, 0);

    res.json({
      success: true,
      data: {
        farm: {
          name: farm.name,
          totalAreaAcres: farm.totalAreaAcres,
          activeCrops: farm.crops.filter(c => ['planned', 'sown', 'growing'].includes(c.status)).length,
          harvestedCrops: farm.crops.filter(c => c.status === 'harvested').length
        },
        finances: {
          totalExpenses,
          totalRevenue,
          profit: totalRevenue - totalExpenses
        },
        crops: farm.crops
      }
    });
  } catch (error) { next(error); }
});

module.exports = router;
