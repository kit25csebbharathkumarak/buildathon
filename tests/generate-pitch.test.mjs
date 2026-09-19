import test, { after } from 'node:test';
import assert from 'node:assert';
import { generatePitch } from '../lib/ai/generate-pitch.js';

after(() => {
  setTimeout(() => process.exit(0), 100).unref();
});

test('generatePitch: returns exactly 3 sentences grounded in telemetry', async () => {
  const params = {
    role_description: 'Staff Distributed Systems Architect: Lead high-availability raft clusters',
    matched_skills_with_breakdown: {
      score: 84.5,
      breakdown: {
        explicitMatch: 0.8,
        transferableMatch: 0.85,
        recencyScore: 0.9,
        learningVelocity: 0.92,
      },
      matched_skills: ['Distributed Consensus (Raft)', 'Multi-Region Replication'],
    },
  };

  const pitch = await generatePitch(params);

  assert.ok(typeof pitch === 'string', 'Pitch should be a string');
  assert.ok(pitch.length > 50, 'Pitch should be meaningful');

  // Count sentences: sentences terminate with periods
  const sentences = pitch
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  assert.strictEqual(sentences.length, 3, `Pitch must contain exactly 3 sentences, got ${sentences.length}`);
});

test('generatePitch: strictly excludes all personal identity fields and names', async () => {
  const params = {
    role_description: 'Staff Distributed Systems Architect',
    matched_skills_with_breakdown: {
      score: 90,
      breakdown: {
        explicitMatch: 0.9,
        transferableMatch: 0.88,
        learningVelocity: 0.95,
      },
      matched_skills: ['Distributed Systems'],
      // Simulating forbidden identity parameter injection
      name: 'Alex Chen',
      title: 'Senior Backend Engineer',
      age: 31,
      gender: 'male',
    },
  };

  const pitch = await generatePitch(params);
  const lower = pitch.toLowerCase();

  assert.ok(!lower.includes('alex'), 'Pitch must never mention candidate name');
  assert.ok(!lower.includes('chen'), 'Pitch must never mention candidate surname');
  assert.ok(!lower.includes('31'), 'Pitch must never mention candidate age');
  assert.ok(!/\b(he|she|his|him|hers)\b/i.test(pitch), 'Pitch must be gender-neutral');
});
