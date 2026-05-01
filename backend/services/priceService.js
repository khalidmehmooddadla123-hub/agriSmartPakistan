const Crop = require('../models/Crop');
const Price = require('../models/Price');
const Notification = require('../models/Notification');
const User = require('../models/User');

const STALE_HOURS = 48;

/**
 * Real-data price service.
 *
 * NOTE: Pakistan's AMIS Punjab portal (amis.pk) and PBS publish daily mandi rates
 * but they do not expose a stable public JSON API — they publish PDFs/HTML pages.
 * Until we wire a Puppeteer scraper, prices are admin-managed via /admin/prices.
 *
 * This service only flags stale data; it never invents prices.
 */
async function fetchAndStorePrices() {
  const crops = await Crop.find({ isActive: true });
  if (crops.length === 0) return { stale: 0, updated: 0 };

  const cutoff = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);
  let staleCount = 0;
  const staleCrops = [];

  for (const crop of crops) {
    const latest = await Price.findOne({ cropID: crop._id, priceType: 'national' })
      .sort({ recordedAt: -1 });
    if (!latest || latest.recordedAt < cutoff) {
      staleCount++;
      staleCrops.push(crop.name || crop.nameEn);
    }
  }

  // Notify admins so they can refresh prices manually from AMIS bulletins
  if (staleCount > 0) {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    for (const admin of admins) {
      await Notification.create({
        userID: admin._id,
        type: 'system',
        title: `${staleCount} crop price(s) need refresh`,
        message: `Stale (>48h): ${staleCrops.slice(0, 5).join(', ')}${staleCrops.length > 5 ? '…' : ''}. Update from AMIS Punjab / PBS bulletin.`,
        channel: 'in-app',
        isSent: true,
        sentAt: new Date()
      });
    }
  }

  return { stale: staleCount, updated: 0, staleCrops };
}

module.exports = { fetchAndStorePrices, STALE_HOURS };
