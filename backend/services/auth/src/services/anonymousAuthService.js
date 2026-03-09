const prisma = require('../db/prisma');
const { createTokensForUser } = require('./emailAuthService');
const { hashPassword } = require('../utils/password');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

/**
 * Create an anonymous user account
 */
async function createAnonymousUser() {
  // Create anonymous user
  const user = await prisma.user.create({
    data: {
      isAnonymous: true,
      emailVerified: false,
      phoneVerified: false,
    },
  });

  // Generate tokens
  const tokens = await createTokensForUser(user);

  return {
    user: {
      id: user.id,
      isAnonymous: user.isAnonymous,
    },
    ...tokens,
  };
}

/**
 * Convert anonymous user to email/password account
 */
async function convertAnonymousToEmail(userId, email, password) {
  // Get anonymous user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isAnonymous) {
    throw new BadRequestError('User is not anonymous');
  }

  // Check if email is already taken
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Email is already in use');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      passwordHash,
      isAnonymous: false,
      emailVerified: false,
    },
  });

  return {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      isAnonymous: updatedUser.isAnonymous,
    },
  };
}

/**
 * Convert anonymous user to phone account
 */
async function convertAnonymousToPhone(userId, phone) {
  // Get anonymous user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isAnonymous) {
    throw new BadRequestError('User is not anonymous');
  }

  // Check if phone is already taken
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser) {
    throw new ConflictError('Phone number is already in use');
  }

  // Update user (phone verification will be done through OTP flow)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      phone,
      isAnonymous: false,
      phoneVerified: false,
    },
  });

  return {
    user: {
      id: updatedUser.id,
      phone: updatedUser.phone,
      phoneVerified: updatedUser.phoneVerified,
      isAnonymous: updatedUser.isAnonymous,
    },
  };
}

module.exports = {
  createAnonymousUser,
  convertAnonymousToEmail,
  convertAnonymousToPhone,
};
