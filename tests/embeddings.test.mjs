import test, { after } from 'node:test';
import assert from 'node:assert';
import { embed, cosineSim } from '../lib/ai/embeddings.js';

after(() => {
  setTimeout(() => process.exit(0), 200).unref();
});

test('embeddings: embed returns normalized vector of 384 dimensions', async () => {
  const vector = await embed('Distributed Consensus Raft');
  assert.ok(Array.isArray(vector));
  assert.strictEqual(vector.length, 384);

  // Check vector normalization: sum of squares ≈ 1.0
  const normSq = vector.reduce((acc, v) => acc + v * v, 0);
  assert.ok(Math.abs(normSq - 1.0) < 0.01, `Vector norm ${normSq} should be close to 1.0`);
});

test('embeddings: cosineSim computes accurate similarities', () => {
  const vec1 = [1, 0, 0];
  const vec2 = [1, 0, 0];
  const sim = cosineSim(vec1, vec2);
  assert.strictEqual(sim, 1.0);

  const emptySim = cosineSim([], []);
  assert.strictEqual(emptySim, 0);
});
