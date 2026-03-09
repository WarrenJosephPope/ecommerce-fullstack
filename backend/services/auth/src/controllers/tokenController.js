const tokenService = require('../services/tokenService');
const { asyncHandler } = require('../middleware/error');
const { UnauthenticatedError } = require('../utils/errors');

/**
 * Refresh access token
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new UnauthenticatedError('Refresh token not found');
  }

  // Refresh access token
  const result = await tokenService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

/**
 * Rotate refresh token (get new refresh and access tokens)
 */
const rotate = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new UnauthenticatedError('Refresh token not found');
  }

  // Rotate refresh token
  const result = await tokenService.rotateRefreshToken(refreshToken);

  // Set new refresh token as httpOnly cookie
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
 * Logout user
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // Revoke refresh token
  await tokenService.logout(refreshToken);

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get current user info
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  refresh,
  rotate,
  logout,
  getCurrentUser,
};
