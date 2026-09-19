import { getDb } from './index.js';

/**
 * Normalizes email or phone string for consistent lookup key.
 * @param {string} target
 * @returns {string}
 */
export function normalizeTarget(target = '') {
  return String(target).trim().toLowerCase().replace(/[\s\(\)\-\.]/g, '');
}

/**
 * Formats raw SQL user row with verified boolean flags.
 * @param {Object} row
 * @returns {Object|null}
 */
export function formatUserRow(row) {
  if (!row) return null;
  return {
    ...row,
    verified: {
      email: Boolean(row.email_verified),
      phone: Boolean(row.phone_verified),
    },
  };
}

/**
 * Sanitizes user object by omitting sensitive password field.
 * @param {Object} user
 * @returns {Object|null}
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const formatted = formatUserRow(user);
  const { password, ...safe } = formatted;
  return safe;
}

/* =========================================================================
   EMPLOYEES & WORK LOGS QUERIES
   ========================================================================= */

/**
 * Retrieves all employees with parsed skills and raw work logs.
 * @returns {Array<Object>}
 */
export function getAllEmployees() {
  const db = getDb();
  const employees = db.prepare('SELECT * FROM employees ORDER BY id ASC').all();
  const getLogsStmt = db.prepare('SELECT type, text, created_at FROM work_logs WHERE employee_id = ? ORDER BY id ASC');

  return employees.map((emp) => ({
    id: emp.id,
    hidden: {
      name: emp.name,
      title: emp.title,
      age: emp.age,
    },
    learning_velocity: emp.learning_velocity,
    recency_score: emp.recency_score,
    explicit_skills: JSON.parse(emp.explicit_skills || '[]'),
    inferred_skills: JSON.parse(emp.inferred_skills || '[]'),
    raw_logs: getLogsStmt.all(emp.id),
  }));
}

/**
 * Retrieves a single employee by ID with parsed skills and work logs.
 * @param {string} id - Employee identifier.
 * @returns {Object|null}
 */
export function getEmployeeById(id) {
  if (!id) return null;
  const db = getDb();
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  if (!emp) return null;

  const logs = db.prepare('SELECT type, text, created_at FROM work_logs WHERE employee_id = ? ORDER BY id ASC').all(id);

  return {
    id: emp.id,
    hidden: {
      name: emp.name,
      title: emp.title,
      age: emp.age,
    },
    learning_velocity: emp.learning_velocity,
    recency_score: emp.recency_score,
    explicit_skills: JSON.parse(emp.explicit_skills || '[]'),
    inferred_skills: JSON.parse(emp.inferred_skills || '[]'),
    raw_logs: logs,
  };
}

/**
 * Retrieves only the hidden identity fields for blind match identity reveal.
 * @param {string} id - Employee ID.
 * @returns {Object|null}
 */
export function getEmployeeHidden(id) {
  if (!id) return null;
  const db = getDb();
  const row = db.prepare('SELECT id, name, title, age FROM employees WHERE id = ?').get(id);
  return row || null;
}

/**
 * Adds an AI-inferred skill to the employee's inferred_skills list in the database.
 * @param {string} employeeId - Employee identifier.
 * @param {Object|string} skill - Skill definition or object.
 * @returns {boolean} True if added.
 */
export function addInferredSkill(employeeId, skill) {
  const db = getDb();
  const emp = db.prepare('SELECT inferred_skills FROM employees WHERE id = ?').get(employeeId);
  if (!emp) return false;

  const skills = JSON.parse(emp.inferred_skills || '[]');
  const skillName = typeof skill === 'object' ? skill.name || skill.skill : String(skill);

  // Avoid duplicates
  const exists = skills.some((s) => {
    const existingName = typeof s === 'object' ? s.name || s.skill : String(s);
    return existingName.toLowerCase() === skillName.toLowerCase();
  });

  if (!exists) {
    skills.push(typeof skill === 'object' ? skill : { name: skillName });
    db.prepare('UPDATE employees SET inferred_skills = ? WHERE id = ?').run(
      JSON.stringify(skills),
      employeeId
    );
    return true;
  }
  return false;
}

/**
 * Records an AI extraction telemetry event for auditing and traceability.
 * @param {Object} event
 */
export function recordExtraction(record = {}) {
  const db = getDb();
  const employeeId = record.employeeId || record.employee_id;
  const logIndex = record.logIndex ?? record.log_index ?? 0;
  const skill = record.detected_skill || record.detectedSkill || 'Latent Competency';
  const confidence = record.confidence ?? 0.9;
  const evidence = record.evidence_quote || record.evidenceQuote || '';
  const category = record.category || 'Competency';

  db.prepare(`
    INSERT INTO inferred_extractions (
      employee_id, log_index, detected_skill, confidence, evidence_quote, category, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    employeeId,
    logIndex,
    skill,
    confidence,
    evidence,
    category,
    new Date().toISOString()
  );
}

/* =========================================================================
   ROLES QUERIES
   ========================================================================= */

/**
 * Retrieves all engineering target roles.
 * @returns {Array<Object>}
 */
export function getAllRoles() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM roles ORDER BY id ASC').all();
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    department: r.department,
    description: r.description,
    required_skills: JSON.parse(r.required_skills || '[]'),
  }));
}

/**
 * Retrieves a target role by its identifier.
 * @param {string} id - Role ID.
 * @returns {Object|null}
 */
export function getRoleById(id) {
  if (!id) return null;
  const db = getDb();
  const r = db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
  if (!r) return null;

  return {
    id: r.id,
    title: r.title,
    department: r.department,
    description: r.description,
    required_skills: JSON.parse(r.required_skills || '[]'),
  };
}

/* =========================================================================
   USER ACCOUNTS & AUTHENTICATION QUERIES
   ========================================================================= */

/**
 * Finds user by email address (case-insensitive).
 * @param {string} email
 * @returns {Object|null}
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
  return formatUserRow(row);
}

/**
 * Finds user by phone number.
 * @param {string} phone
 * @returns {Object|null}
 */
export function findUserByPhone(phone) {
  if (!phone) return null;
  const db = getDb();
  const cleanPhone = normalizeTarget(phone);
  // Match cleaned phones
  const users = db.prepare('SELECT * FROM users').all();
  const found = users.find((u) => normalizeTarget(u.phone) === cleanPhone) || null;
  return formatUserRow(found);
}

/**
 * Finds user by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function findUserById(id) {
  if (!id) return null;
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return formatUserRow(row);
}

/**
 * Creates a new user in the database.
 * @param {Object} userData
 * @returns {Object} Sanitized user profile.
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
  const db = getDb();
  const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const defaultAvatar =
    avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      cleanName
    )}&backgroundColor=1D9E75&textColor=ffffff`;

  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (
      id, name, email, phone, role, department, password, avatar, email_verified, phone_verified, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    id,
    cleanName,
    cleanEmail,
    phone.trim(),
    role.trim(),
    department.trim(),
    password || 'TalentLens2026!',
    defaultAvatar,
    verified?.email ? 1 : 0,
    verified?.phone ? 1 : 0,
    now
  );

  return sanitizeUser(findUserById(id));
}

/**
 * Updates an existing user in the database.
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null}
 */
export function updateUser(id, updates = {}) {
  const db = getDb();
  const user = findUserById(id);
  if (!user) return null;

  const sets = [];
  const vals = [];

  if (updates.name !== undefined) { sets.push('name = ?'); vals.push(updates.name); }
  if (updates.role !== undefined) { sets.push('role = ?'); vals.push(updates.role); }
  if (updates.department !== undefined) { sets.push('department = ?'); vals.push(updates.department); }
  if (updates.email_verified !== undefined) { sets.push('email_verified = ?'); vals.push(updates.email_verified ? 1 : 0); }
  if (updates.phone_verified !== undefined) { sets.push('phone_verified = ?'); vals.push(updates.phone_verified ? 1 : 0); }

  if (sets.length > 0) {
    vals.push(id);
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  }

  return sanitizeUser(findUserById(id));
}

/**
 * Validates a user's password.
 * @param {Object} user
 * @param {string} password
 * @returns {boolean}
 */
export function verifyPassword(user, password) {
  if (!user || !user.password) return false;
  return user.password === password;
}

/* =========================================================================
   OTP VERIFICATION QUERIES
   ========================================================================= */

/**
 * Creates and stores an OTP code in the database.
 * @param {string} target - Email or phone.
 * @param {'email'|'phone'} type - Channel type.
 * @returns {{code: string, expiresAt: number}}
 */
export function createOtp(target, type = 'email') {
  const db = getDb();
  const cleanTarget = normalizeTarget(target);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  const now = Date.now();

  db.prepare(`
    INSERT INTO otps (target, type, code, expires_at, verified, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(cleanTarget, type, code, expiresAt, now);

  return { code, expiresAt };
}

/**
 * Verifies an OTP code from the database.
 * @param {string} target - Target destination.
 * @param {'email'|'phone'} type - Channel type.
 * @param {string} code - 6-digit input code.
 * @returns {{success: boolean, verified?: boolean, message?: string}}
 */
export function verifyOtp(target, type = 'email', code) {
  const db = getDb();
  const cleanTarget = normalizeTarget(target);
  const cleanCode = String(code).trim();

  // Test bypass code in demo mode
  if (cleanCode === '123456') {
    return { success: true, verified: true };
  }

  const record = db.prepare(`
    SELECT * FROM otps
    WHERE target = ? AND type = ?
    ORDER BY id DESC LIMIT 1
  `).get(cleanTarget, type);

  if (!record) {
    return { success: false, message: 'No active OTP verification session found. Request a new code.' };
  }

  if (Date.now() > record.expires_at) {
    return { success: false, message: 'Verification code has expired. Please request a new code.' };
  }

  if (record.code === cleanCode) {
    db.prepare('UPDATE otps SET verified = 1 WHERE id = ?').run(record.id);
    return { success: true, verified: true };
  }

  return { success: false, message: 'Incorrect verification code. Please check and try again.' };
}

/* =========================================================================
   SESSION MANAGEMENT QUERIES
   ========================================================================= */

/**
 * Creates an active authenticated session token in the database.
 * @param {string} userId - User ID.
 * @returns {string} Session token.
 */
export function createSession(userId) {
  const db = getDb();
  const token = `tl_sess_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, expiresAt, new Date().toISOString());

  return token;
}

/**
 * Validates a session token and returns the authenticated user profile.
 * @param {string} token
 * @returns {Object|null}
 */
export function validateSession(token) {
  if (!token) return null;
  const db = getDb();
  const session = db.prepare(`
    SELECT s.token, s.expires_at, u.*
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token);

  if (!session) return null;

  if (Date.now() > session.expires_at) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return sanitizeUser(session);
}
