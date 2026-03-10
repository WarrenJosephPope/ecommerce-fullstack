const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const routesConfig = require('./routes.config');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');
const { createServiceProxy } = require('./middleware/proxy');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { verifyToken } = require('./middleware/auth');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Request logging
app.use(morgan(config.server.nodeEnv === 'development' ? 'dev' : 'combined'));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Authentication middleware - checks route configuration
app.use((req, res, next) => {
  const path = req.path;
  
  // Skip auth check for gateway root and health endpoints
  if (path === '/' || path === '/health') {
    return next();
  }

  // Check if route requires authentication
  if (routesConfig.isProtectedRoute(path)) {
    console.log(`[GATEWAY] Protected route: ${path} - Verifying token`);
    return verifyToken(req, res, next);
  }
  
  // Public route - no authentication required
  console.log(`[GATEWAY] Public route: ${path} - No authentication required`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Gateway info endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API Gateway',
    version: '1.0.0',
    services: Object.keys(config.services).reduce((acc, key) => {
      acc[key] = config.services[key].prefix;
      return acc;
    }, {}),
  });
});

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Proxy routes to microservices
// Auth service - passes through /api/auth
app.use(
  config.services.auth.prefix,
  createServiceProxy(config.services.auth.url, config.services.auth.prefix)
);

// Add more service routes here as needed
// Example:
// app.use(
//   config.services.products.prefix,
//   createServiceProxy(config.services.products.url, config.services.products.prefix)
// );

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 API Gateway Started');
  console.log('========================================');
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('\nConfigured Services:');
  Object.entries(config.services).forEach(([name, service]) => {
    console.log(`  - ${name.toUpperCase()}: ${service.prefix} -> ${service.url}`);
  });
  console.log('\nRate Limiting:');
  console.log(`  - General: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 1000}s`);
  console.log(`  - Auth: 20 requests per 15 minutes`);
  console.log('\nAuthentication:');
  console.log(`  - JWT validation: ENABLED`);
  console.log(`  - Public routes: ${routesConfig.publicRoutes.length}`);
  console.log(`  - Protected routes: ${routesConfig.protectedRoutes.length}`);
  console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
