require('dotenv').config();
const Queue = require('bull');
const logger = require('./src/logger');
const config = require('./src/config');

/**
 * Logger Service - Queue Processor
 * Listens to Bull 'logs' queue and writes logs to disk using Winston
 */

async function startLogProcessor() {
  try {
    const logsQueue = new Queue('logs', {
      redis: config.redisUrl
    });

    console.log('[Logger Service] Started');
    console.log(`[Logger Service] Listening to 'logs' queue`);
    console.log(`[Logger Service] Environment: ${config.nodeEnv}`);
    console.log(`[Logger Service] Log level: ${config.logLevel}`);
    console.log(`[Logger Service] Log retention: ${config.logRetentionDays} days`);

    // Process log jobs from queue
    logsQueue.process(async (job) => {
      try {
        const logData = job.data;
        const serviceName = logData.service || 'unknown';
        
        // Get service-specific logger
        const serviceLogger = logger.getServiceLogger(serviceName);
        
        // Log to service-specific file
        serviceLogger.log(logData.level, logData.message, {
          service: serviceName,
          file: logData.file,
          line: logData.line,
          ...logData.metadata
        });

        return { success: true };
      } catch (error) {
        console.error('[Logger Service] Error processing log:', error.message);
        throw error;
      }
    });

    logsQueue.on('error', (error) => {
      console.error('[Logger Service] Queue error:', error.message);
    });

    logsQueue.on('failed', (job, error) => {
      console.error(`[Logger Service] Job ${job.id} failed:`, error.message);
    });

    logsQueue.on('completed', (job) => {
      console.log(`[Logger Service] Job ${job.id} processed`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[Logger Service] Received SIGTERM, shutting down gracefully...');
      await logsQueue.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[Logger Service] Received SIGINT, shutting down gracefully...');
      await logsQueue.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('[Logger Service] Fatal error:', error.message);
    process.exit(1);
  }
}

startLogProcessor();
