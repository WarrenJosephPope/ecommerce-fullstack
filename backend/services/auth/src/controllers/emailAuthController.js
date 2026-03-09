const emailAuthService = require('../services/emailAuthService');
const { asyncHandler } = require('../middleware/error');
const { BadRequestError } = require('../utils/errors');
const { validationResult } = require('express-validator');

/**
 * Register with email and password
 */
const register = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { email, password } = req.body;

  // Register user
  const result = await emailAuthService.registerWithEmail(email, password);

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
 * Login with email and password
 */
const login = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { email, password } = req.body;

  // Login user
  const result = await emailAuthService.loginWithEmail(email, password);

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
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new BadRequestError('Validation failed');
    error.errors = errors.array();
    throw error;
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  // Change password
  await emailAuthService.changePassword(userId, currentPassword, newPassword);

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  });
});

module.exports = {
  register,
  login,
  changePassword,
};
