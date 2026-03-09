const { verifyAccessToken } = require('../utils/jwt');
const { UnauthenticatedError, ForbiddenError } = require('../utils/errors');

/**
 * Middleware to authenticate requests using JWT access token
 */
function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthenticatedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      phone: decoded.phone,
      isAnonymous: decoded.isAnonymous,
    };

    next();
  } catch (error) {
    if (error.statusCode) {
      // Already a custom error
      next(error);
    } else {
      // JWT verification error
      next(new UnauthenticatedError('Invalid or expired token'));
    }
  }
}

/**
 * Middleware to optionally authenticate (doesn't fail if no token)
 */
function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        phone: decoded.phone,
        isAnonymous: decoded.isAnonymous,
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

/**
 * Middleware to check if user is authenticated and not anonymous
 */
function requireNonAnonymous(req, res, next) {
  if (!req.user) {
    return next(new UnauthenticatedError('Authentication required'));
  }

  if (req.user.isAnonymous) {
    return next(new ForbiddenError('This action requires a full account. Please register or login.'));
  }

  next();
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireNonAnonymous,
};
