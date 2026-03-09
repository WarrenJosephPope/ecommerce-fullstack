const express = require('express');
const router = express.Router();
const emailAuthController = require('../controllers/emailAuthController');
const { authenticate } = require('../middleware/auth');
const {
  validateEmailRegister,
  validateEmailLogin,
  validateChangePassword,
} = require('../middleware/validators');

/**
 * @route   POST /api/auth/email/register
 * @desc    Register with email and password
 * @access  Public
 */
router.post('/register', validateEmailRegister, emailAuthController.register);

/**
 * @route   POST /api/auth/email/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/login', validateEmailLogin, emailAuthController.login);

/**
 * @route   POST /api/auth/email/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
router.post('/change-password', authenticate, validateChangePassword, emailAuthController.changePassword);

module.exports = router;
