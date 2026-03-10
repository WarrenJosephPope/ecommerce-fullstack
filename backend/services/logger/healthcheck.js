/**
 * Health Check Script for Logger Service
 * Verifies the service can connect to Redis via BullMQ
 */

const { Queue } = require('bullmq');
const config = require('./src/config');

async function healthCheck() {
  let logsQueue;
  try {
    // Create a temporary queue instance to test Redis connectivity
    logsQueue = new Queue('health-check', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      }
    });

    // Wait for the queue to be ready - this will throw if Redis is unreachable
    await logsQueue.waitUntilReady();
    
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

healthCheck();
