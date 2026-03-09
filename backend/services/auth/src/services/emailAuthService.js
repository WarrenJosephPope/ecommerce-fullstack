const prisma = require('../db/prisma');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, calculateExpiryDate } = require('../utils/jwt');
const { ConflictError, UnauthenticatedError, NotFoundError, BadRequestError } = require('../utils/errors');
const config = require('../config');

/**
 * Register a new user with email and password
 */
async function registerWithEmail(email, password) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: false,
      isAnonymous: false,
    },
  });

  // Generate tokens
  const tokens = await createTokensForUser(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
    },
    ...tokens,
  };
}

/**
 * Login with email and password
 */
async function loginWithEmail(email, password) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  // Generate tokens
  const tokens = await createTokensForUser(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
    },
    ...tokens,
  };
}

/**
 * Create access and refresh tokens for a user
 */
async function createTokensForUser(user) {
  // Generate access token
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    phone: user.phone,
    isAnonymous: user.isAnonymous,
  });

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // Store refresh token in database
  const expiresAt = calculateExpiryDate(config.jwt.refreshExpiry);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Change password for a user
 */
async function changePassword(userId, currentPassword, newPassword) {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    throw new NotFoundError('User not found or password not set');
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthenticatedError('Current password is incorrect');
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  // Revoke all refresh tokens for security
  await revokeAllUserTokens(userId);

  return { success: true };
}

/**
 * Revoke all refresh tokens for a user
 */
async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

module.exports = {
  registerWithEmail,
  loginWithEmail,
  createTokensForUser,
  changePassword,
  revokeAllUserTokens,
};
