/**
 * Health Check Script for Logger Service
 * Verifies the service can connect to Redis via Bull
 */

const Queue = require('bull');
const config = require('./src/config');

async function healthCheck() {
  let logsQueue;
  try {
    // Get Redis URL from environment or use default
    const redisUrl = config.redisUrl;
    
    // Create a temporary queue instance to test Redis connectivity
    logsQueue = new Queue('health-check', {
      redis: redisUrl
    });

    // Try to access the queue's client to verify Redis connection
    await logsQueue.client.ping();
    
    console.log('[Health Check] Logger service is healthy - Redis connection OK');
    await logsQueue.close();
    process.exit(0);
  } catch (error) {
    console.error('[Health Check] Failed:', error.message);
    if (logsQueue) {
      await logsQueue.close();
    }
    process.exit(1);
  }
}

healthCheck();healthCheck();
