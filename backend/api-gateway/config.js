require('dotenv').config();

module.exports = {
  server: {
    port: process.env.GATEWAY_PORT,
    nodeEnv: process.env.NODE_ENV,
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL,
      prefix: '/api/auth',
    },
    // Add more services here as they are created
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  },
  jwt: {
    secret: process.env.JWT_ACCESS_SECRET,
  },
};
