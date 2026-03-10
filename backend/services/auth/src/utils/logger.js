const { Queue } = require('bullmq');

class Logger {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.logsQueue = new Queue('logs', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      }
    });
  }

  _getCallerInfo() {
    const stack = new Error().stack.split('\n');
    const caller = stack[4]; // Skip Error, _getCallerInfo, _log, method name, and get actual caller
    const match = caller.match(/\((.+?):(\d+):\d+\)/);
    if (match) {
      const filePath = match[1].split('\\').pop();
      return { file: filePath, line: match[2] };
    }
    return { file: 'unknown', line: 0 };
  }

  async _log(level, message, metadata = {}) {
    try {
      const { file, line } = this._getCallerInfo();
      const logEntry = {
        service: this.serviceName,
        level,
        message,
        file,
        line,
        metadata,
        timestamp: new Date().toISOString()
      };
      await this.logsQueue.add('log', logEntry, { removeOnComplete: true });
    } catch (error) {
      console.error(`[${this.serviceName}] Failed to queue log:`, error.message);
    }
  }

  info(message, metadata = {}) {
    this._log('info', message, metadata);
  }

  warn(message, metadata = {}) {
    this._log('warn', message, metadata);
  }

  error(message, metadata = {}) {
    this._log('error', message, metadata);
  }

  debug(message, metadata = {}) {
    this._log('debug', message, metadata);
  }
}

// Export a logger instance for auth-service
module.exports = new Logger('auth-service');
