const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { refreshNews } = require('../services/newsService');

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get published news articles with filters
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string, enum: [crop_prices, government_policy, pest_disease, climate, technology, market_trends, subsidies] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated news articles }
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await News.countDocuments(filter);
    const news = await News.find(filter)
      .sort({ isBreaking: -1, publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'fullName');

    res.json({
      success: true,
      count: news.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: news
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /news/meta/categories:
 *   get:
 *     summary: Get all news categories
 *     tags: [News]
 *     security: []
 *     responses:
 *       200: { description: List of news categories with bilingual labels }
 */
router.get('/meta/categories', async (req, res) => {
  res.json({
    success: true,
    data: [
      { key: 'crop_prices', label: 'Crop Prices', labelUrdu: 'فصل کی قیمتیں' },
      { key: 'government_policy', label: 'Government Policy', labelUrdu: 'حکومتی پالیسی' },
      { key: 'pest_disease', label: 'Pest & Disease', labelUrdu: 'کیڑے اور بیماری' },
      { key: 'climate', label: 'Climate & Weather', labelUrdu: 'موسم' },
      { key: 'technology', label: 'Technology', labelUrdu: 'ٹیکنالوجی' },
      { key: 'market_trends', label: 'Market Trends', labelUrdu: 'مارکیٹ رجحانات' },
      { key: 'subsidies', label: 'Subsidies', labelUrdu: 'سبسڈی' }
    ]
  });
});

// @desc    Refresh news from external API
// @route   POST /api/news/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const count = await refreshNews();
    res.json({ success: true, message: `Fetched ${count} new articles` });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: Get single news article (increments view count)
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Article details }
 *       404: { description: Article not found }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const article = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'fullName');

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
