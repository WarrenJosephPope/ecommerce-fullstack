const phoneAuthService = require('../services/phoneAuthService');
const { asyncHandler } = require('../middleware/error');
const { BadRequestError } = require('../utils/errors');
const { validationResult } = require('express-validator');

/**
 * Send OTP to phone number
 */
const sendOtp = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { phone } = req.body;

  // Send OTP
  const result = await phoneAuthService.sendOtp(phone);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Verify OTP and login/register
 */
const verifyOtp = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { phone, code } = req.body;

  // Verify OTP and login
  const result = await phoneAuthService.verifyOtpAndLogin(phone, code);

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Link phone to existing user account
 */
const linkPhone = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { phone, code } = req.body;
  const userId = req.user.userId;

  // Link phone
  const result = await phoneAuthService.linkPhoneToUser(userId, phone, code);

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  sendOtp,
  verifyOtp,
  linkPhone,
};
