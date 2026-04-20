const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');

// Get all expenses for user (with filters)
router.get('/', protect, async (req, res, next) => {
  try {
    const { season, year, category, cropID } = req.query;
    const filter = { userID: req.user.id };
    if (season) filter.season = season;
    if (year) filter.year = parseInt(year);
    if (category) filter.category = category;
    if (cropID) filter.cropID = cropID;

    const expenses = await Expense.find(filter)
      .populate('cropID', 'cropName cropNameUrdu')
      .sort({ date: -1 });

    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) { next(error); }
});

// Summary: P&L per season/year
router.get('/summary', protect, async (req, res, next) => {
  try {
    const { season, year = new Date().getFullYear() } = req.query;
    const filter = { userID: req.user.id, year: parseInt(year) };
    if (season) filter.season = season;

    const all = await Expense.find(filter).populate('cropID', 'cropName');

    // Aggregate
    const totalExpenses = all.filter(e => !e.isRevenue).reduce((sum, e) => sum + e.amountPKR, 0);
    const totalRevenue = all.filter(e => e.isRevenue).reduce((sum, e) => sum + e.amountPKR, 0);
    const profit = totalRevenue - totalExpenses;

    const byCategory = {};
    all.filter(e => !e.isRevenue).forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amountPKR;
    });

    const byMonth = {};
    all.forEach(e => {
      const month = new Date(e.date).toLocaleString('en-US', { month: 'short' });
      if (!byMonth[month]) byMonth[month] = { expenses: 0, revenue: 0 };
      if (e.isRevenue) byMonth[month].revenue += e.amountPKR;
      else byMonth[month].expenses += e.amountPKR;
    });

    // Break-even per maund (if revenue data exists)
    const totalMaunds = all.filter(e => e.isRevenue && e.quantityMaunds).reduce((sum, e) => sum + e.quantityMaunds, 0);
    const breakEvenPerMaund = totalMaunds > 0 ? Math.ceil(totalExpenses / totalMaunds) : null;

    res.json({
      success: true,
      data: {
        totalExpenses, totalRevenue, profit,
        profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : null,
        totalMaunds, breakEvenPerMaund,
        byCategory,
        byMonth,
        recordCount: all.length
      }
    });
  } catch (error) { next(error); }
});

// Create expense/revenue
router.post('/', protect, async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, userID: req.user.id });
    res.status(201).json({ success: true, data: expense });
  } catch (error) { next(error); }
});

// Update
router.put('/:id', protect, async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: expense });
  } catch (error) { next(error); }
});

// Delete
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const result = await Expense.findOneAndDelete({ _id: req.params.id, userID: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
