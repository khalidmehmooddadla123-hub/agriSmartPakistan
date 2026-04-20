const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Price = require('../models/Price');
const Crop = require('../models/Crop');

/**
 * @swagger
 * /export/prices/csv:
 *   get:
 *     summary: Export prices as CSV
 *     tags: [Export]
 *     parameters:
 *       - in: query
 *         name: priceType
 *         schema: { type: string, enum: [international, national, local], default: national }
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200: { description: CSV file download }
 */
router.get('/prices/csv', protect, async (req, res, next) => {
  try {
    const { priceType = 'national', days = 30, locationID } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = { priceType, recordedAt: { $gte: startDate } };
    if (locationID) filter.locationID = locationID;

    const prices = await Price.find(filter)
      .populate('cropID', 'cropName cropNameUrdu category unit')
      .populate('locationID', 'city province')
      .sort({ recordedAt: -1 })
      .limit(5000);

    // Build CSV
    const headers = ['Date', 'Crop', 'Crop (Urdu)', 'Category', 'Price', 'Previous Price', 'Change %', 'Currency', 'Type', 'City', 'Province', 'Source'];
    const rows = prices.map(p => {
      const change = p.previousPrice ? (((p.price - p.previousPrice) / p.previousPrice) * 100).toFixed(2) : '';
      return [
        new Date(p.recordedAt).toISOString().split('T')[0],
        p.cropID?.cropName || '',
        p.cropID?.cropNameUrdu || '',
        p.cropID?.category || '',
        p.price,
        p.previousPrice || '',
        change,
        p.currency,
        p.priceType,
        p.locationID?.city || '',
        p.locationID?.province || '',
        p.source || ''
      ].map(v => `"${v}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=agrismart360-prices-${priceType}-${days}days.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /export/prices/pdf:
 *   get:
 *     summary: Export prices as PDF-ready HTML report
 *     tags: [Export]
 *     parameters:
 *       - in: query
 *         name: priceType
 *         schema: { type: string, default: national }
 *     responses:
 *       200: { description: HTML report for printing/PDF }
 */
router.get('/prices/pdf', protect, async (req, res, next) => {
  try {
    const { priceType = 'national', locationID } = req.query;

    const match = {};
    if (priceType) match.priceType = priceType;
    if (locationID) match.locationID = require('mongoose').Types.ObjectId.createFromHexString(locationID);

    const prices = await Price.aggregate([
      { $match: match },
      { $sort: { recordedAt: -1 } },
      {
        $group: {
          _id: { cropID: '$cropID', priceType: '$priceType' },
          price: { $first: '$price' },
          previousPrice: { $first: '$previousPrice' },
          currency: { $first: '$currency' },
          recordedAt: { $first: '$recordedAt' }
        }
      }
    ]);

    const populatedPrices = await Price.populate(prices.map(p => ({
      cropID: p._id.cropID,
      priceType: p._id.priceType,
      price: p.price,
      previousPrice: p.previousPrice,
      currency: p.currency,
      recordedAt: p.recordedAt
    })), [
      { path: 'cropID', select: 'cropName cropNameUrdu unit' }
    ]);

    const date = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AgriSmart360 - Price Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #16a34a; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #16a34a; color: white; padding: 12px 8px; text-align: left; font-size: 13px; }
    td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    tr:nth-child(even) { background: #f9fafb; }
    .up { color: #16a34a; font-weight: bold; }
    .down { color: #dc2626; font-weight: bold; }
    .footer { margin-top: 30px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌾 AgriSmart360</h1>
    <p>Crop Price Report — ${priceType.charAt(0).toUpperCase() + priceType.slice(1)} Prices</p>
    <p>Generated: ${date}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Crop</th>
        <th>Crop (Urdu)</th>
        <th>Price</th>
        <th>Previous</th>
        <th>Change</th>
        <th>Last Updated</th>
      </tr>
    </thead>
    <tbody>
      ${populatedPrices.map(p => {
        const change = p.previousPrice ? (((p.price - p.previousPrice) / p.previousPrice) * 100).toFixed(1) : '-';
        const isUp = change > 0;
        return `<tr>
          <td>${p.cropID?.cropName || '-'}/${p.cropID?.unit || ''}</td>
          <td dir="rtl">${p.cropID?.cropNameUrdu || '-'}</td>
          <td><strong>${p.currency} ${p.price?.toLocaleString()}</strong></td>
          <td>${p.previousPrice ? p.currency + ' ' + p.previousPrice.toLocaleString() : '-'}</td>
          <td class="${isUp ? 'up' : 'down'}">${change !== '-' ? (isUp ? '+' : '') + change + '%' : '-'}</td>
          <td>${new Date(p.recordedAt).toLocaleDateString('en-PK')}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  <div class="footer">
    <p>AgriSmart360 — Smart Agriculture Management Platform</p>
    <p>This report was auto-generated. Data is for informational purposes only.</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
