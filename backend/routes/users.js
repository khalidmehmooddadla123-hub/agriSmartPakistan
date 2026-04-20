const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { calculateHarvestDate } = require('../services/harvestReminder');

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               language: { type: string, enum: [en, ur] }
 *               locationID: { type: string }
 *               notifEmail: { type: boolean }
 *               notifSMS: { type: boolean }
 *               notifTime: { type: string, example: "06:00" }
 *               selectedCrops: { type: array, items: { type: string } }
 *               priceAlerts: { type: array, items: { type: object, properties: { cropID: { type: string }, threshold: { type: number }, direction: { type: string, enum: [above, below] } } } }
 *     responses:
 *       200: { description: Updated user profile }
 */
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { fullName, language, locationID, notifEmail, notifSMS, notifTime, selectedCrops, priceAlerts } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (language) updates.language = language;
    if (locationID) updates.locationID = locationID;
    if (typeof notifEmail === 'boolean') updates.notifEmail = notifEmail;
    if (typeof notifSMS === 'boolean') updates.notifSMS = notifSMS;
    if (notifTime) updates.notifTime = notifTime;
    if (selectedCrops) updates.selectedCrops = selectedCrops;
    if (priceAlerts) updates.priceAlerts = priceAlerts;

    // cropSchedule with auto-calculated harvest date
    if (req.body.cropSchedule) {
      const Crop = require('../models/Crop');
      updates.cropSchedule = await Promise.all(req.body.cropSchedule.map(async (s) => {
        const crop = await Crop.findById(s.cropID);
        return {
          cropID: s.cropID,
          sowDate: s.sowDate,
          expectedHarvestDate: s.expectedHarvestDate ||
            (crop && s.sowDate ? calculateHarvestDate(crop.cropName, s.sowDate) : null),
          reminded: false
        };
      }));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true })
      .populate('locationID')
      .populate('selectedCrops')
      .populate('cropSchedule.cropID');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password changed }
 *       400: { description: Current password incorrect }
 */
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+passwordHash');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
