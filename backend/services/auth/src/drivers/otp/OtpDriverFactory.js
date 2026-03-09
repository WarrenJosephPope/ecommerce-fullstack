const ConsoleOtpDriver = require('./ConsoleOtpDriver');
const logger = require('../../utils/logger');

/**
 * OTP Driver Factory
 * 
 * Manages OTP driver instances and provides a simple interface for sending OTPs.
 * Easily switch between different drivers based on environment or configuration.
 */
class OtpDriverFactory {
  constructor() {
    this.drivers = new Map();
    this.activeDriver = null;
    
    // Register built-in drivers
    this.register('console', new ConsoleOtpDriver());
    
    // You can register your custom SMS drivers here
    // Example:
    // this.register('twilio', new TwilioDriver({ 
    //   apiKey: process.env.TWILIO_API_KEY,
    //   apiSecret: process.env.TWILIO_API_SECRET,
    //   senderId: process.env.TWILIO_PHONE_NUMBER
    // }));
    
    // Set default driver (console for development)
    this.setDriver('console');
  }

  /**
   * Register a new OTP driver
   * @param {string} name - Unique name for the driver
   * @param {OtpDriver} driver - Instance of an OTP driver
   */
  register(name, driver) {
    this.drivers.set(name, driver);
  }

  /**
   * Set the active OTP driver
   * @param {string} name - Name of the driver to use
   * @throws {Error} If driver is not found
   */
  setDriver(name) {
    const driver = this.drivers.get(name);
    if (!driver) {
      throw new Error(`OTP driver '${name}' not found. Available drivers: ${Array.from(this.drivers.keys()).join(', ')}`);
    }
    this.activeDriver = driver;
    logger.info(`Active OTP driver set to: ${driver.getName()}`);
  }

  /**
   * Get the active driver
   * @returns {OtpDriver}
   */
  getDriver() {
    if (!this.activeDriver) {
      throw new Error('No active OTP driver set');
    }
    return this.activeDriver;
  }

  /**
   * Send OTP using the active driver
   * @param {string} phone - The phone number
   * @param {string} code - The OTP code
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async send(phone, code) {
    const driver = this.getDriver();
    return await driver.send(phone, code);
  }

  /**
   * Get list of registered drivers
   * @returns {string[]}
   */
  getAvailableDrivers() {
    return Array.from(this.drivers.keys());
  }
}

// Export singleton instance
module.exports = new OtpDriverFactory();
