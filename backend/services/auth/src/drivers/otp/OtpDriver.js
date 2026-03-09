/**
 * Base OTP Driver Class
 * 
 * All OTP drivers should extend this class and implement the send method.
 * This provides a consistent interface for sending OTPs through different services.
 */
class OtpDriver {
  /**
   * Send an OTP to a phone number
   * @param {string} phone - The phone number to send OTP to
   * @param {string} code - The OTP code to send
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async send(phone, code) {
    throw new Error('send() method must be implemented by the driver');
  }

  /**
   * Validate phone number format (can be overridden by specific drivers)
   * @param {string} phone - The phone number to validate
   * @returns {boolean}
   */
  validatePhone(phone) {
    // Basic validation - expects E.164 format or digits only
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Get driver name
   * @returns {string}
   */
  getName() {
    return this.constructor.name;
  }
}

module.exports = OtpDriver;
