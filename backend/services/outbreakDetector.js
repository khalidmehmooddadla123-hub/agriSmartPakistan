/**
 * AgriSmart360 — Pest Outbreak Auto-Detector
 *
 * Aggregates disease reports by (location + disease) over last 24 hours.
 * If >= OUTBREAK_THRESHOLD farmers report same disease in same district,
 * auto-broadcasts an alert to all users in that district.
 *
 * Deduplicates broadcasts to avoid spamming — each outbreak alerted once per 48 hours.
 */

const DiseaseReport = require('../models/DiseaseReport');
const User = require('../models/User');
const Location = require('../models/Location');
const Notification = require('../models/Notification');
const { sendNotification } = require('./notificationService');

const OUTBREAK_THRESHOLD = parseInt(process.env.OUTBREAK_THRESHOLD || '5');
const LOOKBACK_HOURS = 24;
const DEDUPE_HOURS = 48;

/**
 * Check for disease outbreaks and auto-broadcast alerts
 */
exports.detectOutbreaks = async () => {
  console.log('[OUTBREAK] Scanning for pest/disease outbreaks...');

  try {
    const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000);

    // Aggregate reports by location + disease
    const clusters = await DiseaseReport.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { locationID: '$locationID', diseaseID: '$diseaseID' },
          count: { $sum: 1 },
          diseaseName: { $first: '$diseaseName' },
          crop: { $first: '$crop' },
          severity: { $first: '$severity' },
          latestReport: { $max: '$createdAt' }
        }
      },
      { $match: { count: { $gte: OUTBREAK_THRESHOLD } } },
      { $sort: { count: -1 } }
    ]);

    if (clusters.length === 0) {
      console.log('[OUTBREAK] No outbreaks detected.');
      return { detected: 0, broadcasted: 0 };
    }

    console.log(`[OUTBREAK] Found ${clusters.length} potential outbreaks`);

    let broadcasted = 0;

    for (const cluster of clusters) {
      const { locationID, diseaseID } = cluster._id;

      // Dedupe: check if we already alerted for this cluster in last 48 hours
      const dedupeSince = new Date(Date.now() - DEDUPE_HOURS * 60 * 60 * 1000);
      const existingAlert = await Notification.findOne({
        type: 'broadcast',
        title: { $regex: `Outbreak.*${cluster.diseaseName}`, $options: 'i' },
        createdAt: { $gte: dedupeSince }
      });

      if (existingAlert) {
        console.log(`[OUTBREAK] Skipping ${cluster.diseaseName} — already alerted recently`);
        continue;
      }

      const location = await Location.findById(locationID);
      if (!location) continue;

      // Find all users in this district
      const affectedUsers = await User.find({
        locationID,
        isActive: true
      });

      if (affectedUsers.length === 0) continue;

      console.log(`[OUTBREAK] ${cluster.diseaseName} in ${location.city}: ${cluster.count} reports, alerting ${affectedUsers.length} users`);

      // Send personalized alert to each user in the district
      for (const user of affectedUsers) {
        const isUrdu = user.language === 'ur';

        const title = isUrdu
          ? `🚨 آپ کے علاقے میں ${cluster.diseaseName} کا پھیلاؤ`
          : `🚨 Outbreak Alert: ${cluster.diseaseName} in your area`;

        const message = isUrdu
          ? `${location.cityUrdu || location.city} میں پچھلے 24 گھنٹوں میں ${cluster.count} کسانوں نے ${cluster.crop} پر ${cluster.diseaseName} کی اطلاع دی ہے۔ اپنی فصل کا فوراً جائزہ لیں اور احتیاطی تدابیر اختیار کریں۔ تفصیل کے لیے بیماری اسکینر کھولیں۔`
          : `${cluster.count} farmers in ${location.city} have reported ${cluster.diseaseName} on ${cluster.crop} in the last 24 hours. Inspect your crops immediately and take preventive action. Open the Disease Scanner for treatment details.`;

        try {
          await sendNotification(user._id, {
            type: 'broadcast',
            title,
            message
          });
          broadcasted++;
        } catch (err) {
          console.error(`[OUTBREAK] Failed to notify ${user._id}:`, err.message);
        }
      }
    }

    console.log(`[OUTBREAK] Completed: ${broadcasted} alerts broadcasted`);
    return { detected: clusters.length, broadcasted };
  } catch (error) {
    console.error('[OUTBREAK] Error:', error.message);
    return { detected: 0, broadcasted: 0, error: error.message };
  }
};

/**
 * Get current outbreak map for admin/public viewing
 */
exports.getCurrentOutbreaks = async () => {
  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000);

  const outbreaks = await DiseaseReport.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { locationID: '$locationID', diseaseID: '$diseaseID' },
        count: { $sum: 1 },
        diseaseName: { $first: '$diseaseName' },
        crop: { $first: '$crop' },
        severity: { $first: '$severity' },
        latestReport: { $max: '$createdAt' }
      }
    },
    { $match: { count: { $gte: Math.max(2, OUTBREAK_THRESHOLD - 2) } } }, // lower threshold for dashboard
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  // Populate location info
  const Location = require('../models/Location');
  const populated = await Promise.all(outbreaks.map(async (o) => {
    const loc = await Location.findById(o._id.locationID).select('city cityUrdu province latitude longitude');
    return {
      ...o,
      location: loc,
      isOutbreak: o.count >= OUTBREAK_THRESHOLD
    };
  }));

  return populated;
};
