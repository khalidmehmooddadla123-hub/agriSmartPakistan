const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationEmail, sendPriceAlertEmail } = require('./emailService');
const { sendNotificationSMS, sendPriceAlertSMS } = require('./smsService');

/**
 * Emit real-time notification via Socket.io
 */
const emitToUser = (userID, notification) => {
  try {
    const app = require('../server');
    const io = app.get('io');
    if (io) {
      io.to(`user_${userID}`).emit('notification', notification);
    }
  } catch (err) {
    // Socket not available (e.g. during tests)
  }
};

/**
 * Create in-app notification and optionally send via email/SMS
 */
exports.sendNotification = async (userID, { type, title, message }) => {
  // Create in-app notification
  const notification = await Notification.create({
    userID,
    type,
    title,
    message,
    channel: 'in-app',
    isSent: true,
    sentAt: new Date()
  });

  // Emit real-time via Socket.io
  emitToUser(userID, notification.toObject());

  // Fetch user preferences for email/SMS
  const user = await User.findById(userID).select('email phone notifEmail notifSMS language');
  if (!user) return notification;

  // Send email if enabled
  if (user.notifEmail && user.email) {
    try {
      await sendNotificationEmail(user.email, title, message, user.language);
      await Notification.create({
        userID, type, title, message,
        channel: 'email', isSent: true, sentAt: new Date()
      });
    } catch (err) {
      console.error(`[NOTIF] Email failed for user ${userID}:`, err.message);
    }
  }

  // Send SMS if enabled
  if (user.notifSMS && user.phone) {
    try {
      await sendNotificationSMS(user.phone, title, message);
      await Notification.create({
        userID, type, title, message,
        channel: 'sms', isSent: true, sentAt: new Date()
      });
    } catch (err) {
      console.error(`[NOTIF] SMS failed for user ${userID}:`, err.message);
    }
  }

  return notification;
};

/**
 * Send price alert to a specific user across all their enabled channels
 */
exports.sendPriceAlert = async (user, alertData) => {
  const title = user.language === 'ur'
    ? `${alertData.cropNameUrdu || alertData.cropName} قیمت الرٹ`
    : `${alertData.cropName} Price Alert`;

  const message = user.language === 'ur'
    ? `${alertData.cropNameUrdu || alertData.cropName} کی قیمت ${alertData.currency} ${alertData.currentPrice} ہو گئی ہے (حد: ${alertData.currency} ${alertData.threshold} ${alertData.direction === 'above' ? 'سے اوپر' : 'سے نیچے'})۔`
    : `${alertData.cropName} price is now ${alertData.currency} ${alertData.currentPrice} (${alertData.direction} your threshold of ${alertData.currency} ${alertData.threshold}).`;

  // In-app notification
  const notification = await Notification.create({
    userID: user._id,
    type: 'price_alert',
    title,
    message,
    channel: 'in-app',
    isSent: true,
    sentAt: new Date()
  });

  // Emit real-time via Socket.io
  emitToUser(user._id, notification.toObject());

  // Email
  if (user.notifEmail && user.email) {
    try {
      await sendPriceAlertEmail(user.email, alertData, user.language);
    } catch (err) {
      console.error(`[PRICE-ALERT] Email failed for ${user.email}:`, err.message);
    }
  }

  // SMS
  if (user.notifSMS && user.phone) {
    try {
      await sendPriceAlertSMS(user.phone, alertData, user.language);
    } catch (err) {
      console.error(`[PRICE-ALERT] SMS failed for ${user.phone}:`, err.message);
    }
  }
};

/**
 * Send weather alert to users in a specific location
 */
exports.sendWeatherAlert = async (locationID, { title, message }) => {
  const users = await User.find({
    locationID,
    isActive: true
  }).select('_id email phone notifEmail notifSMS language');

  for (const user of users) {
    try {
      await exports.sendNotification(user._id, {
        type: 'weather_alert',
        title,
        message
      });
    } catch (err) {
      console.error(`[WEATHER-ALERT] Failed for user ${user._id}:`, err.message);
    }
  }

  console.log(`[WEATHER-ALERT] Sent to ${users.length} users in location ${locationID}`);
};
