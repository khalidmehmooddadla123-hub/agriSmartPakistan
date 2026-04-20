const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Listing = require('../models/Listing');

// Get all active listings with filters
router.get('/', async (req, res, next) => {
  try {
    const { crop, province, minPrice, maxPrice, quality, search, page = 1, limit = 20 } = req.query;
    const filter = { status: 'active' };

    if (crop) filter.cropName = new RegExp(crop, 'i');
    if (province) filter.province = province;
    if (quality) filter.quality = quality;
    if (minPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $gte: parseInt(minPrice) };
    if (maxPrice) filter.pricePerUnit = { ...filter.pricePerUnit, $lte: parseInt(maxPrice) };
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Listing.countDocuments(filter);

    const listings = await Listing.find(filter)
      .populate('sellerID', 'fullName phone email')
      .populate('locationID', 'city cityUrdu province')
      .populate('cropID', 'cropName cropNameUrdu')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: listings.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: listings
    });
  } catch (error) { next(error); }
});

// Get my listings
router.get('/mine', protect, async (req, res, next) => {
  try {
    const listings = await Listing.find({ sellerID: req.user.id })
      .populate('locationID', 'city province')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) { next(error); }
});

// Get single listing (increment view)
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('sellerID', 'fullName phone email')
      .populate('locationID', 'city cityUrdu province');

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (error) { next(error); }
});

// Create listing
router.post('/', protect, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('locationID');

    const listing = await Listing.create({
      ...req.body,
      sellerID: req.user.id,
      locationID: req.body.locationID || user.locationID?._id,
      city: req.body.city || user.locationID?.city,
      province: req.body.province || user.locationID?.province
    });

    res.status(201).json({ success: true, data: listing });
  } catch (error) { next(error); }
});

// Update listing
router.put('/:id', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, sellerID: req.user.id },
      req.body,
      { new: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Not found or not authorized' });
    res.json({ success: true, data: listing });
  } catch (error) { next(error); }
});

// Increment inquiry count (when buyer contacts)
router.post('/:id/inquire', protect, async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { inquiries: 1 } },
      { new: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { contact: listing.contactPreference } });
  } catch (error) { next(error); }
});

// Delete listing
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const result = await Listing.findOneAndDelete({ _id: req.params.id, sellerID: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
