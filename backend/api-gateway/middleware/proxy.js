const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

/**
 * Create a proxy middleware for a service
 * @param {string} serviceUrl - The URL of the target service
 * @param {string} pathPrefix - The path prefix to match (e.g., '/api/auth')
 */
const createServiceProxy = (serviceUrl, pathPrefix) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    // pathRewrite is NOT used - we pass the full path through
    logLevel: config.server.nodeEnv === 'development' ? 'debug' : 'info',
    onProxyReq: (proxyReq, req, res) => {
      // Log the proxied request
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${serviceUrl}${req.url}`);
    },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        error: config.server.nodeEnv === 'development' ? err.message : undefined,
      });
    },
  });
};

module.exports = {
  createServiceProxy,
};
