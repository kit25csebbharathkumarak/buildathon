import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  findUserByEmail,
  findUserByPhone,
  createUser,
  createOtp,
  verifyOtp,
  verifyPassword,
  createSession,
  validateSession,
  sanitizeUser,
} from '../lib/auth-store.js';

describe('TalentLens Authentication & Dual OTP Verification Suite', () => {
  test('findUserByEmail correctly resolves seeded demo candidate', () => {
    const user = findUserByEmail('demo@talentlens.internal');
    assert.ok(user, 'Demo user should be located');
    assert.strictEqual(user.name, 'Elena Rostova');
    assert.strictEqual(user.verified.email, true);
    assert.strictEqual(user.verified.phone, true);
  });

  test('createUser adds new user and returns sanitized profile without password', () => {
    const testEmail = `candidate_${Date.now()}@meridian.io`;
    const user = createUser({
      name: 'Dr. Sarah Connor',
      email: testEmail,
      phone: '+1 (555) 777-9911',
      role: 'Staff Security Architect',
      department: 'Infrastructure Security',
      password: 'SecurePassword2026!',
    });

    assert.ok(user.id.startsWith('usr-'), 'User should have usr- ID prefix');
    assert.strictEqual(user.name, 'Dr. Sarah Connor');
    assert.strictEqual(user.email, testEmail);
    assert.strictEqual(user.password, undefined, 'Password must NOT be leaked in profile');
  });

  test('createOtp generates 6-digit code and verifyOtp validates it accurately', () => {
    const targetEmail = 'verification_test@meridian.io';
    const { code } = createOtp(targetEmail, 'email');

    assert.strictEqual(code.length, 6, 'Code must be 6 digits');
    assert.match(code, /^\d{6}$/, 'Code must be numeric');

    // Incorrect code fails
    const failRes = verifyOtp(targetEmail, 'email', '000000');
    assert.strictEqual(failRes.success, false);

    // Correct code succeeds
    const successRes = verifyOtp(targetEmail, 'email', code);
    assert.strictEqual(successRes.success, true);
    assert.strictEqual(successRes.verified, true);
  });

  test('verifyOtp accepts universal test code 123456 in test environment', () => {
    const targetPhone = '+1 (555) 999-0000';
    const res = verifyOtp(targetPhone, 'phone', '123456');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.verified, true);
  });

  test('verifyPassword validates correct passwords and rejects incorrect ones', () => {
    const user = findUserByEmail('demo@talentlens.internal');
    assert.ok(user);
    assert.strictEqual(verifyPassword(user, 'TalentLens2026!'), true);
    assert.strictEqual(verifyPassword(user, 'WrongPassword'), false);
    assert.strictEqual(verifyPassword(user, ''), false);
  });

  test('createSession and validateSession handle active session lifecycle', () => {
    const user = findUserByEmail('demo@talentlens.internal');
    const token = createSession(user.id);

    assert.ok(token.startsWith('tl_sess_'));
    const sessionUser = validateSession(token);
    assert.ok(sessionUser);
    assert.strictEqual(sessionUser.id, user.id);
    assert.strictEqual(sessionUser.email, user.email);
    assert.strictEqual(sessionUser.password, undefined);
  });
});
