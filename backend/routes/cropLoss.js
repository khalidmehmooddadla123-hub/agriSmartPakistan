const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CropLoss = require('../models/CropLoss');

router.get('/', protect, async (req, res, next) => {
  try {
    const filter = { userID: req.user.id };
    if (req.query.farmID) filter.farmID = req.query.farmID;
    if (req.query.status) filter.claimStatus = req.query.status;

    const reports = await CropLoss.find(filter)
      .populate('farmID', 'name village city')
      .populate('cropID', 'cropName cropNameUrdu')
      .sort({ damageDate: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) { next(error); }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const report = await CropLoss.findOne({ _id: req.params.id, userID: req.user.id })
      .populate('farmID', 'name village city province totalAreaAcres')
      .populate('cropID', 'cropName cropNameUrdu');
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const Farm = require('../models/Farm');
    const farm = await Farm.findOne({ _id: req.body.farmID, userID: req.user.id });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    const report = await CropLoss.create({ ...req.body, userID: req.user.id });
    await report.populate('farmID', 'name village city');
    res.status(201).json({ success: true, data: report });
  } catch (error) { next(error); }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const report = await CropLoss.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      req.body,
      { new: true }
    ).populate('farmID', 'name village city');
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const result = await CropLoss.findOneAndDelete({ _id: req.params.id, userID: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

/**
 * Generate printable claim report (HTML/PDF-ready)
 */
router.get('/:id/report', protect, async (req, res, next) => {
  try {
    const report = await CropLoss.findOne({ _id: req.params.id, userID: req.user.id })
      .populate('userID', 'fullName email phone')
      .populate('farmID', 'name village city province totalAreaAcres locationID')
      .populate('cropID', 'cropName cropNameUrdu');
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });

    const apiBase = `${req.protocol}://${req.get('host')}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Crop Loss Insurance Claim — ${report.cropName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #1f2937; background: #f8fafc; line-height: 1.5; }
    .container { max-width: 850px; margin: 0 auto; padding: 24px; background: white; }
    .hero { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 32px; border-radius: 24px; margin-bottom: 24px; }
    .hero h1 { font-size: 26px; font-weight: 800; }
    .hero .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; }
    .hero .claim-id { font-size: 11px; opacity: 0.8; margin-top: 12px; font-family: monospace; }

    .section { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .section h2 { font-size: 16px; font-weight: 700; color: #1f2937; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #dc2626; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .field { padding: 10px; background: #f9fafb; border-radius: 8px; }
    .field label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
    .field value { font-size: 13px; color: #111827; font-weight: 600; display: block; margin-top: 2px; }

    .stat-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .stat { flex: 1; padding: 14px; background: linear-gradient(135deg, #fef2f2, white); border: 1px solid #fecaca; border-radius: 12px; }
    .stat .label { font-size: 10px; color: #991b1b; text-transform: uppercase; font-weight: 600; }
    .stat .value { font-size: 22px; font-weight: 800; color: #b91c1c; margin-top: 4px; }

    .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .photo-card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .photo-card img { width: 100%; height: 140px; object-fit: cover; display: block; }
    .photo-card .meta { padding: 6px; font-size: 10px; color: #6b7280; background: #f9fafb; }

    .signature { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .signature .line { border-top: 2px solid #1f2937; margin-top: 32px; padding-top: 4px; font-size: 11px; }

    .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 11px; margin-top: 24px; border-top: 1px solid #e5e7eb; }

    @media print { body { background: white; } .no-print { display: none; } }
    @page { size: A4; margin: 1.5cm; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>🚨 Crop Loss Insurance Claim</h1>
      <p class="subtitle">Damage report and supporting documentation</p>
      <div class="claim-id">Claim ID: ${report._id}</div>
    </div>

    <div class="section">
      <h2>Farmer Information</h2>
      <div class="grid-2">
        <div class="field"><label>Full Name</label><value>${report.userID.fullName}</value></div>
        <div class="field"><label>Phone</label><value>${report.userID.phone || 'N/A'}</value></div>
        <div class="field"><label>Email</label><value>${report.userID.email || 'N/A'}</value></div>
        <div class="field"><label>Report Date</label><value>${new Date(report.reportedAt).toLocaleDateString()}</value></div>
      </div>
    </div>

    <div class="section">
      <h2>Farm Details</h2>
      <div class="grid-2">
        <div class="field"><label>Farm Name</label><value>${report.farmID.name}</value></div>
        <div class="field"><label>Total Area</label><value>${report.farmID.totalAreaAcres} acres</value></div>
        <div class="field"><label>Village</label><value>${report.farmID.village || 'N/A'}</value></div>
        <div class="field"><label>City</label><value>${report.farmID.city || 'N/A'}</value></div>
      </div>
    </div>

    <div class="section">
      <h2>Damage Assessment</h2>
      <div class="stat-row">
        <div class="stat">
          <div class="label">Crop</div>
          <div class="value" style="font-size:16px">${report.cropName}</div>
        </div>
        <div class="stat">
          <div class="label">Affected Area</div>
          <div class="value">${report.affectedAreaAcres} acres</div>
        </div>
        <div class="stat">
          <div class="label">Damage</div>
          <div class="value">${report.damagePercent || 'N/A'}%</div>
        </div>
        <div class="stat">
          <div class="label">Est. Loss</div>
          <div class="value">PKR ${(report.estimatedLossPKR || 0).toLocaleString()}</div>
        </div>
      </div>
      <div class="grid-2">
        <div class="field"><label>Damage Cause</label><value style="text-transform:uppercase">${report.cause.replace(/_/g, ' ')}</value></div>
        <div class="field"><label>Damage Date</label><value>${new Date(report.damageDate).toLocaleDateString()}</value></div>
      </div>
      ${report.causeDescription ? `<div class="field" style="margin-top:8px"><label>Description</label><value>${report.causeDescription}</value></div>` : ''}
      ${report.latitude ? `<div class="field" style="margin-top:8px"><label>GPS Coordinates</label><value>${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}</value></div>` : ''}
    </div>

    ${report.photos?.length > 0 ? `
    <div class="section">
      <h2>📸 Photographic Evidence</h2>
      <div class="photos">
        ${report.photos.map(p => `
          <div class="photo-card">
            <img src="${p.url?.startsWith('http') ? p.url : apiBase + p.url}" alt="Damage photo" />
            <div class="meta">
              ${new Date(p.capturedAt).toLocaleDateString()}
              ${p.latitude ? `<br/>📍 ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${report.insuranceCompany ? `
    <div class="section">
      <h2>Insurance Information</h2>
      <div class="grid-2">
        <div class="field"><label>Insurance Company</label><value>${report.insuranceCompany}</value></div>
        <div class="field"><label>Policy Number</label><value>${report.policyNumber || 'N/A'}</value></div>
        <div class="field"><label>Claim Status</label><value style="text-transform:uppercase">${report.claimStatus.replace(/_/g, ' ')}</value></div>
        <div class="field"><label>Claim Amount</label><value>PKR ${(report.claimAmount || 0).toLocaleString()}</value></div>
      </div>
    </div>
    ` : ''}

    <div class="signature">
      <div>
        <div class="line">Farmer Signature & Date</div>
      </div>
      <div>
        <div class="line">Insurance Officer Signature & Stamp</div>
      </div>
    </div>

    <div class="footer">
      Generated by AgriSmart360 — ${new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>
      <strong>Press Ctrl+P (or Cmd+P) to print or save as PDF</strong>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) { next(error); }
});

module.exports = router;
