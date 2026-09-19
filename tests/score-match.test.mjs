import test from 'node:test';
import assert from 'node:assert';
import { scoreMatch } from '../lib/ai/score-match.js';

test('scoreMatch: returns pure weighted score matching formula', () => {
  // Mock normalized unit vectors
  const vecA = [1, 0, 0];
  const vecB = [0, 1, 0];

  const result = scoreMatch({
    employeeSkillVectors: {
      explicit: [vecA],
      inferred: [vecA],
    },
    roleSkillVectors: [vecA],
    recencyScore: 1.0,
    learningVelocity: 1.0,
  });

  // When all components are 1.0:
  // 0.4*1.0 + 0.3*1.0 + 0.2*1.0 + 0.1*1.0 = 1.0 -> 100%
  assert.strictEqual(result.score, 100.0);
  assert.strictEqual(result.breakdown.explicitMatch, 1.0);
  assert.strictEqual(result.breakdown.transferableMatch, 1.0);
  assert.strictEqual(result.breakdown.recencyScore, 1.0);
  assert.strictEqual(result.breakdown.learningVelocity, 1.0);
});

test('scoreMatch: correctly bounds values and breakdown', () => {
  const result = scoreMatch({
    employeeSkillVectors: [],
    roleSkillVectors: [],
    recencyScore: 0.5,
    learningVelocity: 0.5,
  });

  assert.ok(typeof result.score === 'number');
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.breakdown.weightedBreakdown.explicit >= 0);
  assert.ok(result.breakdown.weightedBreakdown.transferable >= 0);
  assert.ok(result.breakdown.weightedBreakdown.recency >= 0);
  assert.ok(result.breakdown.weightedBreakdown.velocity >= 0);
});
