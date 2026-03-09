const { CustomError } = require('../utils/errors');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Error handling middleware
 * 
 * This middleware catches all errors thrown in the application
 * and returns a standardized error response.
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Error occurred', {
    path: `${req.method} ${req.path}`,
    message: err.message,
    stack: err.stack,
    name: err.name
  });

  // Default to 500 if no status code is set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Build error response
  const errorResponse = {
    success: false,
    message: message,
  };

  // Add validation errors if present
  if (err.errors) {
    errorResponse.errors = err.errors;
  }

  // Add stack trace in development mode
  if (config.server.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.error = err.name;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper
 * 
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  asyncHandler,
};
