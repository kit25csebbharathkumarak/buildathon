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

/* =========================================================================
   REVEAL REQUESTS & CONSENT QUERIES
   ========================================================================= */

/**
 * Gets all reveal requests for a candidate.
 * @param {string} candidateId
 * @returns {Array}
 */
export function getRevealRequests(candidateId) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM reveal_requests
    WHERE candidate_id = ?
    ORDER BY created_at DESC
  `).all(candidateId);
}

/**
 * Gets all reveal requests initiated by a manager.
 * @param {string} managerId
 * @returns {Array}
 */
export function getManagerRevealRequests(managerId) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM reveal_requests
    WHERE manager_id = ?
    ORDER BY created_at DESC
  `).all(managerId);
}

/**
 * Creates a reveal request for candidate identity consent.
 * @param {Object} req
 * @returns {Object}
 */
export function createRevealRequest(req) {
  const db = getDb();
  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Check if active pending request exists
  const existing = db.prepare(`
    SELECT * FROM reveal_requests
    WHERE candidate_id = ? AND manager_id = ? AND role_id = ? AND status = 'PENDING'
  `).get(req.candidateId, req.managerId, req.roleId);

  if (existing) {
    return existing;
  }

  db.prepare(`
    INSERT INTO reveal_requests (id, candidate_id, manager_id, manager_name, role_id, role_title, status, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
  `).run(
    id,
    req.candidateId,
    req.managerId,
    req.managerName || 'Hiring Manager',
    req.roleId,
    req.roleTitle || 'Target Role',
    req.note || 'Requested identity reveal for technical interview alignment.',
    now
  );

  return db.prepare('SELECT * FROM reveal_requests WHERE id = ?').get(id);
}

/**
 * Updates status of a reveal request (ACCEPTED | DECLINED).
 * @param {string} id
 * @param {'ACCEPTED'|'DECLINED'} status
 * @returns {boolean}
 */
export function updateRevealRequestStatus(id, status) {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE reveal_requests
    SET status = ?, responded_at = ?
    WHERE id = ?
  `).run(status, now, id);
  return result.changes > 0;
}

/* =========================================================================
   SHORTLIST QUERIES
   ========================================================================= */

/**
 * Retrieves manager shortlist for a role.
 * @param {string} managerId
 * @param {string} roleId
 * @returns {Array}
 */
export function getShortlist(managerId, roleId) {
  const db = getDb();
  if (roleId) {
    return db.prepare(`
      SELECT * FROM shortlists
      WHERE manager_id = ? AND role_id = ?
      ORDER BY created_at DESC
    `).all(managerId, roleId);
  }
  return db.prepare(`
    SELECT * FROM shortlists
    WHERE manager_id = ?
    ORDER BY created_at DESC
  `).all(managerId);
}

/**
 * Adds candidate to manager shortlist.
 * @param {Object} item
 * @returns {boolean}
 */
export function addToShortlist(item) {
  const db = getDb();
  const id = `sh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  try {
    db.prepare(`
      INSERT OR REPLACE INTO shortlists (id, manager_id, role_id, candidate_id, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, item.managerId, item.roleId, item.candidateId, item.notes || '', now);
    return true;
  } catch (err) {
    console.error('Error adding to shortlist:', err);
    return false;
  }
}

/**
 * Removes candidate from manager shortlist.
 * @param {string} managerId
 * @param {string} roleId
 * @param {string} candidateId
 * @returns {boolean}
 */
export function removeFromShortlist(managerId, roleId, candidateId) {
  const db = getDb();
  const result = db.prepare(`
    DELETE FROM shortlists
    WHERE manager_id = ? AND role_id = ? AND candidate_id = ?
  `).run(managerId, roleId, candidateId);
  return result.changes > 0;
}

/* =========================================================================
   CANDIDATE PRIVACY & CONSENT QUERIES
   ========================================================================= */

/**
 * Gets privacy settings for candidate.
 * @param {string} candidateId
 * @returns {Object}
 */
export function getPrivacyConsent(candidateId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM candidate_privacy WHERE candidate_id = ?').get(candidateId);
  if (!row) {
    return {
      candidate_id: candidateId,
      telemetry_opt_in: 1,
      allow_matching: 1,
      updated_at: new Date().toISOString(),
    };
  }
  return row;
}

/**
 * Updates candidate privacy preferences.
 * @param {string} candidateId
 * @param {boolean} telemetryOptIn
 * @param {boolean} allowMatching
 * @returns {boolean}
 */
export function updatePrivacyConsent(candidateId, telemetryOptIn = true, allowMatching = true) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO candidate_privacy (candidate_id, telemetry_opt_in, allow_matching, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(candidateId, telemetryOptIn ? 1 : 0, allowMatching ? 1 : 0, now);
  return true;
}

/**
 * Deletes all telemetry logs and candidate skills for GDPR/privacy erasure.
 * @param {string} candidateId
 * @returns {boolean}
 */
export function deleteCandidateTelemetry(candidateId) {
  const db = getDb();
  db.prepare('DELETE FROM work_logs WHERE employee_id = ?').run(candidateId);
  db.prepare('DELETE FROM inferred_extractions WHERE employee_id = ?').run(candidateId);
  db.prepare(`
    UPDATE employees
    SET inferred_skills = '[]'
    WHERE id = ?
  `).run(candidateId);
  return true;
}

/* =========================================================================
   ROADMAP PROGRESS QUERIES
   ========================================================================= */

/**
 * Gets completed node IDs for candidate on target role.
 * @param {string} candidateId
 * @param {string} roleId
 * @returns {Array<string>}
 */
export function getRoadmapProgress(candidateId, roleId) {
  const db = getDb();
  const row = db.prepare(`
    SELECT completed_node_ids FROM roadmap_progress
    WHERE candidate_id = ? AND role_id = ?
  `).get(candidateId, roleId);
  if (!row || !row.completed_node_ids) return [];
  try {
    return JSON.parse(row.completed_node_ids);
  } catch {
    return [];
  }
}

/**
 * Toggles a roadmap skill node status (completed vs pending).
 * @param {string} candidateId
 * @param {string} roleId
 * @param {string} nodeId
 * @returns {{ completed_node_ids: Array<string>, is_completed: boolean }}
 */
export function toggleRoadmapNode(candidateId, roleId, nodeId) {
  const db = getDb();
  const current = getRoadmapProgress(candidateId, roleId);
  const exists = current.includes(nodeId);
  const updated = exists ? current.filter(id => id !== nodeId) : [...current, nodeId];
  const now = new Date().toISOString();

  db.prepare(`
    INSERT OR REPLACE INTO roadmap_progress (candidate_id, role_id, completed_node_ids, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(candidateId, roleId, JSON.stringify(updated), now);

  return { completed_node_ids: updated, is_completed: !exists };
}

/* =========================================================================
   SKILL TRIAGE (CONFIRM / REJECT / EDIT)
   ========================================================================= */

/**
 * Removes a skill from employee profile (Reject action).
 * @param {string} employeeId
 * @param {string} skillName
 * @returns {boolean}
 */
export function removeSkillFromEmployee(employeeId, skillName) {
  const db = getDb();
  const row = db.prepare('SELECT inferred_skills, explicit_skills FROM employees WHERE id = ?').get(employeeId);
  if (!row) return false;

  let inferred = [];
  try { inferred = JSON.parse(row.inferred_skills); } catch {}
  inferred = inferred.filter(s => (s.name || s) !== skillName);

  db.prepare('UPDATE employees SET inferred_skills = ? WHERE id = ?').run(JSON.stringify(inferred), employeeId);
  return true;
}

/**
 * Updates an inferred skill name or category (Edit action).
 * @param {string} employeeId
 * @param {string} oldSkillName
 * @param {Object} newSkill
 * @returns {boolean}
 */
export function updateInferredSkill(employeeId, oldSkillName, newSkill) {
  const db = getDb();
  const row = db.prepare('SELECT inferred_skills FROM employees WHERE id = ?').get(employeeId);
  if (!row) return false;

  let inferred = [];
  try { inferred = JSON.parse(row.inferred_skills); } catch {}

  const idx = inferred.findIndex(s => (s.name || s) === oldSkillName);
  if (idx !== -1) {
    inferred[idx] = typeof inferred[idx] === 'object' ? { ...inferred[idx], ...newSkill } : newSkill;
  } else {
    inferred.push(newSkill);
  }

  db.prepare('UPDATE employees SET inferred_skills = ? WHERE id = ?').run(JSON.stringify(inferred), employeeId);
  return true;
}
