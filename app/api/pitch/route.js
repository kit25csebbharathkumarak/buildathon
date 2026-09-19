import { NextResponse } from 'next/server';
import employees from '../../../data/employees.json';
import roles from '../../../data/roles.json';
import { embed } from '../../../lib/ai/embeddings';
import { scoreMatch } from '../../../lib/ai/score-match';
import { generatePitch } from '../../../lib/ai/generate-pitch';

/**
 * API route to run Blind Matching against all internal talent for a target role without bias.
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

    // Embed role required skills using local Transformers.js engine
    const roleSkillVectors = await Promise.all(
      (role.required_skills || []).map((skill) => embed(skill))
    );

    const targetEmployees = candidateId
      ? employees.filter((e) => e.id === candidateId)
      : employees;

    const scoredCandidates = [];

    for (const emp of targetEmployees) {
      // Embed explicit and inferred skills separately
      const explicitVectors = await Promise.all(
        (emp.explicit_skills || []).map((skill) => embed(skill))
      );
      const inferredVectors = await Promise.all(
        (emp.inferred_skills || []).map((skill) => embed(skill))
      );

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

      // Find overlapping skill names for grounding pitch
      const allEmpSkills = [...(emp.explicit_skills || []), ...(emp.inferred_skills || [])];
      const matchedSkillNames = role.required_skills.filter((req) =>
        allEmpSkills.some((s) => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))
      );

      // Generate 3-sentence anonymized pitch passing ONLY competence telemetry (strictly ZERO identity fields)
      const pitch = await generatePitch({
        role_description: `${role.title}: ${role.description}`,
        matched_skills_with_breakdown: {
          score: scoringResult.score,
          breakdown: scoringResult.breakdown,
          matched_skills: matchedSkillNames.length > 0 ? matchedSkillNames : allEmpSkills.slice(0, 3),
        },
      });

      scoredCandidates.push({
        id: emp.id,
        score: scoringResult.score,
        breakdown: scoringResult.breakdown,
        pitch,
        hidden: emp.hidden, // Kept concealed on client until explicit reveal toggle
      });
    }

    // Sort descending by calculated score
    scoredCandidates.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      role: {
        id: role.id,
        title: role.title,
        department: role.department,
        description: role.description,
        required_skills: role.required_skills,
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
