import test, { after } from 'node:test';
import assert from 'node:assert';
import { extractSkills } from '../lib/ai/extract-skills.js';

after(() => {
  setTimeout(() => process.exit(0), 100).unref();
});

test('extractSkills: returns valid schema with required fields in local fallback mode', async () => {
  const logEntry = {
    type: 'INCIDENT_POSTMORTEM',
    text: 'Identified raft consensus split-brain condition in custom raft lease coordinator, mitigated by implementing atomic epoch ticketing.',
  };

  const result = await extractSkills(logEntry);

  assert.ok(result, 'Result should exist');
  assert.strictEqual(typeof result.detected_skill, 'string');
  assert.strictEqual(typeof result.confidence, 'number');
  assert.ok(result.confidence >= 0.7 && result.confidence <= 1.0, 'Confidence should be between 0.7 and 1.0');
  assert.strictEqual(typeof result.evidence_quote, 'string');
  assert.strictEqual(typeof result.category, 'string');
});

test('extractSkills: never includes hidden identity fields in output', async () => {
  const logWithIdentity = {
    type: 'PR_REVIEW',
    text: 'Reviewed PR #1429 on Kafka consumer group rebalancing: recommended ring-buffer zero-copy serialization.',
    // Simulating accidental leakage in input
    hidden: {
      name: 'Alex Chen',
      title: 'Senior Backend Engineer',
      age: 31,
    },
  };

  const result = await extractSkills(logWithIdentity);

  assert.strictEqual(result.name, undefined, 'Must not leak candidate name');
  assert.strictEqual(result.title, undefined, 'Must not leak candidate title');
  assert.strictEqual(result.age, undefined, 'Must not leak candidate age');
  assert.strictEqual(result.hidden, undefined, 'Must not leak hidden container');

  // Verify none of the output strings contain identity values
  const stringified = JSON.stringify(result).toLowerCase();
  assert.ok(!stringified.includes('alex chen'), 'Output must not leak name');
  assert.ok(!stringified.includes('senior backend engineer'), 'Output must not leak title');
});

test('extractSkills: safely handles missing or empty log entry', async () => {
  const result = await extractSkills(null);
  assert.ok(result);
  assert.strictEqual(typeof result.detected_skill, 'string');
});
