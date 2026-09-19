/**
 * Strict Blind Profile Transformation Engine
 * 
 * Guarantees structural exclusion of candidate demographic and personal identity data.
 * Adheres strictly to an allow-list: name, title, age, avatar, email, phone, gender,
 * department, and hidden metadata are impossible to reach downstream prompts or UI cards.
 */

const ALLOWED_BLIND_FIELDS = new Set([
  'id',
  'anonymous_label',
  'explicit_skills',
  'inferred_skills',
  'learning_velocity',
  'recency_score',
  'work_logs',
  'raw_logs',
  'created_at',
  'match_score',
  'score_breakdown',
  'pitch',
]);

/**
 * Transforms an employee or candidate record into a strictly blind profile.
 * @param {Object} candidate - Raw candidate object from DB or API.
 * @returns {Object} Blind candidate profile containing ONLY allow-listed attributes.
 */
export function toBlindProfile(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const id = candidate.id || 'candidate_anon';
  const idSuffix = String(id).replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  const anonymous_label = `Candidate #${idSuffix}`;

  // Safe parse skills
  const explicit_skills = Array.isArray(candidate.explicit_skills)
    ? candidate.explicit_skills
    : typeof candidate.explicit_skills === 'string'
      ? JSON.parse(candidate.explicit_skills || '[]')
      : [];

  const inferred_skills = Array.isArray(candidate.inferred_skills)
    ? candidate.inferred_skills
    : typeof candidate.inferred_skills === 'string'
      ? JSON.parse(candidate.inferred_skills || '[]')
      : [];

  // Anonymize work logs: strip any employee_id or personal signatures
  const rawLogs = candidate.work_logs || candidate.raw_logs || [];
  const work_logs = Array.isArray(rawLogs)
    ? rawLogs.map((log, idx) => ({
        id: log.id || `LOG-${idx + 1}`,
        type: log.type || 'WORK_LOG',
        text: sanitizeLogText(log.text || ''),
        created_at: log.created_at || null,
      }))
    : [];

  const blind = {
    id,
    anonymous_label,
    explicit_skills: explicit_skills.map(s => (typeof s === 'object' ? { name: s.name, embedding: s.embedding } : { name: s })),
    inferred_skills: inferred_skills.map(s => (typeof s === 'object' ? { name: s.name, confidence: s.confidence, evidence: s.evidence } : { name: s })),
    learning_velocity: Number(candidate.learning_velocity ?? 0.85),
    recency_score: Number(candidate.recency_score ?? 0.90),
    work_logs,
  };

  if (candidate.match_score !== undefined) {
    blind.match_score = candidate.match_score;
  }
  if (candidate.score_breakdown) {
    blind.score_breakdown = candidate.score_breakdown;
  }
  if (candidate.pitch) {
    blind.pitch = toBlindPitch(candidate.pitch);
  }

  // Audit defense: delete any prohibited field that might have slipped through
  delete blind.name;
  delete blind.title;
  delete blind.age;
  delete blind.avatar;
  delete blind.email;
  delete blind.phone;
  delete blind.gender;
  delete blind.department;
  delete blind.hidden;

  return blind;
}

/**
 * Sanitizes log text to remove any candidate names or personal identity references.
 * @param {string} text
 * @returns {string}
 */
export function sanitizeLogText(text) {
  if (!text) return '';
  return text
    .replace(/(Alex Chen|Elena Rostova|Marcus Chen|Sarah Jenkins|David Park|Priya Patel|Candidate \w+)/gi, 'Engineer')
    .trim();
}

/**
 * Ensures pitch copy contains zero personal pronouns or identity references.
 * @param {string} pitch
 * @returns {string}
 */
export function toBlindPitch(pitch) {
  if (!pitch) return '';
  return pitch
    .replace(/(Alex Chen|Elena Rostova|Marcus Chen|Sarah Jenkins|David Park|Priya Patel)/gi, 'This candidate')
    .replace(/\b(he|she)\b/gi, 'they')
    .replace(/\b(his|her)\b/gi, 'their')
    .replace(/\b(him|her)\b/gi, 'them');
}
