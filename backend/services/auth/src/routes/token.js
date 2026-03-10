const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/token/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using the refresh token from HTTP-only cookie
 *     tags: [Token Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
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
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', tokenController.refresh);

/**
 * @swagger
 * /api/auth/token/rotate:
 *   post:
 *     summary: Rotate refresh token
 *     description: Get new refresh and access tokens (extends the refresh token lifetime)
 *     tags: [Token Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Tokens rotated successfully
 *         headers:
 *           Set-Cookie:
 *             description: New refresh token as HTTP-only cookie
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict
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
 *                   example: Tokens rotated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/rotate', tokenController.rotate);

/**
 * @swagger
 * /api/auth/token/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user and invalidate the refresh token
 *     tags: [Token Management]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Clear refresh token cookie
 *             schema:
 *               type: string
 *               example: refreshToken=; Max-Age=0
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
 *                   example: Logged out successfully
 *       400:
 *         description: Bad request - No refresh token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', tokenController.logout);

/**
 * @swagger
 * /api/auth/token/me:
 *   get:
 *     summary: Get current user information
 *     description: Retrieve the currently authenticated user's profile information
 *     tags: [Token Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: 123e4567-e89b-12d3-a456-426614174000
 *                         email:
 *                           type: string
 *                           format: email
 *                           nullable: true
 *                           example: user@example.com
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                           example: '+1234567890'
 *                         isAnonymous:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-03-11T10:30:00.000Z
 *       401:
 *         description: Unauthorized - Invalid or expired access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, tokenController.getCurrentUser);

module.exports = router;
