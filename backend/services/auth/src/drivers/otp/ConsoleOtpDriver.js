const OtpDriver = require('./OtpDriver');

/**
 * Console OTP Driver
 * 
 * This driver logs OTPs to the console for development and testing.
 * DO NOT use this in production!
 */
class ConsoleOtpDriver extends OtpDriver {
  /**
   * Send OTP by logging it to the console
   * @param {string} phone - The phone number
   * @param {string} code - The OTP code
   * @returns {Promise<{success: boolean, messageId: string}>}
   */
  async send(phone, code) {
    console.log('\n========================================');
    console.log('📱 OTP CODE SENT');
    console.log('========================================');
    console.log(`Phone: ${phone}`);
    console.log(`Code:  ${code}`);
    console.log(`Time:  ${new Date().toISOString()}`);
    console.log('========================================\n');

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }
}

module.exports = ConsoleOtpDriver;
