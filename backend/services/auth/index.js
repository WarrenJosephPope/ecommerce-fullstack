const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const config = require('./src/config');
const routes = require('./src/routes');
const swaggerSpec = require('./src/config/swagger');
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

// Swagger UI - mounted under /api/auth for API gateway access
app.use('/api/auth/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Auth Service API Documentation',
}));

// Mount API routes
app.use('/api/auth', routes);

// Root endpoint - redirect to API docs
app.get('/', (req, res) => {
  res.redirect('/api/auth/docs');
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
