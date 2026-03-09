const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./src/config');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middleware/error');
const { NotFoundError } = require('./src/utils/errors');
const logger = require('./src/utils/logger');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Mount API routes
app.use('/api/auth', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication Service API',
    version: '1.0.0',
    endpoints: {
      health: '/api/auth/health',
      email: {
        register: 'POST /api/auth/email/register',
        login: 'POST /api/auth/email/login',
        changePassword: 'POST /api/auth/email/change-password',
      },
      phone: {
        sendOtp: 'POST /api/auth/phone/send-otp',
        verifyOtp: 'POST /api/auth/phone/verify-otp',
        link: 'POST /api/auth/phone/link',
      },
      anonymous: {
        create: 'POST /api/auth/anonymous/create',
        convertToEmail: 'POST /api/auth/anonymous/convert-to-email',
        convertToPhone: 'POST /api/auth/anonymous/convert-to-phone',
      },
      token: {
        refresh: 'POST /api/auth/token/refresh',
        rotate: 'POST /api/auth/token/rotate',
        logout: 'POST /api/auth/token/logout',
        me: 'GET /api/auth/token/me',
      },
    },
  });
});

// 404 handler
app.use((req, res, next) => {
  next(new NotFoundError('Endpoint not found'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info('🚀 Authentication Service Started', {
    environment: config.server.nodeEnv,
    port: PORT,
    url: `http://localhost:${PORT}`,
    apiBase: `http://localhost:${PORT}/api/auth`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
