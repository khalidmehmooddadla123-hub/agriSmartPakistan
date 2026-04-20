/**
 * SMS Service using Twilio
 * Falls back to console.log when Twilio credentials are not configured
 */

let twilioClient = null;

const initTwilio = () => {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (accountSid && authToken && accountSid !== 'your_twilio_sid') {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(accountSid, authToken);
      console.log('[SMS] Twilio client initialized');
    } catch (err) {
      console.warn('[SMS] Twilio package not installed. Run: npm install twilio');
      twilioClient = null;
    }
  } else {
    console.warn('[SMS] Twilio credentials not configured - SMS will be logged to console');
  }

  return twilioClient;
};

/**
 * Send SMS message
 */
const sendSMS = async (phone, message) => {
  const client = initTwilio();

  if (!client) {
    console.log(`[SMS-DEV] To: ${phone} | Message: ${message}`);
    return { success: true, dev: true };
  }

  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });

  console.log(`[SMS] Sent to ${phone} | SID: ${result.sid}`);
  return { success: true, sid: result.sid };
};

/**
 * Send OTP via SMS
 */
exports.sendOTPSMS = async (phone, otp, language = 'en') => {
  const message = language === 'ur'
    ? `AgriSmart360 - آپ کا تصدیقی کوڈ: ${otp}\nیہ کوڈ 5 منٹ میں ختم ہو جائے گا۔`
    : `AgriSmart360 - Your verification code: ${otp}\nThis code expires in 5 minutes.`;

  return sendSMS(phone, message);
};

/**
 * Send price alert via SMS
 */
exports.sendPriceAlertSMS = async (phone, alertData, language = 'en') => {
  const { cropName, cropNameUrdu, currentPrice, threshold, direction, currency } = alertData;

  const message = language === 'ur'
    ? `AgriSmart360 الرٹ: ${cropNameUrdu || cropName} کی قیمت ${currency} ${currentPrice} ہو گئی ہے (حد: ${currency} ${threshold} ${direction === 'above' ? 'سے اوپر' : 'سے نیچے'})۔`
    : `AgriSmart360 Alert: ${cropName} price is now ${currency} ${currentPrice} (${direction} your threshold of ${currency} ${threshold}).`;

  return sendSMS(phone, message);
};

/**
 * Send general notification via SMS
 */
exports.sendNotificationSMS = async (phone, title, message) => {
  return sendSMS(phone, `AgriSmart360: ${title}\n${message}`);
};
