import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toBlindProfile, sanitizeLogText, toBlindPitch } from '../lib/ai/blind-profile.js';

describe('TalentLens Strict Blind Profile Transformation Engine', () => {
  const mockDirtyCandidate = {
    id: 'emp-101',
    name: 'Elena Rostova',
    title: 'Senior QA Automation Engineer',
    age: 34,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    email: 'elena.rostova@meridian.io',
    phone: '+1 (555) 234-5678',
    gender: 'Female',
    department: 'Quality & Platform Engineering',
    hidden: {
      name: 'Elena Rostova',
      title: 'Senior QA Automation Engineer',
      age: 34,
    },
    learning_velocity: 0.94,
    recency_score: 0.88,
    explicit_skills: [
      { name: 'React', embedding: [0.1, 0.2] },
      { name: 'Playwright', embedding: [0.3, 0.4] },
    ],
    inferred_skills: [
      { name: 'Distributed Tracing', confidence: 0.91, evidence: 'Wrote mock server' },
    ],
    work_logs: [
      {
        id: 'LOG-001',
        type: 'PR_REVIEW',
        text: 'Elena Rostova reviewed PR #302 on WebSocket backpressure handling.',
      },
    ],
    match_score: 92,
    score_breakdown: { explicit: 40, transferable: 24, recency: 14, learning: 14 },
    pitch: 'Elena Rostova demonstrated top-tier engineering fit in her recent pull requests.',
  };

  it('strictly excludes all personal identity fields: name, title, age, avatar, email, phone, gender, hidden', () => {
    const blind = toBlindProfile(mockDirtyCandidate);

    assert.ok(blind);
    assert.equal(blind.id, 'emp-101');
    assert.equal(blind.anonymous_label, 'Candidate #P101');

    // Structural exclusion assertions
    assert.equal(blind.name, undefined);
    assert.equal(blind.title, undefined);
    assert.equal(blind.age, undefined);
    assert.equal(blind.avatar, undefined);
    assert.equal(blind.email, undefined);
    assert.equal(blind.phone, undefined);
    assert.equal(blind.gender, undefined);
    assert.equal(blind.department, undefined);
    assert.equal(blind.hidden, undefined);

    // Prohibited key checks on root object
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'name'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'title'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'age'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'avatar'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'email'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'phone'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'gender'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(blind, 'hidden'), false);

    // Ensure candidate's actual personal name never appears anywhere in output
    const serialized = JSON.stringify(blind);
    assert.ok(!serialized.includes('"Elena Rostova"'));
    assert.ok(!serialized.includes('Senior QA Automation Engineer'));
  });

  it('retains allow-listed mathematical and skill attributes accurately', () => {
    const blind = toBlindProfile(mockDirtyCandidate);

    assert.equal(blind.learning_velocity, 0.94);
    assert.equal(blind.recency_score, 0.88);
    assert.equal(blind.match_score, 92);
    assert.equal(blind.explicit_skills.length, 2);
    assert.equal(blind.inferred_skills.length, 1);
    assert.equal(blind.work_logs.length, 1);
  });

  it('sanitizes work logs and pitch text removing candidate names and gendered pronouns', () => {
    const sanitizedLog = sanitizeLogText('Elena Rostova resolved distributed deadlock in Spark cluster.');
    assert.ok(!sanitizedLog.includes('Elena Rostova'));
    assert.ok(sanitizedLog.includes('Engineer'));

    const sanitizedPitch = toBlindPitch('Elena Rostova demonstrated top fit in her recent pull requests.');
    assert.ok(!sanitizedPitch.includes('Elena Rostova'));
    assert.ok(!sanitizedPitch.includes(' her '));
    assert.ok(sanitizedPitch.includes('This candidate'));
    assert.ok(sanitizedPitch.includes('their'));
  });

  it('safely handles empty or null candidates without crashing', () => {
    assert.equal(toBlindProfile(null), null);
    assert.equal(toBlindProfile(undefined), null);
  });
});
