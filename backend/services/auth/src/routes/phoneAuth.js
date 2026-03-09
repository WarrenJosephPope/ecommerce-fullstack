const express = require('express');
const router = express.Router();
const phoneAuthController = require('../controllers/phoneAuthController');
const { authenticate } = require('../middleware/auth');
const {
  validatePhone,
  validateOtpVerification,
} = require('../middleware/validators');

/**
 * @route   POST /api/auth/phone/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
router.post('/send-otp', validatePhone, phoneAuthController.sendOtp);

/**
 * @route   POST /api/auth/phone/verify-otp
 * @desc    Verify OTP and login/register
 * @access  Public
 */
router.post('/verify-otp', validateOtpVerification, phoneAuthController.verifyOtp);

/**
 * @route   POST /api/auth/phone/link
 * @desc    Link phone number to existing user account
 * @access  Private
 */
router.post('/link', authenticate, validateOtpVerification, phoneAuthController.linkPhone);

module.exports = router;
