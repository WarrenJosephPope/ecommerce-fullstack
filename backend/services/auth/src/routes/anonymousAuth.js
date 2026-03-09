const express = require('express');
const router = express.Router();
const anonymousAuthController = require('../controllers/anonymousAuthController');
const { authenticate } = require('../middleware/auth');
const {
  validateConvertToEmail,
  validatePhone,
} = require('../middleware/validators');

/**
 * @route   POST /api/auth/anonymous/create
 * @desc    Create anonymous user account
 * @access  Public
 */
router.post('/create', anonymousAuthController.createAnonymous);

/**
 * @route   POST /api/auth/anonymous/convert-to-email
 * @desc    Convert anonymous account to email/password account
 * @access  Private
 */
router.post('/convert-to-email', authenticate, validateConvertToEmail, anonymousAuthController.convertToEmail);

/**
 * @route   POST /api/auth/anonymous/convert-to-phone
 * @desc    Convert anonymous account to phone account
 * @access  Private
 */
router.post('/convert-to-phone', authenticate, validatePhone, anonymousAuthController.convertToPhone);

module.exports = router;
