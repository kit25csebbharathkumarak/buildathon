/**
 * In-memory authentication and OTP verification store for TalentLens.
 * Persists registered users and dynamic OTP verification sessions across API routes.
 */

// Singleton store instance on globalThis to survive Next.js module reloads
const globalAuth = globalThis.__TALENTLENS_AUTH_STORE__ || {
  users: [
    {
      id: 'usr-demo-001',
      name: 'Elena Rostova',
      email: 'demo@talentlens.internal',
      phone: '+1 (555) 234-5678',
      role: 'Staff Distributed Systems Architect',
      department: 'Core Platform Infrastructure',
      password: 'TalentLens2026!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: {
        email: true,
        phone: true,
      },
      createdAt: new Date('2026-01-15T10:00:00Z').toISOString(),
    },
    {
      id: 'usr-demo-002',
      name: 'Marcus Chen',
      email: 'marcus.chen@meridian.io',
      phone: '+1 (555) 876-5432',
      role: 'AI Infrastructure Engineer',
      department: 'Machine Learning Systems',
      password: 'TalentLens2026!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: {
        email: true,
        phone: true,
      },
      createdAt: new Date('2026-02-01T12:00:00Z').toISOString(),
    },
  ],
  otps: new Map(), // key: `${type}:${target.toLowerCase()}` -> { code, expiresAt, verified }
  sessions: new Map(), // token -> userId
};

if (process.env.NODE_ENV !== 'production') {
  globalThis.__TALENTLENS_AUTH_STORE__ = globalAuth;
}

/**
 * Normalizes email or phone string for consistent lookup key.
 * @param {string} target - Email or phone string.
 * @returns {string}
 */
export function normalizeTarget(target = '') {
  return String(target).trim().toLowerCase().replace(/[\s\(\)\-\.]/g, '');
}

/**
 * Finds user by email address (case-insensitive).
 * @param {string} email - Email address.
 * @returns {Object|null}
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const clean = String(email).trim().toLowerCase();
  return globalAuth.users.find((u) => u.email.toLowerCase() === clean) || null;
}

/**
 * Finds user by phone number.
 * @param {string} phone - Phone number string.
 * @returns {Object|null}
 */
export function findUserByPhone(phone) {
  if (!phone) return null;
  const clean = normalizeTarget(phone);
  return (
    globalAuth.users.find((u) => normalizeTarget(u.phone) === clean) || null
  );
}

/**
 * Finds user by ID.
 * @param {string} id - User ID.
 * @returns {Object|null}
 */
export function findUserById(id) {
  return globalAuth.users.find((u) => u.id === id) || null;
}

/**
 * Creates a new user record.
 * @param {Object} userData - User registration attributes.
 * @returns {Object} Created user sanitized without password.
 */
export function createUser({
  name,
  email,
  phone,
  role = 'Engineering Candidate',
  department = 'Product & Engineering',
  password,
  avatar = null,
  verified = { email: false, phone: false },
}) {
  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    role: role.trim(),
    department: department.trim(),
    password: password || 'TalentLens2026!',
    avatar:
      avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        name
      )}&backgroundColor=1D9E75&textColor=ffffff`,
    verified: {
      email: Boolean(verified?.email),
      phone: Boolean(verified?.phone),
    },
    createdAt: new Date().toISOString(),
  };

  globalAuth.users.push(newUser);
  return sanitizeUser(newUser);
}

/**
 * Updates an existing user record.
 * @param {string} id - User ID.
 * @param {Object} updates - Fields to update.
 * @returns {Object|null} Updated sanitized user.
 */
export function updateUser(id, updates = {}) {
  const user = globalAuth.users.find((u) => u.id === id);
  if (!user) return null;

  Object.assign(user, updates);
  return sanitizeUser(user);
}

/**
 * Creates and stores a 6-digit OTP for email or phone verification.
 * @param {string} target - Target destination (email or phone).
 * @param {'email'|'phone'} type - Channel type.
 * @returns {{code: string, expiresAt: number}} Generated OTP details.
 */
export function createOtp(target, type = 'email') {
  const key = `${type}:${normalizeTarget(target)}`;
  // Generate deterministic-looking 6-digit code (e.g., 684921)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  globalAuth.otps.set(key, {
    target,
    type,
    code,
    expiresAt,
    verified: false,
    createdAt: Date.now(),
  });

  return { code, expiresAt };
}

/**
 * Verifies an OTP code for a given target.
 * @param {string} target - Email or phone.
 * @param {'email'|'phone'} type - Channel type.
 * @param {string} code - 6-digit input code.
 * @returns {{success: boolean, message?: string}}
 */
export function verifyOtp(target, type = 'email', code) {
  const key = `${type}:${normalizeTarget(target)}`;
  const record = globalAuth.otps.get(key);

  if (!record) {
    // Fallback: in demo test environments, accept '123456' as universal test OTP
    if (code === '123456') {
      return { success: true, verified: true };
    }
    return { success: false, message: 'No active OTP verification session found. Request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    globalAuth.otps.delete(key);
    return { success: false, message: 'Verification code has expired. Please request a new code.' };
  }

  // Check matching code or demo bypass code '123456'
  if (record.code === String(code).trim() || String(code).trim() === '123456') {
    record.verified = true;
    return { success: true, verified: true };
  }

  return { success: false, message: 'Incorrect verification code. Please check and try again.' };
}

/**
 * Checks whether an OTP was already verified.
 * @param {string} target - Email or phone.
 * @param {'email'|'phone'} type - Channel type.
 * @returns {boolean}
 */
export function isOtpVerified(target, type = 'email') {
  const key = `${type}:${normalizeTarget(target)}`;
  const record = globalAuth.otps.get(key);
  return Boolean(record?.verified);
}

/**
 * Verifies a user's password.
 * @param {Object} user - User record.
 * @param {string} password - Input password.
 * @returns {boolean}
 */
export function verifyPassword(user, password) {
  if (!user || !user.password) return false;
  return user.password === password;
}

/**
 * Sanitizes user record by removing password before returning to client.
 * @param {Object} user - Raw user record.
 * @returns {Object} Safe user profile.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

/**
 * Generates an authenticated session token.
 * @param {string} userId - User ID.
 * @returns {string} Session token.
 */
export function createSession(userId) {
  const token = `tl_sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  globalAuth.sessions.set(token, userId);
  return token;
}

/**
 * Validates session token and returns associated user.
 * @param {string} token - Session token.
 * @returns {Object|null} Sanitized user profile or null.
 */
export function validateSession(token) {
  if (!token) return null;
  const userId = globalAuth.sessions.get(token);
  if (!userId) return null;
  const user = findUserById(userId);
  return sanitizeUser(user);
}
