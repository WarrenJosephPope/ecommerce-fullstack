const express = require('express');
const router = express.Router();
const phoneAuthController = require('../controllers/phoneAuthController');
const { authenticate } = require('../middleware/auth');
const {
  validatePhone,
  validateOtpVerification,
} = require('../middleware/validators');

/**
 * @swagger
 * /api/auth/phone/send-otp:
 *   post:
 *     summary: Send OTP to phone number
 *     description: Send a one-time password to the provided phone number for authentication
 *     tags: [Phone Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^\+[1-9]\d{1,14}$'
 *                 example: '+1234567890'
 *                 description: Phone number in E.164 format
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiresIn:
 *                       type: number
 *                       example: 300
 *                       description: OTP expiration time in seconds
 *       400:
 *         description: Bad request - Invalid phone number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/send-otp', validatePhone, phoneAuthController.sendOtp);

/**
 * @swagger
 * /api/auth/phone/verify-otp:
 *   post:
 *     summary: Verify OTP and authenticate
 *     description: Verify the OTP sent to phone number and login/register the user
 *     tags: [Phone Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^\+[1-9]\d{1,14}$'
 *                 example: '+1234567890'
 *                 description: Phone number in E.164 format
 *               otp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: '123456'
 *                 description: 6-digit OTP code
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token as HTTP-only cookie
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Bad request - Invalid OTP or phone number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - OTP expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-otp', validateOtpVerification, phoneAuthController.verifyOtp);

/**
 * @swagger
 * /api/auth/phone/link:
 *   post:
 *     summary: Link phone number to existing account
 *     description: Link a phone number to an existing authenticated user account
 *     tags: [Phone Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^\+[1-9]\d{1,14}$'
 *                 example: '+1234567890'
 *                 description: Phone number in E.164 format
 *               otp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: '123456'
 *                 description: 6-digit OTP code
 *     responses:
 *       200:
 *         description: Phone number linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid token or OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Phone number already linked to another account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/link', authenticate, validateOtpVerification, phoneAuthController.linkPhone);

module.exports = router;
