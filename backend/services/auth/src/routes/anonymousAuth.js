const express = require('express');
const router = express.Router();
const anonymousAuthController = require('../controllers/anonymousAuthController');
const { authenticate } = require('../middleware/auth');
const {
  validateConvertToEmail,
  validatePhone,
} = require('../middleware/validators');

/**
 * @swagger
 * /api/auth/anonymous/create:
 *   post:
 *     summary: Create anonymous user account
 *     description: Create a new anonymous user account without requiring credentials
 *     tags: [Anonymous Authentication]
 *     responses:
 *       201:
 *         description: Anonymous account created successfully
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', anonymousAuthController.createAnonymous);

/**
 * @swagger
 * /api/auth/anonymous/convert-to-email:
 *   post:
 *     summary: Convert anonymous account to email account
 *     description: Convert an existing anonymous account to an email/password account
 *     tags: [Anonymous Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Account converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Bad request - Invalid input or account already converted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/convert-to-email', authenticate, validateConvertToEmail, anonymousAuthController.convertToEmail);

/**
 * @swagger
 * /api/auth/anonymous/convert-to-phone:
 *   post:
 *     summary: Convert anonymous account to phone account
 *     description: Convert an existing anonymous account to a phone-based account
 *     tags: [Anonymous Authentication]
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
 *         description: Account converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Bad request - Invalid input or account already converted
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
 *         description: Conflict - Phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/convert-to-phone', authenticate, validatePhone, anonymousAuthController.convertToPhone);

module.exports = router;
