const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Equipment = require('../models/Equipment');

router.get('/', async (req, res, next) => {
  try {
    const { type, province, search, available, minRate, maxRate, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (available !== undefined) filter.available = available === 'true';
    else filter.available = true;
    if (type) filter.type = type;
    if (province) filter.province = province;
    if (minRate) filter.ratePKR = { ...filter.ratePKR, $gte: parseInt(minRate) };
    if (maxRate) filter.ratePKR = { ...filter.ratePKR, $lte: parseInt(maxRate) };
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Equipment.countDocuments(filter);
    const items = await Equipment.find(filter)
      .populate('ownerID', 'fullName phone email')
      .populate('locationID', 'city cityUrdu province')
      .sort({ createdAt: -1 })
      .skip(skip).limit(parseInt(limit));

    res.json({ success: true, count: items.length, total, pages: Math.ceil(total / parseInt(limit)), data: items });
  } catch (error) { next(error); }
});

router.get('/mine', protect, async (req, res, next) => {
  try {
    const items = await Equipment.find({ ownerID: req.user.id })
      .populate('locationID', 'city province')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('ownerID', 'fullName phone email')
      .populate('locationID', 'city cityUrdu province');
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('locationID');
    const item = await Equipment.create({
      ...req.body,
      ownerID: req.user.id,
      locationID: req.body.locationID || user.locationID?._id,
      city: req.body.city || user.locationID?.city,
      province: req.body.province || user.locationID?.province
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const item = await Equipment.findOneAndUpdate(
      { _id: req.params.id, ownerID: req.user.id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Not found or not authorized' });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.post('/:id/inquire', protect, async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, { $inc: { inquiries: 1 } }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { contact: item.contactPreference } });
  } catch (error) { next(error); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const result = await Equipment.findOneAndDelete({ _id: req.params.id, ownerID: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
