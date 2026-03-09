require('dotenv').config();

module.exports = {
  logLevel: process.env.LOG_LEVEL,
  logRetentionDays: process.env.LOG_RETENTION_DAYS,
  redisUrl: process.env.REDIS_URL,
  nodeEnv: process.env.NODE_ENV,
};
