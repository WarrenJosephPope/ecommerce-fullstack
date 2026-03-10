require('dotenv').config();

module.exports = {
  logLevel: process.env.LOG_LEVEL,
  logRetentionDays: process.env.LOG_RETENTION_DAYS,
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  nodeEnv: process.env.NODE_ENV,
};
