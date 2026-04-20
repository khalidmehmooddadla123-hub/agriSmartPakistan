/**
 * AgriSmart360 — Harvest Reminder Service
 *
 * Checks each user's cropSchedule and notifies them 7 days before
 * expected harvest date, and again 1 day before.
 *
 * Also auto-calculates expected harvest dates using Pakistan crop calendar.
 */

const User = require('../models/User');
const { sendNotification } = require('./notificationService');

// Pakistan crop growth duration (days from sow to harvest)
const cropGrowthDays = {
  wheat: 130, rice: 130, cotton: 160, sugarcane: 300, maize: 90,
  potato: 90, tomato: 75, onion: 150, mango: 120, mustard: 110,
  lentil: 110, chickpea: 120, sunflower: 100
};

const cropNames = {
  wheat: { en: 'Wheat', ur: 'گندم' }, rice: { en: 'Rice', ur: 'چاول' },
  cotton: { en: 'Cotton', ur: 'کپاس' }, sugarcane: { en: 'Sugarcane', ur: 'گنا' },
  maize: { en: 'Maize', ur: 'مکئی' }, potato: { en: 'Potato', ur: 'آلو' },
  tomato: { en: 'Tomato', ur: 'ٹماٹر' }, onion: { en: 'Onion', ur: 'پیاز' },
  mango: { en: 'Mango', ur: 'آم' }, mustard: { en: 'Mustard', ur: 'سرسوں' },
  lentil: { en: 'Lentil', ur: 'مسور' }, chickpea: { en: 'Chickpea', ur: 'چنا' },
  sunflower: { en: 'Sunflower', ur: 'سورج مکھی' }
};

/**
 * Check all users' crop schedules and send reminders
 */
exports.checkHarvestReminders = async () => {
  console.log('[HARVEST] Checking harvest reminders...');

  try {
    const users = await User.find({
      isActive: true,
      'cropSchedule.0': { $exists: true }
    }).populate('cropSchedule.cropID');

    let remindersSent = 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const user of users) {
      let userUpdated = false;

      for (const schedule of user.cropSchedule) {
        if (!schedule.cropID || !schedule.sowDate) continue;

        // Auto-calculate expected harvest date if not set
        if (!schedule.expectedHarvestDate) {
          const cropKey = schedule.cropID.cropName?.toLowerCase();
          const growthDays = cropGrowthDays[cropKey] || 120;
          schedule.expectedHarvestDate = new Date(
            new Date(schedule.sowDate).getTime() + growthDays * 24 * 60 * 60 * 1000
          );
          userUpdated = true;
        }

        const harvestDate = new Date(schedule.expectedHarvestDate);
        const daysUntilHarvest = Math.floor((harvestDate - today) / (24 * 60 * 60 * 1000));

        // Reminder 7 days before
        if (daysUntilHarvest === 7 && !schedule.reminded) {
          const cropName = user.language === 'ur'
            ? (schedule.cropID.cropNameUrdu || schedule.cropID.cropName)
            : schedule.cropID.cropName;

          const title = user.language === 'ur'
            ? `🌾 ${cropName} کی کٹائی قریب ہے`
            : `🌾 Upcoming Harvest: ${cropName}`;

          const message = user.language === 'ur'
            ? `آپ کی ${cropName} کی فصل 7 دن میں تیار ہو جائے گی (${harvestDate.toLocaleDateString('ur-PK')})۔ کٹائی کی تیاریاں شروع کر دیں۔ فصل کی حالت کا روزانہ جائزہ لیں، بازار کی قیمتیں چیک کریں، اور کٹائی کے اوزار تیار رکھیں۔`
            : `Your ${cropName} crop will be ready for harvest in 7 days (${harvestDate.toLocaleDateString('en-PK')}). Start preparing: check daily crop condition, monitor market prices, and arrange harvesting equipment.`;

          await sendNotification(user._id, {
            type: 'broadcast',
            title,
            message
          });

          schedule.reminded = true;
          userUpdated = true;
          remindersSent++;
          console.log(`[HARVEST] Reminder sent to ${user.email || user.phone} for ${cropName}`);
        }

        // Final reminder 1 day before
        if (daysUntilHarvest === 1) {
          const cropName = user.language === 'ur'
            ? (schedule.cropID.cropNameUrdu || schedule.cropID.cropName)
            : schedule.cropID.cropName;

          const title = user.language === 'ur'
            ? `⚡ کل ${cropName} کی کٹائی کا دن`
            : `⚡ Harvest Tomorrow: ${cropName}`;

          const message = user.language === 'ur'
            ? `کل آپ کی ${cropName} کی کٹائی کا مقررہ دن ہے۔ موسم کی پیشگوئی ضرور چیک کریں۔`
            : `Your ${cropName} is scheduled for harvest tomorrow. Check the weather forecast before starting.`;

          await sendNotification(user._id, {
            type: 'broadcast',
            title,
            message
          });

          remindersSent++;
        }
      }

      if (userUpdated) await user.save();
    }

    console.log(`[HARVEST] Completed: ${remindersSent} reminders sent across ${users.length} users`);
    return { remindersSent, users: users.length };
  } catch (error) {
    console.error('[HARVEST] Error:', error.message);
    return { remindersSent: 0, users: 0, error: error.message };
  }
};

/**
 * Helper to auto-fill expected harvest date when user adds crop to schedule
 */
exports.calculateHarvestDate = (cropName, sowDate) => {
  const key = cropName?.toLowerCase();
  const days = cropGrowthDays[key] || 120;
  return new Date(new Date(sowDate).getTime() + days * 24 * 60 * 60 * 1000);
};

exports.cropGrowthDays = cropGrowthDays;
exports.cropNames = cropNames;
