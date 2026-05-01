const express = require('express');
const router = express.Router();
const LoanProvider = require('../models/LoanProvider');

router.get('/', async (req, res, next) => {
  try {
    const items = await LoanProvider.find({ isActive: true }).sort({ rate: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await LoanProvider.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Loan provider not found' });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

module.exports = router;
