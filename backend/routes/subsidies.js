const express = require('express');
const router = express.Router();
const Subsidy = require('../models/Subsidy');

router.get('/', async (req, res, next) => {
  try {
    const { category, province } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;

    let items = await Subsidy.find(filter).sort({ category: 1, name: 1 });

    if (province) {
      items = items.filter(s =>
        !s.eligibility?.province || s.eligibility.province === province
      );
    }

    res.json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Subsidy.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Subsidy not found' });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

module.exports = router;
