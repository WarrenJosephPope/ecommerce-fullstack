const express = require('express');
const router = express.Router();

const emailAuthRoutes = require('./emailAuth');
const phoneAuthRoutes = require('./phoneAuth');
const anonymousAuthRoutes = require('./anonymousAuth');
const tokenRoutes = require('./token');

// Mount route modules
router.use('/email', emailAuthRoutes);
router.use('/phone', phoneAuthRoutes);
router.use('/anonymous', anonymousAuthRoutes);
router.use('/token', tokenRoutes);

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the authentication service is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                   example: Auth service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
