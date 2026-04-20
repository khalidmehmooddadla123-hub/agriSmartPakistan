/**
 * AgriSmart360 — Daily Digest Email Service
 *
 * Builds personalized morning digests for each user containing:
 * - Today's top crop prices (focused on user's selected crops)
 * - Weather forecast for user's location
 * - Latest breaking news
 * - Farming tips
 */

const nodemailer = require('nodemailer');
const User = require('../models/User');
const Price = require('../models/Price');
const Weather = require('../models/Weather');
const News = require('../models/News');

const APP_NAME = 'AgriSmart360';
const FROM_EMAIL = () => process.env.EMAIL_USER || 'noreply@agrismart360.com';

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

/**
 * Build HTML digest for a single user
 */
const buildDigestHTML = (user, data) => {
  const { prices, weather, news } = data;
  const lang = user.language || 'en';
  const isUrdu = lang === 'ur';
  const dir = isUrdu ? 'rtl' : 'ltr';
  const dateStr = new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const weatherHTML = weather ? `
    <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px; font-size: 16px;">🌤 ${isUrdu ? 'آج کا موسم' : "Today's Weather"}</h3>
      <div style="font-size: 36px; font-weight: bold; margin: 8px 0;">${weather.temperature}°C</div>
      <div style="font-size: 13px; opacity: 0.9; text-transform: capitalize;">${weather.description}</div>
      <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 12px;">
        <span>💧 ${isUrdu ? 'نمی' : 'Humidity'}: ${weather.humidity}%</span>
        <span>💨 ${isUrdu ? 'ہوا' : 'Wind'}: ${weather.windSpeed} km/h</span>
      </div>
    </div>
  ` : '';

  const priceRows = prices.slice(0, 6).map(p => {
    const change = p.previousPrice ? (((p.price - p.previousPrice) / p.previousPrice) * 100).toFixed(1) : null;
    const isUp = change > 0;
    const color = isUp ? '#16a34a' : '#dc2626';
    const arrow = isUp ? '↑' : '↓';
    return `<tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 8px;">${isUrdu && p.cropID?.cropNameUrdu ? p.cropID.cropNameUrdu : p.cropID?.cropName}</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: bold;">${p.currency} ${p.price?.toLocaleString()}</td>
      <td style="padding: 10px 8px; text-align: right; color: ${color}; font-size: 12px;">${change !== null ? `${arrow} ${Math.abs(change)}%` : '-'}</td>
    </tr>`;
  }).join('');

  const pricesHTML = prices.length > 0 ? `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #16a34a;">💰 ${isUrdu ? 'آج کی قیمتیں' : "Today's Prices"}</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f9fafb; color: #6b7280; font-size: 11px;">
            <th style="padding: 8px; text-align: left;">${isUrdu ? 'فصل' : 'Crop'}</th>
            <th style="padding: 8px; text-align: right;">${isUrdu ? 'قیمت' : 'Price'}</th>
            <th style="padding: 8px; text-align: right;">${isUrdu ? 'تبدیلی' : 'Change'}</th>
          </tr>
        </thead>
        <tbody>${priceRows}</tbody>
      </table>
    </div>
  ` : '';

  const newsHTML = news.length > 0 ? `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; color: #16a34a;">📰 ${isUrdu ? 'تازہ خبریں' : 'Latest News'}</h3>
      ${news.slice(0, 3).map(n => `
        <div style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
          ${n.isBreaking ? `<span style="background:#fee2e2;color:#dc2626;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:bold;">${isUrdu ? 'تازہ ترین' : 'BREAKING'}</span>` : ''}
          <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-top: 4px;">${isUrdu && n.titleUrdu ? n.titleUrdu : n.title}</div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">${n.source || ''}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tipsHTML = `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px; font-size: 14px; color: #166534;">🌱 ${isUrdu ? 'آج کا کاشتکاری مشورہ' : "Today's Farming Tip"}</h3>
      <p style="margin: 0; font-size: 13px; color: #166534;">
        ${weather && weather.temperature > 35
          ? (isUrdu ? 'آج شدید گرمی ہے۔ صبح سویرے یا شام کو آبپاشی کریں اور فصلوں کو دھوپ سے بچانے کی کوشش کریں۔' : 'High heat today. Irrigate in early morning or evening. Protect crops from direct sun.')
          : weather && weather.humidity > 80
          ? (isUrdu ? 'نمی زیادہ ہے — فنگس کا خطرہ ہے۔ فصلوں کو چیک کریں۔' : 'High humidity — fungus risk. Inspect your crops for early signs.')
          : (isUrdu ? 'موسم کاشتکاری کے لیے موزوں ہے۔ اپنے کھیتوں کا باقاعدہ جائزہ لیں۔' : 'Weather is favorable for farming. Do regular field inspections.')}
      </p>
    </div>
  `;

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, 'Noto Nastaliq Urdu', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #16a34a, #059669); color: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
      <div style="font-size: 40px;">🌾</div>
      <h1 style="margin: 8px 0; font-size: 22px;">${APP_NAME}</h1>
      <p style="margin: 0; opacity: 0.9; font-size: 13px;">${isUrdu ? 'آپ کا روزانہ زرعی خلاصہ' : 'Your Daily Farming Digest'}</p>
      <p style="margin: 4px 0 0; opacity: 0.8; font-size: 11px;">${dateStr}</p>
    </div>

    <p style="font-size: 14px; color: #4b5563;">${isUrdu ? 'السلام علیکم' : 'Hello'} <strong>${user.fullName}</strong>,</p>
    <p style="font-size: 13px; color: #6b7280; margin-bottom: 20px;">
      ${isUrdu ? 'یہ رہا آپ کا آج کا زرعی خلاصہ' : "Here's your personalized farming update for today."}
    </p>

    ${weatherHTML}
    ${pricesHTML}
    ${newsHTML}
    ${tipsHTML}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard"
        style="background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
        ${isUrdu ? 'ڈیش بورڈ کھولیں' : 'Open Dashboard'}
      </a>
    </div>

    <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #9ca3af;">
      <p>AgriSmart360 — ${isUrdu ? 'سمارٹ زراعت مینجمنٹ پلیٹ فارم' : 'Smart Agriculture Management Platform'}</p>
      <p>${isUrdu ? 'اطلاعات روکنے کے لیے' : 'To unsubscribe, visit'} <a href="${process.env.CLIENT_URL}/profile" style="color: #16a34a;">${isUrdu ? 'پروفائل سیٹنگز' : 'profile settings'}</a></p>
    </div>
  </div>
</body></html>`;
};

/**
 * Send digest to all active users with notifEmail enabled
 */
exports.sendDailyDigests = async () => {
  console.log('[DIGEST] Starting daily digest job...');

  try {
    const users = await User.find({
      isActive: true,
      notifEmail: true,
      email: { $exists: true, $ne: null }
    }).populate('locationID selectedCrops');

    let sent = 0;
    let failed = 0;

    const transporter = createTransporter();

    // Shared data: latest news (same for everyone)
    const news = await News.find({ isPublished: true })
      .sort({ isBreaking: -1, publishedAt: -1 })
      .limit(3)
      .lean();

    for (const user of users) {
      try {
        // Get personalized prices (user's selected crops or top 6)
        const priceFilter = { priceType: 'national' };
        if (user.selectedCrops?.length > 0) {
          priceFilter.cropID = { $in: user.selectedCrops.map(c => c._id) };
        }

        const prices = await Price.aggregate([
          { $match: priceFilter },
          { $sort: { recordedAt: -1 } },
          { $group: {
            _id: '$cropID',
            price: { $first: '$price' },
            previousPrice: { $first: '$previousPrice' },
            currency: { $first: '$currency' },
            recordedAt: { $first: '$recordedAt' }
          }},
          { $limit: 6 }
        ]);

        const populatedPrices = await Price.populate(prices.map(p => ({
          cropID: p._id,
          price: p.price,
          previousPrice: p.previousPrice,
          currency: p.currency
        })), { path: 'cropID', select: 'cropName cropNameUrdu unit' });

        // Get weather for user's location
        let weather = null;
        if (user.locationID) {
          weather = await Weather.findOne({ locationID: user.locationID._id || user.locationID })
            .sort({ updatedAt: -1 }).lean();
        }

        const html = buildDigestHTML(user, {
          prices: populatedPrices,
          weather,
          news
        });

        const subject = user.language === 'ur'
          ? `🌾 ${APP_NAME} - آپ کا روزانہ خلاصہ`
          : `🌾 ${APP_NAME} - Your Daily Farming Digest`;

        await transporter.sendMail({
          from: `${APP_NAME} <${FROM_EMAIL()}>`,
          to: user.email,
          subject,
          html
        });

        sent++;
      } catch (err) {
        failed++;
        console.error(`[DIGEST] Failed for ${user.email}:`, err.message);
      }
    }

    console.log(`[DIGEST] Completed: ${sent} sent, ${failed} failed out of ${users.length} users`);
    return { sent, failed, total: users.length };
  } catch (error) {
    console.error('[DIGEST] Fatal error:', error.message);
    return { sent: 0, failed: 0, total: 0, error: error.message };
  }
};
