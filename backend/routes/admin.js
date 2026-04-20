const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Price = require('../models/Price');
const News = require('../models/News');
const Location = require('../models/Location');
const Notification = require('../models/Notification');

// Configure multer for news image uploads
const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, `news-${Date.now()}${path.extname(file.originalname)}`)
});

const newsUpload = multer({
  storage: newsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed'));
  }
});

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ============ USERS ============
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('locationID', 'city province country')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, count: users.length, data: users });
  } catch (error) { next(error); }
});

router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
});

// ============ CROPS ============
router.post('/crops', async (req, res, next) => {
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json({ success: true, data: crop });
  } catch (error) { next(error); }
});

router.put('/crops/:id', async (req, res, next) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.json({ success: true, data: crop });
  } catch (error) { next(error); }
});

router.delete('/crops/:id', async (req, res, next) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Crop deleted' });
  } catch (error) { next(error); }
});

// ============ PRICES ============
router.post('/prices', async (req, res, next) => {
  try {
    const price = await Price.create(req.body);
    res.status(201).json({ success: true, data: price });
  } catch (error) { next(error); }
});

router.put('/prices/:id', async (req, res, next) => {
  try {
    const price = await Price.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!price) return res.status(404).json({ success: false, message: 'Price not found' });
    res.json({ success: true, data: price });
  } catch (error) { next(error); }
});

router.delete('/prices/:id', async (req, res, next) => {
  try {
    await Price.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Price deleted' });
  } catch (error) { next(error); }
});

// ============ NEWS ============
router.post('/news', newsUpload.single('image'), async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    if (req.body.isPublished) req.body.publishedAt = new Date();
    if (req.file) {
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }
    const article = await News.create(req.body);
    res.status(201).json({ success: true, data: article });
  } catch (error) { next(error); }
});

router.get('/news', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await News.countDocuments();
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'fullName');
    res.json({ success: true, total, data: news });
  } catch (error) { next(error); }
});

router.put('/news/:id', newsUpload.single('image'), async (req, res, next) => {
  try {
    if (req.body.isPublished && !req.body.publishedAt) req.body.publishedAt = new Date();
    if (req.file) {
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }
    const article = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (error) { next(error); }
});

router.delete('/news/:id', async (req, res, next) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted' });
  } catch (error) { next(error); }
});

// ============ LOCATIONS ============
router.post('/locations', async (req, res, next) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (error) { next(error); }
});

router.put('/locations/:id', async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: location });
  } catch (error) { next(error); }
});

router.delete('/locations/:id', async (req, res, next) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Location deleted' });
  } catch (error) { next(error); }
});

// ============ BROADCAST NOTIFICATION ============
router.post('/notifications/broadcast', async (req, res, next) => {
  try {
    const { title, message, type = 'broadcast' } = req.body;
    const users = await User.find({ isActive: true }).select('_id');

    const notifications = users.map(u => ({
      userID: u._id,
      type,
      title,
      message,
      channel: 'in-app',
      isSent: true,
      sentAt: new Date()
    }));

    await Notification.insertMany(notifications);
    res.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (error) { next(error); }
});

// ============ ANALYTICS ============
router.get('/analytics', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalCrops = await Crop.countDocuments({ isActive: true });
    const totalNews = await News.countDocuments({ isPublished: true });
    const totalNotifications = await Notification.countDocuments();

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('fullName email createdAt');

    // Registration trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers, activeUsers, totalFarmers, totalCrops, totalNews, totalNotifications,
        recentUsers, registrationTrend
      }
    });
  } catch (error) { next(error); }
});

module.exports = router;
