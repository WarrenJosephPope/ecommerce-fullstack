const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to verify JWT tokens
 * Checks Authorization header for Bearer token
 * Validates token signature and expiration
 * Attaches decoded user data to req.user
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided',
        error: 'MISSING_TOKEN',
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected: Bearer <token>',
        error: 'INVALID_TOKEN_FORMAT',
      });
    }

    const token = parts[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Attach user data to request
    req.user = decoded;
    
    // Forward user context to services via header
    req.headers['x-user-id'] = decoded.userId || decoded.id;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role || 'user';
    
    console.log(`[AUTH] User authenticated: ${decoded.userId || decoded.id} - ${decoded.email}`);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        error: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN',
      });
    }
    
    console.error('[AUTH ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: 'TOKEN_VERIFICATION_FAILED',
    });
  }
};

/**
 * Optional authentication middleware
 * If token exists, validates it and attaches user data
 * If no token, continues without user data (for public routes that can benefit from user context)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    req.headers['x-user-id'] = decoded.userId || decoded.id;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role || 'user';
  } catch (error) {
    // Token invalid but we don't block the request
    console.log('[OPTIONAL AUTH] Invalid token, continuing without auth');
  }
  
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
};
