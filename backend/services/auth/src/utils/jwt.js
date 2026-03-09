const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate Access Token
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.userId - User ID
 * @param {string} [payload.email] - User email (optional)
 * @param {string} [payload.phone] - User phone (optional)
 * @param {boolean} [payload.isAnonymous] - Whether user is anonymous
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      phone: payload.phone,
      isAnonymous: payload.isAnonymous || false,
      type: 'access',
    },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiry,
    }
  );
}

/**
 * Generate Refresh Token
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.userId - User ID
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      type: 'refresh',
    },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiry,
    }
  );
}

/**
 * Verify Access Token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Invalid access token: ${error.message}`);
  }
}

/**
 * Verify Refresh Token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
}

/**
 * Calculate token expiry date
 * @param {string} expiryString - Expiry string (e.g., '7d', '15m')
 * @returns {Date} Expiry date
 */
function calculateExpiryDate(expiryString) {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = expiryString.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiry format');
  }

  const value = parseInt(match[1]);
  const unit = match[2];
  const milliseconds = value * units[unit];

  return new Date(Date.now() + milliseconds);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  calculateExpiryDate,
};
