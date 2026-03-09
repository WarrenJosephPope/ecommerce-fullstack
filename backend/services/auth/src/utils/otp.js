const crypto = require('crypto');

/**
 * Generate a random OTP code
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} OTP code
 */
function generateOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';
  
  // Use crypto for secure random number generation
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % digits.length];
  }
  
  return otp;
}

/**
 * Calculate OTP expiry time
 * @param {number} minutes - Minutes until expiry
 * @returns {Date} Expiry date
 */
function calculateOtpExpiry(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = {
  generateOtp,
  calculateOtpExpiry,
};
