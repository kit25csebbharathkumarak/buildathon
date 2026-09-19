import { NextResponse } from 'next/server';
import employees from '../../../data/employees.json';
import roles from '../../../data/roles.json';
import { embed } from '../../../lib/ai/embeddings';
import { scoreMatch } from '../../../lib/ai/score-match';
import { generatePitch } from '../../../lib/ai/generate-pitch';

/**
 * Extracts normalized vector from cached skill object or computes live embedding as fallback.
 * @param {string|{name: string, embedding?: number[]}} skill - Skill object or name.
 * @returns {Promise<number[]>} 384-dimensional vector.
 */
async function getSkillVector(skill) {
  if (typeof skill === 'object' && skill !== null && Array.isArray(skill.embedding) && skill.embedding.length === 384) {
    return skill.embedding;
  }
  const text = typeof skill === 'object' && skill !== null ? (skill.name || skill.skill || '') : String(skill || '');
  return embed(text);
}

/**
 * Normalizes skill name from string or object representation.
 * @param {string|{name: string}} skill - Skill entry.
 * @returns {string} Clean skill name.
 */
function getSkillName(skill) {
  if (typeof skill === 'object' && skill !== null) {
    return skill.name || skill.skill || '';
  }
  return String(skill || '');
}

/**
 * API route to run Blind Matching against all internal talent for a target role without bias.
 * Strips all personal identity fields to prevent data leaks before explicit on-demand reveal.
 * @param {Request} request - Next.js HTTP request.
 * @returns {Promise<NextResponse>} JSON response containing scored and anonymized candidate pitches.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { roleId, candidateId } = body;

    const role = roles.find((r) => r.id === roleId) || roles[0];
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Read cached embeddings in parallel or fallback to live embed()
    const roleSkillVectors = await Promise.all(
      (role.required_skills || []).map(getSkillVector)
    );

    const targetEmployees = candidateId
      ? employees.filter((e) => e.id === candidateId)
      : employees;

    const roleReqNames = (role.required_skills || []).map(getSkillName);

    // Parallelize candidate evaluation across all profiles
    const scoredCandidates = await Promise.all(
      targetEmployees.map(async (emp) => {
        const [explicitVectors, inferredVectors] = await Promise.all([
          Promise.all((emp.explicit_skills || []).map(getSkillVector)),
          Promise.all((emp.inferred_skills || []).map(getSkillVector)),
        ]);

        // Score candidate using PURE mathematical formula (no LLM in scoring)
        const scoringResult = scoreMatch({
          employeeSkillVectors: {
            explicit: explicitVectors,
            inferred: inferredVectors,
          },
          roleSkillVectors,
          recencyScore: emp.recency_score || 0.88,
          learningVelocity: emp.learning_velocity || 0.85,
        });

        // Resolve string names for grounding pitch
        const allEmpSkillNames = [
          ...(emp.explicit_skills || []).map(getSkillName),
          ...(emp.inferred_skills || []).map(getSkillName),
        ];

        const matchedSkillNames = roleReqNames.filter((req) =>
          allEmpSkillNames.some(
            (s) =>
              s.toLowerCase().includes(req.toLowerCase()) ||
              req.toLowerCase().includes(s.toLowerCase())
          )
        );

        // Generate 3-sentence anonymized pitch passing ONLY competence telemetry (strictly ZERO identity fields)
        const pitch = await generatePitch({
          role_description: `${role.title}: ${role.description}`,
          matched_skills_with_breakdown: {
            score: scoringResult.score,
            breakdown: scoringResult.breakdown,
            matched_skills:
              matchedSkillNames.length > 0 ? matchedSkillNames : allEmpSkillNames.slice(0, 3),
          },
        });

        // CRITICAL: Strictly omit emp.hidden to prevent blind matching data leak
        return {
          id: emp.id,
          score: scoringResult.score,
          breakdown: scoringResult.breakdown,
          pitch,
        };
      })
    );

    // Sort descending by calculated score
    scoredCandidates.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      role: {
        id: role.id,
        title: role.title,
        department: role.department,
        description: role.description,
        required_skills: role.required_skills.map(getSkillName),
      },
      candidates: scoredCandidates,
    });
  } catch (error) {
    console.error('Blind Matching API error:', error);
    return NextResponse.json(
      { error: 'Failed to process blind matching pool', details: error.message },
      { status: 500 }
    );
  }
}
