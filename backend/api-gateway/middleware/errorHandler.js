/**
 * Error handling middleware for the API Gateway
 */
const errorHandler = (err, req, res, next) => {
  console.error('Gateway Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
