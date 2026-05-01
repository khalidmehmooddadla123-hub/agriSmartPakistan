const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// Field-specific validators
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Register new user (email + password only)
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, language, locationID } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, field: 'fullName', message: 'Full name is required (min 2 characters)' });
    }
    if (!email) {
      return res.status(400).json({ success: false, field: 'email', message: 'Email is required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, field: 'email', message: 'Please enter a valid email address' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, field: 'password', message: 'Password must be at least 8 characters' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, field: 'email', message: 'This email is already registered. Please log in instead.' });
    }

    const user = await User.create({
      fullName,
      email,
      passwordHash: password,
      language: language || 'en',
      locationID,
      isVerified: true
    });

    // Fire-and-forget welcome email — sent to the user's OWN email,
    // not to the admin SMTP account. Failure here doesn't block registration.
    sendWelcomeEmail(email, fullName, language || 'en').catch(err => {
      console.error(`[REGISTER] Welcome email failed for ${email}:`, err.message);
    });

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          language: user.language,
          locationID: user.locationID,
          notifEmail: user.notifEmail
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with email and password
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ success: false, field: 'email', message: 'Please enter your email' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ success: false, field: 'email', message: 'Please enter a valid email address' });
    if (!password) return res.status(400).json({ success: false, field: 'password', message: 'Please enter your password' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, field: 'email', message: 'No account found with this email. Please register first.' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        field: 'password',
        message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      const remaining = Math.max(0, 5 - user.loginAttempts);
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
      await user.save();
      return res.status(401).json({
        success: false,
        field: 'password',
        message: remaining > 0
          ? `Wrong password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before account lock.`
          : 'Wrong password — account is now locked for 30 minutes.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, field: 'email', message: 'This account has been deactivated. Please contact support.' });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          language: user.language,
          locationID: user.locationID,
          notifEmail: user.notifEmail,
          selectedCrops: user.selectedCrops
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('locationID')
      .populate('selectedCrops');

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.language);
    } catch (err) {
      console.error('[RESET] Email send failed:', err.message);
    }

    res.json({
      success: true,
      message: 'Password reset link sent to email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const token = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      success: true,
      data: { token, refreshToken: newRefreshToken }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
