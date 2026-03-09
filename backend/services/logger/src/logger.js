const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Create service-specific log directory
 */
const createServiceLogDir = (serviceName) => {
  const serviceLogsDir = path.join(logsDir, serviceName);
  if (!fs.existsSync(serviceLogsDir)) {
    fs.mkdirSync(serviceLogsDir, { recursive: true });
  }
  return serviceLogsDir;
};

/**
 * Centralized Logger for all microservices
 * All services send logs to this service via HTTP
 */

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, service, file, line, ...metadata }) => {
    let meta = '';
    
    // Add service name, file, and line number information
    if (file && line) {
      meta = ` [${service}] ${file}:${line}`;
    } else if (service) {
      meta = ` [${service}]`;
    }

    if (metadata && Object.keys(metadata).length > 0) {
      return `${timestamp} [${level.toUpperCase()}]${meta}: ${message} ${JSON.stringify(metadata)}`;
    }

    return `${timestamp} [${level.toUpperCase()}]${meta}: ${message}`;
  })
);

// Create main logger (only used for console output)
const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
  ],
});

/**
 * Log a message with service context
 * @param {string} level - Log level (info, error, warn, debug)
 * @param {object} logData - Log data object with service, file, line, message, and metadata
 */
const log = (level, logData) => {
  const {
    service = 'unknown',
    file = '',
    line = '',
    message = '',
    metadata = {}
  } = logData;

  logger.log(level, message, {
    service,
    file,
    line,
    ...metadata
  });
};

/**
 * Create daily logs per service with service-specific directories
 */
const createServiceLogger = (serviceName) => {
  const serviceLogsDir = createServiceLogDir(serviceName);
  
  return winston.createLogger({
    level: config.logLevel,
    format: logFormat,
    transports: [
      // Daily rotate file transport - Service specific
      new DailyRotateFile({
        filename: path.join(serviceLogsDir, '%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxDays: config.logRetentionDays,
        maxSize: '20m',
        format: logFormat,
      }),
      // Daily rotate file transport - Service specific errors
      new DailyRotateFile({
        filename: path.join(serviceLogsDir, '%DATE%-error.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxDays: config.logRetentionDays,
        maxSize: '20m',
        format: logFormat,
      }),
    ],
  });
};

/**
 * Get or create a logger for a specific service
 */
const serviceLoggers = {};

const getServiceLogger = (serviceName) => {
  if (!serviceLoggers[serviceName]) {
    serviceLoggers[serviceName] = createServiceLogger(serviceName);
  }
  return serviceLoggers[serviceName];
};

/**
 * Cleanup old logs
 */
const cleanupOldLogs = () => {
  try {
    const now = Date.now();
    const retentionMs = config.logRetentionDays * 24 * 60 * 60 * 1000;

    fs.readdir(logsDir, (err, files) => {
      if (err) {
        console.error('Error reading logs directory:', err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(logsDir, file);
        fs.stat(filePath, (statErr, stats) => {
          if (statErr) return;

          if (now - stats.mtimeMs > retentionMs) {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`Error deleting old log file ${file}:`, unlinkErr);
              } else {
                logger.info(`Deleted old log file: ${file}`);
              }
            });
          }
        });
      });
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
  }
};

// Run cleanup on startup
cleanupOldLogs();

// Run cleanup periodically (every 6 hours)
setInterval(cleanupOldLogs, 6 * 60 * 60 * 1000);

module.exports = {
  logger,
  log,
  getServiceLogger,
  cleanupOldLogs,
};
