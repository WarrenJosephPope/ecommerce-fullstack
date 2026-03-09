const prisma = require('../db/prisma');
const { verifyRefreshToken, generateAccessToken, generateRefreshToken, calculateExpiryDate } = require('../utils/jwt');
const { UnauthenticatedError, NotFoundError } = require('../utils/errors');
const config = require('../config');

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken) {
  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new UnauthenticatedError('Invalid or expired refresh token');
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new NotFoundError('Refresh token not found');
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    // Delete expired token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new UnauthenticatedError('Refresh token expired');
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: storedToken.user.id,
    email: storedToken.user.email,
    phone: storedToken.user.phone,
    isAnonymous: storedToken.user.isAnonymous,
  });

  return {
    accessToken,
    user: {
      id: storedToken.user.id,
      email: storedToken.user.email,
      phone: storedToken.user.phone,
      isAnonymous: storedToken.user.isAnonymous,
    },
  };
}

/**
 * Rotate refresh token (generate new refresh token and invalidate old one)
 */
async function rotateRefreshToken(oldRefreshToken) {
  // Verify old refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    throw new UnauthenticatedError('Invalid or expired refresh token');
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new NotFoundError('Refresh token not found');
  }

  // Delete old refresh token
  await prisma.refreshToken.delete({
    where: { id: storedToken.id },
  });

  // Generate new tokens
  const accessToken = generateAccessToken({
    userId: storedToken.user.id,
    email: storedToken.user.email,
    phone: storedToken.user.phone,
    isAnonymous: storedToken.user.isAnonymous,
  });

  const newRefreshToken = generateRefreshToken({
    userId: storedToken.user.id,
  });

  // Store new refresh token
  const expiresAt = calculateExpiryDate(config.jwt.refreshExpiry);
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.user.id,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: storedToken.user.id,
      email: storedToken.user.email,
      phone: storedToken.user.phone,
      isAnonymous: storedToken.user.isAnonymous,
    },
  };
}

/**
 * Logout - revoke refresh token
 */
async function logout(refreshToken) {
  if (!refreshToken) {
    return { success: true };
  }

  // Delete refresh token from database
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });

  return { success: true };
}

/**
 * Clean up expired tokens (can be run as a cron job)
 */
async function cleanupExpiredTokens() {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return {
    deletedCount: result.count,
  };
}

module.exports = {
  refreshAccessToken,
  rotateRefreshToken,
  logout,
  cleanupExpiredTokens,
};
