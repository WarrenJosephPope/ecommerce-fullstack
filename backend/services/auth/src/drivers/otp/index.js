const OtpDriver = require('./OtpDriver');
const ConsoleOtpDriver = require('./ConsoleOtpDriver');
const otpDriverFactory = require('./OtpDriverFactory');

module.exports = {
  OtpDriver,
  ConsoleOtpDriver,
  otpDriverFactory,
};
