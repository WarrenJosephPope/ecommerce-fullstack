const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/auth/token/refresh
 * @desc    Refresh access token using refresh token from cookie
 * @access  Public (requires refresh token in cookie)
 */
router.post('/refresh', tokenController.refresh);

/**
 * @route   POST /api/auth/token/rotate
 * @desc    Rotate refresh token (get new refresh and access tokens)
 * @access  Public (requires refresh token in cookie)
 */
router.post('/rotate', tokenController.rotate);

/**
 * @route   POST /api/auth/token/logout
 * @desc    Logout user and revoke refresh token
 * @access  Public
 */
router.post('/logout', tokenController.logout);

/**
 * @route   GET /api/auth/token/me
 * @desc    Get current authenticated user info
 * @access  Private
 */
router.get('/me', authenticate, tokenController.getCurrentUser);

module.exports = router;
