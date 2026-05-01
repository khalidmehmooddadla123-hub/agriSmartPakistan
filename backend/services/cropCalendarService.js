/**
 * AgriSmart360 — Crop Calendar Service
 *
 * Auto-generates personalized milestones for each crop based on sow date.
 * Sends reminders 1-3 days before each milestone.
 *
 * Pakistan-specific schedules.
 */

// Days from sow → each milestone
const cropMilestones = {
  wheat: [
    { day: 15, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
    { day: 25, key: 'first_weed', en: 'First Weeding', ur: 'پہلی گوڈی', icon: '🌿' },
    { day: 35, key: 'urea_first', en: '1st Urea Dose', ur: 'پہلی یوریا کھاد', icon: '🧪' },
    { day: 60, key: 'second_irrigation', en: 'Second Irrigation', ur: 'دوسری آبپاشی', icon: '💧' },
    { day: 80, key: 'urea_second', en: '2nd Urea Dose', ur: 'دوسری یوریا', icon: '🧪' },
    { day: 100, key: 'rust_check', en: 'Check for Rust Disease', ur: 'زنگ کا معائنہ', icon: '🔬' },
    { day: 120, key: 'final_irrigation', en: 'Final Irrigation', ur: 'آخری آبپاشی', icon: '💧' },
    { day: 130, key: 'harvest_ready', en: 'Harvest Ready', ur: 'کٹائی تیار', icon: '🌾' }
  ],
  rice: [
    { day: 7, key: 'first_irrigation', en: 'Maintain 5cm water', ur: '5 سینٹی میٹر پانی رکھیں', icon: '💧' },
    { day: 20, key: 'first_weed', en: 'First Weeding', ur: 'پہلی گوڈی', icon: '🌿' },
    { day: 30, key: 'urea_first', en: '1st Urea Application', ur: 'پہلی یوریا', icon: '🧪' },
    { day: 50, key: 'tillering_check', en: 'Check Tillering', ur: 'پھٹاؤ کا معائنہ', icon: '🌱' },
    { day: 70, key: 'urea_second', en: '2nd Urea Application', ur: 'دوسری یوریا', icon: '🧪' },
    { day: 90, key: 'panicle_check', en: 'Panicle Initiation', ur: 'بالی نکلنا', icon: '🌾' },
    { day: 110, key: 'pesticide', en: 'Insect/Disease Spray', ur: 'کیڑے کی دوا', icon: '🧫' },
    { day: 130, key: 'harvest_ready', en: 'Harvest Ready', ur: 'کٹائی تیار', icon: '🌾' }
  ],
  cotton: [
    { day: 10, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
    { day: 25, key: 'thinning', en: 'Thinning', ur: 'پودوں کی چھاٹ', icon: '🌱' },
    { day: 40, key: 'urea_first', en: '1st Urea Dose', ur: 'پہلی یوریا', icon: '🧪' },
    { day: 60, key: 'flowering_check', en: 'Flowering Stage Check', ur: 'پھول آنے کا معائنہ', icon: '🌸' },
    { day: 80, key: 'whitefly_check', en: 'Check for Whitefly', ur: 'سفید مکھی کا معائنہ', icon: '🦟' },
    { day: 100, key: 'urea_second', en: '2nd Urea Dose', ur: 'دوسری یوریا', icon: '🧪' },
    { day: 130, key: 'first_picking', en: 'First Picking', ur: 'پہلی چنائی', icon: '🌿' },
    { day: 160, key: 'harvest_complete', en: 'Final Harvest', ur: 'آخری چنائی', icon: '🌾' }
  ],
  sugarcane: [
    { day: 30, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
    { day: 60, key: 'first_weed', en: 'First Weeding', ur: 'پہلی گوڈی', icon: '🌿' },
    { day: 90, key: 'earthing_up', en: 'Earthing Up', ur: 'مٹی چڑھانا', icon: '⛏' },
    { day: 120, key: 'urea_first', en: '1st Fertilizer', ur: 'پہلی کھاد', icon: '🧪' },
    { day: 180, key: 'mid_check', en: 'Mid-season Check', ur: 'درمیانی معائنہ', icon: '🔬' },
    { day: 240, key: 'urea_second', en: '2nd Fertilizer', ur: 'دوسری کھاد', icon: '🧪' },
    { day: 300, key: 'harvest_ready', en: 'Harvest Ready', ur: 'کٹائی تیار', icon: '🎋' }
  ],
  maize: [
    { day: 7, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
    { day: 20, key: 'first_weed', en: 'First Weeding', ur: 'پہلی گوڈی', icon: '🌿' },
    { day: 30, key: 'urea_first', en: '1st Urea', ur: 'پہلی یوریا', icon: '🧪' },
    { day: 45, key: 'tasseling', en: 'Tasseling Stage', ur: 'بالی نکلنا', icon: '🌽' },
    { day: 60, key: 'urea_second', en: '2nd Urea', ur: 'دوسری یوریا', icon: '🧪' },
    { day: 90, key: 'harvest_ready', en: 'Harvest Ready', ur: 'کٹائی تیار', icon: '🌽' }
  ],
  potato: [
    { day: 10, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
    { day: 25, key: 'earthing_up', en: 'Earthing Up', ur: 'مٹی چڑھانا', icon: '⛏' },
    { day: 40, key: 'urea_first', en: '1st Urea', ur: 'پہلی یوریا', icon: '🧪' },
    { day: 60, key: 'late_blight_check', en: 'Late Blight Check', ur: 'لیٹ بلائٹ معائنہ', icon: '🔬' },
    { day: 75, key: 'urea_second', en: '2nd Urea', ur: 'دوسری یوریا', icon: '🧪' },
    { day: 90, key: 'harvest_ready', en: 'Harvest Ready', ur: 'کٹائی تیار', icon: '🥔' }
  ],
  tomato: [
    { day: 7, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
    { day: 20, key: 'staking', en: 'Stake Plants', ur: 'سہارا دیں', icon: '📐' },
    { day: 30, key: 'urea_first', en: '1st Fertilizer', ur: 'پہلی کھاد', icon: '🧪' },
    { day: 45, key: 'flowering', en: 'Flowering Stage', ur: 'پھول آنا', icon: '🌸' },
    { day: 60, key: 'first_pick', en: 'First Picking', ur: 'پہلی توڑائی', icon: '🍅' },
    { day: 75, key: 'harvest_complete', en: 'Final Picking', ur: 'آخری توڑائی', icon: '🍅' }
  ],
  onion: [
    { day: 15, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
    { day: 30, key: 'first_weed', en: 'First Weeding', ur: 'پہلی گوڈی', icon: '🌿' },
    { day: 60, key: 'urea_first', en: '1st Fertilizer', ur: 'پہلی کھاد', icon: '🧪' },
    { day: 90, key: 'urea_second', en: '2nd Fertilizer', ur: 'دوسری کھاد', icon: '🧪' },
    { day: 120, key: 'pre_harvest', en: 'Stop Watering', ur: 'پانی روکیں', icon: '🚱' },
    { day: 150, key: 'harvest_ready', en: 'Harvest Ready', ur: 'کٹائی تیار', icon: '🧅' }
  ]
};

const generic = [
  { day: 10, key: 'first_irrigation', en: 'First Irrigation', ur: 'پہلی آبپاشی', icon: '💧' },
  { day: 30, key: 'first_fertilizer', en: 'First Fertilizer', ur: 'پہلی کھاد', icon: '🧪' },
  { day: 60, key: 'mid_check', en: 'Mid-season Check', ur: 'درمیانی معائنہ', icon: '🔬' },
  { day: 90, key: 'second_fertilizer', en: 'Second Fertilizer', ur: 'دوسری کھاد', icon: '🧪' },
  { day: 120, key: 'harvest_ready', en: 'Harvest Ready', ur: 'کٹائی تیار', icon: '🌾' }
];

/**
 * Generate milestones for a crop on a farm
 */
exports.generateMilestones = (cropName, sowDate) => {
  const key = (cropName || '').toLowerCase().trim();
  const template = cropMilestones[key] || generic;
  const sowD = new Date(sowDate);

  return template.map(m => ({
    key: m.key,
    label: m.en,
    labelUrdu: m.ur,
    icon: m.icon,
    daysFromSow: m.day,
    date: new Date(sowD.getTime() + m.day * 86400000),
    completed: false,
    notified: false
  }));
};

/**
 * Get all upcoming milestones for a user across all farms
 */
exports.getUserCalendar = async (userId) => {
  const Farm = require('../models/Farm');

  const farms = await Farm.find({ userID: userId, isActive: true })
    .populate('crops.cropID', 'cropName cropNameUrdu unit');

  const events = [];
  const now = new Date();

  for (const farm of farms) {
    for (const crop of (farm.crops || [])) {
      if (!crop.sowDate || !crop.cropID) continue;
      if (crop.status === 'harvested' || crop.status === 'failed') continue;

      const milestones = exports.generateMilestones(crop.cropID.cropName, crop.sowDate);
      milestones.forEach(m => {
        const daysAway = Math.floor((m.date - now) / 86400000);
        events.push({
          ...m,
          farmId: farm._id,
          farmName: farm.name,
          cropEntryId: crop._id,
          cropName: crop.cropID.cropName,
          cropNameUrdu: crop.cropID.cropNameUrdu,
          variety: crop.variety,
          areaAcres: crop.areaAcres,
          isPast: daysAway < 0,
          isToday: daysAway === 0,
          isUpcoming: daysAway > 0 && daysAway <= 7,
          daysAway
        });
      });
    }
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return events;
};

/**
 * Get milestones happening tomorrow (for cron job)
 */
exports.getTomorrowMilestones = async () => {
  const Farm = require('../models/Farm');
  const farms = await Farm.find({ isActive: true })
    .populate('userID', 'fullName email phone language notifEmail notifSMS')
    .populate('crops.cropID', 'cropName cropNameUrdu');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow.getTime() + 86400000);

  const upcoming = [];

  for (const farm of farms) {
    if (!farm.userID) continue;
    for (const crop of (farm.crops || [])) {
      if (!crop.sowDate || !crop.cropID) continue;
      if (crop.status === 'harvested' || crop.status === 'failed') continue;

      const milestones = exports.generateMilestones(crop.cropID.cropName, crop.sowDate);
      milestones.forEach(m => {
        if (m.date >= tomorrow && m.date < tomorrowEnd) {
          upcoming.push({
            user: farm.userID,
            farmName: farm.name,
            cropName: crop.cropID.cropName,
            cropNameUrdu: crop.cropID.cropNameUrdu,
            milestone: m
          });
        }
      });
    }
  }

  return upcoming;
};
