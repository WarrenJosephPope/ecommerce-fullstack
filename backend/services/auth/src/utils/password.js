const argon2 = require('argon2');

/**
 * Hash a password using Argon2
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return await argon2.hash(password);
}

/**
 * Compare password with hash using Argon2
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function comparePassword(password, hash) {
  return await argon2.verify(hash, password);
}

module.exports = {
  hashPassword,
  comparePassword,
};
