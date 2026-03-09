/**
 * Route configuration for authentication requirements
 * Define which routes require authentication and which are public
 */

module.exports = {
  // Public routes (no authentication required)
  publicRoutes: [
    // Auth service - public endpoints
    '/api/auth/health',
    '/api/auth/email/register',
    '/api/auth/email/login',
    '/api/auth/phone/send-otp',
    '/api/auth/phone/verify-otp',
    '/api/auth/anonymous/create',
    '/api/auth/token/refresh', // Refresh uses refresh token, not access token
    
    // Add other public routes here
    // Example: '/api/products', '/api/categories'
  ],

  // Protected routes (authentication required)
  // These are prefix-based, so /api/auth/token/* requires auth
  protectedRoutes: [
    // Auth service - protected endpoints
    '/api/auth/email/change-password',
    '/api/auth/phone/link',
    '/api/auth/anonymous/convert-to-email',
    '/api/auth/anonymous/convert-to-phone',
    '/api/auth/token/rotate',
    '/api/auth/token/logout',
    '/api/auth/token/me',
    
    // Profile service - all routes require auth
    '/api/profile',
    
    // Add other protected routes here
    // Example: '/api/orders', '/api/cart', '/api/wishlist'
  ],

  /**
   * Check if a route is public
   * @param {string} path - The request path
   * @returns {boolean}
   */
  isPublicRoute(path) {
    return this.publicRoutes.some(route => {
      // Exact match or prefix match with trailing slash
      return path === route || path.startsWith(route + '/');
    });
  },

  /**
   * Check if a route requires authentication
   * @param {string} path - The request path
   * @returns {boolean}
   */
  isProtectedRoute(path) {
    return this.protectedRoutes.some(route => {
      // Exact match or prefix match
      return path === route || path.startsWith(route + '/') || path.startsWith(route);
    });
  },
};
