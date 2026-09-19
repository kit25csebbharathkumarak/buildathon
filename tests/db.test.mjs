import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllEmployees,
  getEmployeeById,
  getEmployeeHidden,
  addInferredSkill,
  getAllRoles,
  getRoleById,
  findUserByEmail,
  findUserByPhone,
  createUser,
  createOtp,
  verifyOtp,
  verifyPassword,
  createSession,
  validateSession,
} from '../lib/db/queries.js';

describe('TalentLens SQLite Database Layer (ACID Relational Storage)', () => {
  test('getAllEmployees queries persistent employees and work logs from SQLite', () => {
    const employees = getAllEmployees();
    assert.ok(Array.isArray(employees), 'Employees must be an array');
    assert.ok(employees.length >= 7, 'Database should contain seeded employees');

    const first = employees[0];
    assert.ok(first.id, 'Employee must have ID');
    assert.ok(Array.isArray(first.explicit_skills), 'explicit_skills must be parsed array');
    assert.ok(Array.isArray(first.inferred_skills), 'inferred_skills must be parsed array');
    assert.ok(Array.isArray(first.raw_logs), 'raw_logs must be joined from work_logs table');
    assert.ok(first.raw_logs.length > 0, 'Employee should have work logs');
  });

  test('getEmployeeById resolves candidate with telemetry logs', () => {
    const emp = getEmployeeById('emp-001') || getEmployeeById('emp-101');
    assert.ok(emp, 'Employee should be found by ID');
    assert.ok(emp.hidden?.name, 'Employee name should be populated');
    assert.ok(emp.raw_logs.length > 0, 'Work logs should be joined');
    assert.strictEqual(typeof emp.learning_velocity, 'number');
  });

  test('getEmployeeHidden isolates candidate identity for blind matching', () => {
    const hidden = getEmployeeHidden('emp-001') || getEmployeeHidden('emp-101');
    assert.ok(hidden, 'Candidate should exist');
    assert.ok(hidden.name, 'Name must exist');
    assert.ok(hidden.title, 'Title must exist');
    assert.strictEqual(typeof hidden.age, 'number', 'Age must be a number');
  });

  test('addInferredSkill persists newly discovered skill into SQLite and deduplicates', () => {
    const employees = getAllEmployees();
    const targetId = employees[0].id;
    const testSkill = `Distributed Consensus Raft ${Date.now()}`;

    // Add first time
    const added = addInferredSkill(targetId, testSkill);
    assert.strictEqual(added, true, 'Skill should be successfully appended');

    // Retrieve from database to verify persistence
    const updated = getEmployeeById(targetId);
    const hasSkill = updated.inferred_skills.some(
      (s) => (typeof s === 'object' ? s.name : s) === testSkill
    );
    assert.strictEqual(hasSkill, true, 'Newly added skill must persist in database');

    // Duplicate addition should return false
    const duplicate = addInferredSkill(targetId, testSkill);
    assert.strictEqual(duplicate, false, 'Duplicate skill must not be added twice');
  });

  test('getAllRoles and getRoleById query target roles with requirements', () => {
    const roles = getAllRoles();
    assert.ok(Array.isArray(roles));
    assert.ok(roles.length >= 6, 'Should contain all 6 seeded roles');

    const first = roles[0];
    assert.ok(first.id);
    assert.ok(first.title);
    assert.ok(Array.isArray(first.required_skills));

    const byId = getRoleById(first.id);
    assert.strictEqual(byId.title, first.title);
  });

  test('User, OTP, and Session lifecycle persists cleanly in SQLite', () => {
    const uniqueEmail = `db_test_${Date.now()}@meridian.io`;
    const uniquePhone = `+1 (555) ${Math.floor(100 + Math.random() * 899)}-${Math.floor(1000 + Math.random() * 8999)}`;

    // 1. Create User
    const user = createUser({
      name: 'Morgan Blake',
      email: uniqueEmail,
      phone: uniquePhone,
      role: 'Staff Kernel Architect',
      department: 'Low Latency Systems',
      password: 'SqlitePassword2026!',
    });

    assert.ok(user.id.startsWith('usr-'));
    assert.strictEqual(user.email, uniqueEmail);

    // 2. Query User
    const queried = findUserByEmail(uniqueEmail);
    assert.ok(queried);
    assert.strictEqual(queried.name, 'Morgan Blake');
    assert.strictEqual(verifyPassword(queried, 'SqlitePassword2026!'), true);

    // 3. OTP verification in SQLite
    const { code } = createOtp(uniqueEmail, 'email');
    assert.strictEqual(code.length, 6);
    const otpRes = verifyOtp(uniqueEmail, 'email', code);
    assert.strictEqual(otpRes.success, true);
    assert.strictEqual(otpRes.verified, true);

    // 4. Session management in SQLite
    const token = createSession(user.id);
    assert.ok(token.startsWith('tl_sess_'));
    const sessionUser = validateSession(token);
    assert.ok(sessionUser);
    assert.strictEqual(sessionUser.id, user.id);
    assert.strictEqual(sessionUser.email, uniqueEmail);
  });
});
