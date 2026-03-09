const anonymousAuthService = require('../services/anonymousAuthService');
const { asyncHandler } = require('../middleware/error');
const { BadRequestError } = require('../utils/errors');
const { validationResult } = require('express-validator');

/**
 * Create anonymous user account
 */
const createAnonymous = asyncHandler(async (req, res) => {
  // Create anonymous user
  const result = await anonymousAuthService.createAnonymousUser();

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Convert anonymous account to email/password account
 */
const convertToEmail = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { email, password } = req.body;
  const userId = req.user.userId;

  // Convert to email account
  const result = await anonymousAuthService.convertAnonymousToEmail(userId, email, password);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Convert anonymous account to phone account
 */
const convertToPhone = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { phone } = req.body;
  const userId = req.user.userId;

  // Convert to phone account (OTP verification still needed)
  const result = await anonymousAuthService.convertAnonymousToPhone(userId, phone);

  res.json({
    success: true,
    data: result,
    message: 'Phone added. Please verify with OTP.',
  });
});

module.exports = {
  createAnonymous,
  convertToEmail,
  convertToPhone,
};
