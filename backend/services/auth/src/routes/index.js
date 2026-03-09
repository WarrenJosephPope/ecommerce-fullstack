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

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
