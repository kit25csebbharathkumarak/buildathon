/**
 * Authentication and OTP verification store for TalentLens backed by SQLite relational database.
 * Directly proxies queries to lib/db/queries.js for persistent, ACID-compliant storage.
 */

export {
  normalizeTarget,
  findUserByEmail,
  findUserByPhone,
  findUserById,
  createUser,
  updateUser,
  createOtp,
  verifyOtp,
  verifyPassword,
  sanitizeUser,
  createSession,
  validateSession,
} from './db/queries.js';
