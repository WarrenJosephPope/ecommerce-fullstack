require('dotenv').config();
const { Worker } = require('bullmq');
const logger = require('./src/logger');
const config = require('./src/config');

/**
 * Logger Service - Queue Processor
 * Listens to BullMQ 'logs' queue and writes logs to disk using Winston
 */

async function startLogProcessor() {
  try {
    const worker = new Worker('logs', async (job) => {
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
    }, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      }
    });

    console.log('[Logger Service] Started');
    console.log(`[Logger Service] Listening to 'logs' queue`);
    console.log(`[Logger Service] Environment: ${config.nodeEnv}`);
    console.log(`[Logger Service] Log level: ${config.logLevel}`);
    console.log(`[Logger Service] Log retention: ${config.logRetentionDays} days`);

    worker.on('error', (error) => {
      console.error('[Logger Service] Worker error:', error.message);
    });

    worker.on('failed', (job, error) => {
      console.error(`[Logger Service] Job ${job.id} failed:`, error.message);
    });

    worker.on('completed', (job) => {
      console.log(`[Logger Service] Job ${job.id} processed`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[Logger Service] Received SIGTERM, shutting down gracefully...');
      await worker.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[Logger Service] Received SIGINT, shutting down gracefully...');
      await worker.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('[Logger Service] Fatal error:', error.message);
    process.exit(1);
  }
}

startLogProcessor();
