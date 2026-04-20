const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const FROM_EMAIL = () => process.env.EMAIL_USER || 'noreply@agrismart360.com';
const APP_NAME = 'AgriSmart360';

/**
 * Send OTP code via email
 */
exports.sendOTPEmail = async (email, otp, language = 'en') => {
  const transporter = createTransporter();

  const subject = language === 'ur'
    ? `${APP_NAME} - آپ کا تصدیقی کوڈ`
    : `${APP_NAME} - Your Verification Code`;

  const html = language === 'ur' ? `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">${APP_NAME}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>السلام علیکم،</p>
        <p>آپ کا تصدیقی کوڈ:</p>
        <div style="background: white; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #16a34a;">${otp}</span>
        </div>
        <p>یہ کوڈ 5 منٹ میں ختم ہو جائے گا۔</p>
        <p style="color: #6b7280; font-size: 12px;">اگر آپ نے یہ درخواست نہیں کی تو اس ای میل کو نظرانداز کریں۔</p>
      </div>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">${APP_NAME}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div style="background: white; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #16a34a;">${otp}</span>
        </div>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `${APP_NAME} <${FROM_EMAIL()}>`,
    to: email,
    subject,
    html
  });

  console.log(`[EMAIL] OTP sent to ${email}`);
};

/**
 * Send password reset email with link
 */
exports.sendPasswordResetEmail = async (email, resetToken, language = 'en') => {
  const transporter = createTransporter();
  const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const subject = language === 'ur'
    ? `${APP_NAME} - پاس ورڈ دوبارہ ترتیب دیں`
    : `${APP_NAME} - Reset Your Password`;

  const html = language === 'ur' ? `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">${APP_NAME}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>السلام علیکم،</p>
        <p>ہمیں آپ کے اکاؤنٹ کے پاس ورڈ کو دوبارہ ترتیب دینے کی درخواست موصول ہوئی ہے۔</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">پاس ورڈ دوبارہ ترتیب دیں</a>
        </div>
        <p>یہ لنک 1 گھنٹے میں ختم ہو جائے گا۔</p>
        <p style="color: #6b7280; font-size: 12px;">اگر آپ نے یہ درخواست نہیں کی تو اس ای میل کو نظرانداز کریں۔</p>
      </div>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">${APP_NAME}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>Hello,</p>
        <p>We received a request to reset your account password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in <strong>1 hour</strong>.</p>
        <p style="color: #6b7280; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `${APP_NAME} <${FROM_EMAIL()}>`,
    to: email,
    subject,
    html
  });

  console.log(`[EMAIL] Password reset link sent to ${email}`);
};

/**
 * Send price alert notification email
 */
exports.sendPriceAlertEmail = async (email, alertData, language = 'en') => {
  const transporter = createTransporter();
  const { cropName, cropNameUrdu, currentPrice, threshold, direction, currency } = alertData;

  const displayCrop = language === 'ur' ? (cropNameUrdu || cropName) : cropName;
  const subject = language === 'ur'
    ? `${APP_NAME} - ${displayCrop} قیمت الرٹ`
    : `${APP_NAME} - ${cropName} Price Alert`;

  const html = language === 'ur' ? `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">${APP_NAME}</h1>
        <p style="margin: 5px 0 0;">قیمت الرٹ</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>السلام علیکم،</p>
        <p><strong>${displayCrop}</strong> کی قیمت آپ کی مقرر کردہ حد ${direction === 'above' ? 'سے اوپر' : 'سے نیچے'} آ گئی ہے۔</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <table style="width: 100%;">
            <tr><td style="padding: 8px; color: #6b7280;">موجودہ قیمت</td><td style="padding: 8px; font-weight: bold; text-align: left;">${currency} ${currentPrice}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">مقرر حد</td><td style="padding: 8px; font-weight: bold; text-align: left;">${currency} ${threshold}</td></tr>
          </table>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/prices" style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">قیمتیں دیکھیں</a>
        </div>
      </div>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">${APP_NAME}</h1>
        <p style="margin: 5px 0 0;">Price Alert</p>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>Hello,</p>
        <p>The price of <strong>${cropName}</strong> has gone <strong>${direction}</strong> your set threshold.</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <table style="width: 100%;">
            <tr><td style="padding: 8px; color: #6b7280;">Current Price</td><td style="padding: 8px; font-weight: bold;">${currency} ${currentPrice}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Your Threshold</td><td style="padding: 8px; font-weight: bold;">${currency} ${threshold}</td></tr>
          </table>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/prices" style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Prices</a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `${APP_NAME} <${FROM_EMAIL()}>`,
    to: email,
    subject,
    html
  });

  console.log(`[EMAIL] Price alert sent to ${email} for ${cropName}`);
};

/**
 * Send general notification email
 */
exports.sendNotificationEmail = async (email, title, message, language = 'en') => {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;" ${language === 'ur' ? 'dir="rtl"' : ''}>
      <div style="background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">${APP_NAME}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937;">${title}</h2>
        <p style="color: #4b5563;">${message}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/notifications" style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            ${language === 'ur' ? 'ایپ کھولیں' : 'Open App'}
          </a>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `${APP_NAME} <${FROM_EMAIL()}>`,
    to: email,
    subject: `${APP_NAME} - ${title}`,
    html
  });

  console.log(`[EMAIL] Notification sent to ${email}: ${title}`);
};
