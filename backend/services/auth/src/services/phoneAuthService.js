const prisma = require('../db/prisma');
const { generateOtp, calculateOtpExpiry } = require('../utils/otp');
const { otpDriverFactory } = require('../drivers/otp');
const { createTokensForUser } = require('./emailAuthService');
const { BadRequestError, TooManyRequestsError, UnauthenticatedError, ConflictError, InternalServerError } = require('../utils/errors');
const config = require('../config');

/**
 * Send OTP to phone number
 */
async function sendOtp(phone) {
  // Validate phone format
  const driver = otpDriverFactory.getDriver();
  if (!driver.validatePhone(phone)) {
    throw new BadRequestError('Invalid phone number format');
  }

  // Check for existing recent OTP
  const recentOtp = await prisma.otpCode.findFirst({
    where: {
      phone,
      expiresAt: { gt: new Date() },
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  // If recent OTP exists (within last 1 minute), don't send new one
  if (recentOtp && new Date() - new Date(recentOtp.createdAt) < 60000) {
    throw new TooManyRequestsError('OTP already sent. Please wait before requesting a new one.');
  }

  // Generate OTP
  const code = generateOtp(6);
  const expiresAt = calculateOtpExpiry(config.otp.expiryMinutes);

  // Save OTP to database
  const otpCode = await prisma.otpCode.create({
    data: {
      code,
      phone,
      expiresAt,
      verified: false,
      attempts: 0,
    },
  });

  // Send OTP using the active driver
  const result = await otpDriverFactory.send(phone, code);

  if (!result.success) {
    // Delete the OTP if sending failed
    await prisma.otpCode.delete({
      where: { id: otpCode.id },
    });
    throw new InternalServerError(`Failed to send OTP: ${result.error}`);
  }

  return {
    success: true,
    message: 'OTP sent successfully',
    expiresAt,
  };
}

/**
 * Verify OTP and login/register user
 */
async function verifyOtpAndLogin(phone, code) {
  // Find the OTP
  const otpCode = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpCode) {
    // Try to find if there's an OTP for this phone to increment attempts
    const existingOtp = await prisma.otpCode.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingOtp) {
      // Increment attempts
      await prisma.otpCode.update({
        where: { id: existingOtp.id },
        data: { attempts: { increment: 1 } },
      });

      // Check if max attempts reached
      if (existingOtp.attempts + 1 >= config.otp.maxAttempts) {
        await prisma.otpCode.update({
          where: { id: existingOtp.id },
          data: { expiresAt: new Date() }, // Expire the OTP
        });
        throw new TooManyRequestsError('Maximum OTP attempts reached. Please request a new OTP.');
      }
    }

    throw new UnauthenticatedError('Invalid or expired OTP');
  }

  // Mark OTP as verified
  await prisma.otpCode.update({
    where: { id: otpCode.id },
    data: { verified: true },
  });

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        phone,
        phoneVerified: true,
        isAnonymous: false,
      },
    });
  } else {
    // Update phone verification status
    if (!user.phoneVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }
  }

  // Clean up old OTPs for this phone
  await prisma.otpCode.deleteMany({
    where: {
      phone,
      id: { not: otpCode.id },
    },
  });

  // Generate tokens
  const tokens = await createTokensForUser(user);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      isAnonymous: user.isAnonymous,
    },
    ...tokens,
  };
}

/**
 * Link phone number to existing user account
 */
async function linkPhoneToUser(userId, phone, code) {
  // Verify OTP
  const otpCode = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpCode) {
    throw new UnauthenticatedError('Invalid or expired OTP');
  }

  // Check if phone is already linked to another user
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser && existingUser.id !== userId) {
    throw new ConflictError('Phone number is already linked to another account');
  }

  // Mark OTP as verified
  await prisma.otpCode.update({
    where: { id: otpCode.id },
    data: { verified: true },
  });

  // Update user with phone number
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      phone,
      phoneVerified: true,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
    },
  };
}

module.exports = {
  sendOtp,
  verifyOtpAndLogin,
  linkPhoneToUser,
};
