const cron = require('node-cron');
const weatherService = require('./weatherService');
const Location = require('../models/Location');
const Price = require('../models/Price');
const Crop = require('../models/Crop');
const User = require('../models/User');
const Weather = require('../models/Weather');
const { sendPriceAlert, sendWeatherAlert } = require('./notificationService');
const { sendDailyDigests } = require('./digestService');
const { checkHarvestReminders } = require('./harvestReminder');
const { detectOutbreaks } = require('./outbreakDetector');
const { getTomorrowMilestones } = require('./cropCalendarService');
const { sendNotification } = require('./notificationService');

// Refresh weather data every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    console.log('[CRON] Refreshing weather data...');
    const locations = await Location.find().limit(50);
    for (const loc of locations) {
      await weatherService.fetchAndCacheWeather(loc._id);
    }
    console.log(`[CRON] Weather refreshed for ${locations.length} locations`);
  } catch (error) {
    console.error('[CRON] Weather refresh error:', error.message);
  }
});

// Price freshness check — once daily at 6:30 AM PKT
// Prices are admin-managed (sourced from AMIS Punjab, PBS, ZTBL bulletins)
// NO random simulation. We just log staleness so admins know when to refresh.
cron.schedule('30 6 * * *', async () => {
  try {
    const { fetchAndStorePrices } = require('./priceService');
    const result = await fetchAndStorePrices();
    console.log(`[CRON] Price freshness check: ${result.stale} stale crops, ${result.updated} updated from external source`);
  } catch (error) {
    console.error('[CRON] Price freshness error:', error.message);
  }
}, { timezone: 'Asia/Karachi' });

// Check price alerts every 30 minutes (runs after price updates)
cron.schedule('5,35 * * * *', async () => {
  try {
    console.log('[CRON] Checking price alerts...');

    // Find users who have price alerts configured
    const users = await User.find({
      isActive: true,
      'priceAlerts.0': { $exists: true }
    }).select('_id email phone notifEmail notifSMS language priceAlerts').populate('priceAlerts.cropID');

    let alertsSent = 0;

    for (const user of users) {
      for (const alert of user.priceAlerts) {
        if (!alert.cropID) continue;

        // Get latest price for this crop
        const latestPrice = await Price.findOne({
          cropID: alert.cropID._id,
          priceType: 'national'
        }).sort({ recordedAt: -1 });

        if (!latestPrice) continue;

        // Check if price crosses threshold
        const shouldAlert =
          (alert.direction === 'above' && latestPrice.price >= alert.threshold) ||
          (alert.direction === 'below' && latestPrice.price <= alert.threshold);

        if (shouldAlert) {
          const alertData = {
            cropName: alert.cropID.name || alert.cropID.nameEn,
            cropNameUrdu: alert.cropID.nameUrdu,
            currentPrice: latestPrice.price,
            threshold: alert.threshold,
            direction: alert.direction,
            currency: latestPrice.currency || 'PKR'
          };

          await sendPriceAlert(user, alertData);
          alertsSent++;
        }
      }
    }

    console.log(`[CRON] Price alerts checked: ${alertsSent} alerts sent`);
  } catch (error) {
    console.error('[CRON] Price alert check error:', error.message);
  }
});

// Refresh news every 3 hours
cron.schedule('0 */3 * * *', async () => {
  try {
    console.log('[CRON] Refreshing news...');
    const { refreshNews } = require('./newsService');
    const count = await refreshNews();
    console.log(`[CRON] News refresh done: ${count} new articles`);
  } catch (error) {
    console.error('[CRON] News refresh error:', error.message);
  }
});

// Check for extreme weather and send alerts every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('[CRON] Checking weather alerts...');
    let alertsSent = 0;

    const locations = await Location.find().limit(50);
    for (const loc of locations) {
      const weather = await Weather.findOne({ locationID: loc._id }).sort({ updatedAt: -1 });
      if (!weather) continue;

      const alerts = [];

      // Extreme heat
      if (weather.temperature >= 45) {
        alerts.push({
          title: 'Extreme Heat Warning',
          titleUrdu: 'شدید گرمی کی وارننگ',
          message: `Temperature in ${loc.city} is ${weather.temperature}°C. Protect crops and livestock. Ensure adequate irrigation.`,
          messageUrdu: `${loc.cityUrdu || loc.city} میں درجہ حرارت ${weather.temperature}°C ہے۔ فصلوں اور مویشیوں کی حفاظت کریں۔`
        });
      }

      // Frost warning
      if (weather.temperature <= 2) {
        alerts.push({
          title: 'Frost Warning',
          titleUrdu: 'پالے کی وارننگ',
          message: `Temperature in ${loc.city} is ${weather.temperature}°C. Cover sensitive crops to prevent frost damage.`,
          messageUrdu: `${loc.cityUrdu || loc.city} میں درجہ حرارت ${weather.temperature}°C ہے۔ حساس فصلوں کو ڈھانپیں۔`
        });
      }

      // Heavy rain
      if (weather.humidity >= 90 && weather.description?.toLowerCase().includes('rain')) {
        alerts.push({
          title: 'Heavy Rain Alert',
          titleUrdu: 'شدید بارش کا الرٹ',
          message: `Heavy rain expected in ${loc.city}. Ensure proper drainage in fields. Delay pesticide spraying.`,
          messageUrdu: `${loc.cityUrdu || loc.city} میں شدید بارش متوقع ہے۔ کھیتوں میں نکاسی یقینی بنائیں۔`
        });
      }

      // Strong wind
      if (weather.windSpeed >= 40) {
        alerts.push({
          title: 'Strong Wind Advisory',
          titleUrdu: 'تیز ہوا کا مشورہ',
          message: `Wind speed in ${loc.city} is ${weather.windSpeed} km/h. Secure crops and farm structures.`,
          messageUrdu: `${loc.cityUrdu || loc.city} میں ہوا کی رفتار ${weather.windSpeed} کلومیٹر/گھنٹہ ہے۔ فصلیں محفوظ کریں۔`
        });
      }

      for (const alert of alerts) {
        await sendWeatherAlert(loc._id, {
          title: alert.title,
          message: alert.message
        });
        alertsSent++;
      }
    }

    console.log(`[CRON] Weather alerts checked: ${alertsSent} alerts sent`);
  } catch (error) {
    console.error('[CRON] Weather alert error:', error.message);
  }
});

// === AUTOMATION CRONS (Steps 1-5) ===

// STEP 1: Daily Digest Email — every morning at 6:00 AM
cron.schedule('0 6 * * *', async () => {
  console.log('[CRON] Running daily digest email...');
  await sendDailyDigests();
}, { timezone: 'Asia/Karachi' });

// STEP 2: Harvest Reminder — every morning at 7:00 AM
cron.schedule('0 7 * * *', async () => {
  console.log('[CRON] Running harvest reminder check...');
  await checkHarvestReminders();
}, { timezone: 'Asia/Karachi' });

// STEP 5: Pest Outbreak Detection — every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('[CRON] Running pest outbreak detection...');
  await detectOutbreaks();
});

// STEP 6: Crop Calendar Milestone Reminders — every day at 7:30 AM PKT
cron.schedule('30 7 * * *', async () => {
  console.log('[CRON] Sending crop calendar milestone reminders...');
  try {
    const tomorrows = await getTomorrowMilestones();
    let sent = 0;
    for (const item of tomorrows) {
      const isUrdu = item.user.language === 'ur';
      const cropName = isUrdu ? (item.cropNameUrdu || item.cropName) : item.cropName;
      const action = isUrdu ? item.milestone.labelUrdu : item.milestone.label;

      try {
        await sendNotification(item.user._id, {
          type: 'broadcast',
          title: isUrdu ? `📅 کل: ${action}` : `📅 Tomorrow: ${action}`,
          message: isUrdu
            ? `آپ کے فارم "${item.farmName}" پر ${cropName} کے لیے کل ${action} کرنا ہے۔ ${item.milestone.icon}`
            : `On your farm "${item.farmName}", ${cropName} needs ${action} tomorrow. ${item.milestone.icon}`
        });
        sent++;
      } catch (err) {
        console.error('[CRON] Calendar reminder failed:', err.message);
      }
    }
    console.log(`[CRON] Calendar reminders sent: ${sent}/${tomorrows.length}`);
  } catch (error) {
    console.error('[CRON] Calendar reminder error:', error.message);
  }
}, { timezone: 'Asia/Karachi' });

console.log('[CRON] Scheduled jobs initialized');
console.log('[CRON] Active jobs:');
console.log('  - Weather refresh: every 30 min');
console.log('  - Price freshness check: 6:30 AM PKT daily (admin-managed prices)');
console.log('  - Price alerts: every 30 min (offset +5)');
console.log('  - News refresh: every 3 hours');
console.log('  - Weather alerts: every hour');
console.log('  - Daily digest: 6:00 AM PKT');
console.log('  - Harvest reminders: 7:00 AM PKT');
console.log('  - Outbreak detection: every 2 hours');
