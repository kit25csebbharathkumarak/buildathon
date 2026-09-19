/**
 * Pure cosine dot product between two vector arrays for internal scoring.
 * @param {number[]} a - Vector A.
 * @param {number[]} b - Vector B.
 * @returns {number} Normalized similarity in [0, 1].
 */
function vectorSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) return 0;
  const len = Math.min(a.length, b.length);
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  const sim = dot / denom;
  return Math.max(0, Math.min(1, (sim + 1) / 2));
}

/**
 * Calculates a match score between an employee and a role using a pure mathematical weighted formula without LLM calls.
 * Formula: 0.4 * explicitMatch + 0.3 * transferableMatch + 0.2 * recencyScore + 0.1 * learningVelocity
 * 
 * @param {Object} params - Input scoring parameters.
 * @param {Array<number[]>|{explicit?: Array<number[]>, inferred?: Array<number[]>}} params.employeeSkillVectors - Employee skill vectors (either array or categorized object).
 * @param {Array<number[]>} params.roleSkillVectors - Required skill vectors for the target role.
 * @param {number} [params.recencyScore=0.8] - Recency factor of applied skills (0.0 to 1.0).
 * @param {number} [params.learningVelocity=0.8] - Growth rate and skill acquisition rate (0.0 to 1.0).
 * @returns {{score: number, breakdown: {explicitMatch: number, transferableMatch: number, recencyScore: number, learningVelocity: number, weightedBreakdown: {explicit: number, transferable: number, recency: number, velocity: number}}}} Evaluated score and granular breakdown.
 */
export function scoreMatch({
  employeeSkillVectors = [],
  roleSkillVectors = [],
  recencyScore = 0.8,
  learningVelocity = 0.8,
}) {
  let explicitVectors = [];
  let transferableVectors = [];

  if (Array.isArray(employeeSkillVectors)) {
    // If passed as a single array, divide top half as explicit and lower as inferred/transferable
    const mid = Math.ceil(employeeSkillVectors.length / 2);
    explicitVectors = employeeSkillVectors.slice(0, mid);
    transferableVectors = employeeSkillVectors.slice(mid);
  } else if (employeeSkillVectors && typeof employeeSkillVectors === 'object') {
    explicitVectors = Array.isArray(employeeSkillVectors.explicit) ? employeeSkillVectors.explicit : [];
    transferableVectors = Array.isArray(employeeSkillVectors.inferred) ? employeeSkillVectors.inferred : [];
  }

  // Calculate explicit match across role skill requirements
  let explicitMatch = 0;
  if (roleSkillVectors.length > 0 && explicitVectors.length > 0) {
    let sumBestExplicit = 0;
    for (const roleVec of roleSkillVectors) {
      let maxSim = 0;
      for (const empVec of explicitVectors) {
        const sim = vectorSimilarity(roleVec, empVec);
        if (sim > maxSim) maxSim = sim;
      }
      sumBestExplicit += maxSim;
    }
    explicitMatch = sumBestExplicit / roleSkillVectors.length;
  } else if (explicitVectors.length > 0 && roleSkillVectors.length === 0) {
    explicitMatch = 0.5;
  }

  // Calculate transferable/inferred match across role skill requirements
  let transferableMatch = 0;
  if (roleSkillVectors.length > 0 && transferableVectors.length > 0) {
    let sumBestTransferable = 0;
    for (const roleVec of roleSkillVectors) {
      let maxSim = 0;
      for (const transVec of transferableVectors) {
        const sim = vectorSimilarity(roleVec, transVec);
        if (sim > maxSim) maxSim = sim;
      }
      sumBestTransferable += maxSim;
    }
    transferableMatch = sumBestTransferable / roleSkillVectors.length;
  } else if (transferableVectors.length > 0 && roleSkillVectors.length === 0) {
    transferableMatch = 0.5;
  }

  // Clamp parameters to [0, 1] range
  const normExplicit = Math.max(0, Math.min(1, explicitMatch));
  const normTransferable = Math.max(0, Math.min(1, transferableMatch));
  const normRecency = Math.max(0, Math.min(1, recencyScore));
  const normVelocity = Math.max(0, Math.min(1, learningVelocity));

  // Pure weighted formula: 0.4 * explicit + 0.3 * transferable + 0.2 * recency + 0.1 * velocity
  const weightedExplicit = 0.4 * normExplicit;
  const weightedTransferable = 0.3 * normTransferable;
  const weightedRecency = 0.2 * normRecency;
  const weightedVelocity = 0.1 * normVelocity;

  const totalScore = weightedExplicit + weightedTransferable + weightedRecency + weightedVelocity;

  return {
    score: Number((totalScore * 100).toFixed(1)),
    breakdown: {
      explicitMatch: Number(normExplicit.toFixed(3)),
      transferableMatch: Number(normTransferable.toFixed(3)),
      recencyScore: Number(normRecency.toFixed(3)),
      learningVelocity: Number(normVelocity.toFixed(3)),
      weightedBreakdown: {
        explicit: Number((weightedExplicit * 100).toFixed(1)),
        transferable: Number((weightedTransferable * 100).toFixed(1)),
        recency: Number((weightedRecency * 100).toFixed(1)),
        velocity: Number((weightedVelocity * 100).toFixed(1)),
      },
    },
  };
}
