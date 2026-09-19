import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { seedDatabase } from './seed.js';

let dbInstance = globalThis.__TALENTLENS_DB__;

/**
 * Returns the singleton database connection instance and runs auto-migrations.
 * @returns {Database.Database} Active SQLite database instance.
 */
export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'talentlens.db');
  const db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? null : null,
  });

  // Enable Write-Ahead Logging for high concurrency and performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  // Initialize relational schema
  initSchema(db);

  // Auto-seed if empty
  const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  if (employeeCount === 0) {
    console.log('[TalentLens DB] Uninitialized database detected. Running auto-seed migration...');
    seedDatabase(db);
  }

  dbInstance = db;
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__TALENTLENS_DB__ = db;
  }

  return db;
}

/**
 * Creates relational tables if they do not already exist.
 * @param {Database.Database} db
 */
function initSchema(db) {
  db.exec(`
    -- 1. Employees Table
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      age INTEGER NOT NULL,
      learning_velocity REAL NOT NULL,
      recency_score REAL NOT NULL,
      explicit_skills TEXT NOT NULL, -- JSON array of { name, embedding }
      inferred_skills TEXT NOT NULL, -- JSON array of { name, embedding }
      created_at TEXT NOT NULL
    );

    -- 2. Raw Production Telemetry Work Logs
    CREATE TABLE IF NOT EXISTS work_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- 3. Engineering Target Roles
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT NOT NULL,
      required_skills TEXT NOT NULL, -- JSON array of { name, embedding }
      created_at TEXT NOT NULL
    );

    -- 4. User Accounts (Candidate, Evaluator, Platform User)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      email_verified INTEGER DEFAULT 0,
      phone_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- 5. Dual Verification OTP Codes
    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target TEXT NOT NULL, -- Normalized email or phone
      type TEXT NOT NULL,   -- 'email' | 'phone'
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      verified INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    -- 6. Authenticated Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 7. Inferred Extraction Telemetry Audit History
    CREATE TABLE IF NOT EXISTS inferred_extractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL,
      log_index INTEGER,
      detected_skill TEXT NOT NULL,
      confidence REAL NOT NULL,
      evidence_quote TEXT,
      category TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    -- Indices for high-speed indexed lookups
    CREATE INDEX IF NOT EXISTS idx_work_logs_employee ON work_logs(employee_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_otps_target_type ON otps(target, type);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  `);
}

export default getDb;
