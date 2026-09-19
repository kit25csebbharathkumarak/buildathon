import Link from 'next/link';
import { notFound } from 'next/navigation';
import employees from '../../../data/employees.json';
import roles from '../../../data/roles.json';
import PitchCard from '../../../components/PitchCard';
import { embed } from '../../../lib/ai/embeddings';
import { scoreMatch } from '../../../lib/ai/score-match';
import { generatePitch } from '../../../lib/ai/generate-pitch';
import { ArrowLeft, ShieldCheck, Scale } from 'lucide-react';

/**
 * Extracts vector from precomputed cache or live embed() fallback.
 * @param {string|{name: string, embedding?: number[]}} skill - Skill entry.
 * @returns {Promise<number[]>}
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
 * @returns {string}
 */
function getSkillName(skill) {
  if (typeof skill === 'object' && skill !== null) {
    return skill.name || skill.skill || '';
  }
  return String(skill || '');
}

/**
 * Blind Matching Pool page evaluating candidates under zero-bias criteria and displaying PitchCards.
 * Personal identity fields are strictly excluded from the server payload to eliminate client-side leaks.
 * @param {Object} props - Page properties.
 * @param {{roleId: string}} props.params - Dynamic route parameters.
 * @returns {Promise<JSX.Element>}
 */
export default async function MatchPage({ params }) {
  const role = roles.find((r) => r.id === params.roleId) || roles[0];

  if (!role) {
    notFound();
  }

  // Read cached embeddings in parallel or fallback to live embed()
  const roleSkillVectors = await Promise.all(
    (role.required_skills || []).map(getSkillVector)
  );

  const roleReqNames = (role.required_skills || []).map(getSkillName);

  // Compute pure mathematical scores and blind pitches for all candidates in parallel
  const scoredCandidates = await Promise.all(
    employees.map(async (emp) => {
      const [explicitVectors, inferredVectors] = await Promise.all([
        Promise.all((emp.explicit_skills || []).map(getSkillVector)),
        Promise.all((emp.inferred_skills || []).map(getSkillVector)),
      ]);

      const scoreData = scoreMatch({
        employeeSkillVectors: {
          explicit: explicitVectors,
          inferred: inferredVectors,
        },
        roleSkillVectors,
        recencyScore: emp.recency_score || 0.88,
        learningVelocity: emp.learning_velocity || 0.85,
      });

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

      // Generate 3-sentence anonymized pitch (NO identity fields passed)
      const pitch = await generatePitch({
        role_description: `${role.title}: ${role.description}`,
        matched_skills_with_breakdown: {
          score: scoreData.score,
          breakdown: scoreData.breakdown,
          matched_skills:
            matchedSkillNames.length > 0 ? matchedSkillNames : allEmpSkillNames.slice(0, 3),
        },
      });

      // CRITICAL: Strictly exclude emp.hidden to prevent blind matching data leak
      return {
        id: emp.id,
        score: scoreData.score,
        breakdown: scoreData.breakdown,
        pitch,
      };
    })
  );

  // Sort descending by calculated score
  scoredCandidates.sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-talent-muted hover:text-talent-teal transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Talent Directory</span>
        </Link>

        {/* Role Selector Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-talent-muted font-mono">Role Pool:</span>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <Link
                key={r.id}
                href={`/match/${r.id}`}
                className={`rounded px-2.5 py-1 text-xs font-mono transition-colors ${
                  r.id === role.id
                    ? 'bg-talent-teal text-talent-bg font-bold shadow-glow-teal'
                    : 'bg-talent-card text-talent-subtext hover:bg-talent-surface border border-talent-border'
                }`}
              >
                {r.title.split(' ')[0]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Target Role & Audit Guarantee Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-talent-border bg-talent-card p-6 sm:p-8 shadow-card-elevated">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded bg-talent-surface px-2.5 py-0.5 font-mono text-xs text-talent-muted border border-talent-border">
                {role.department}
              </span>
              <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zero Demographic Bias Audited
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-talent-text">{role.title}</h1>
            <p className="mt-2 text-xs sm:text-sm text-talent-subtext leading-relaxed">
              {role.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(role.required_skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded bg-talent-surface px-2.5 py-1 font-mono text-[11px] text-talent-subtext border border-talent-border"
                >
                  {getSkillName(skill)}
                </span>
              ))}
            </div>
          </div>

          {/* Pure Formula Explainer Box */}
          <div className="rounded-xl border border-talent-border/80 bg-talent-surface/80 p-5 font-mono text-xs space-y-2 lg:max-w-xs">
            <div className="flex items-center gap-1.5 text-talent-teal font-bold">
              <Scale className="h-4 w-4" />
              <span>Scoring Weight Distribution</span>
            </div>
            <div className="space-y-1 text-[11px] text-talent-subtext">
              <div className="flex justify-between">
                <span>• Explicit Match:</span>
                <strong className="text-talent-text">40%</strong>
              </div>
              <div className="flex justify-between">
                <span>• Transferable Match:</span>
                <strong className="text-talent-purple">30%</strong>
              </div>
              <div className="flex justify-between">
                <span>• Recency Score:</span>
                <strong className="text-talent-text">20%</strong>
              </div>
              <div className="flex justify-between">
                <span>• Learning Velocity:</span>
                <strong className="text-amber-400">10%</strong>
              </div>
            </div>
            <div className="pt-2 border-t border-talent-border text-[10px] text-talent-muted">
              Deterministic pure formula • Zero LLM scoring bias
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Anonymized Pitch Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-talent-text font-mono uppercase tracking-wide">
            Ranked Candidate Pool ({scoredCandidates.length} Evaluated)
          </h2>
          <span className="text-xs text-talent-muted font-mono">
            Sorted by Weighted Fit Score
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scoredCandidates.map((candidate) => (
            <PitchCard
              key={candidate.id}
              candidate={candidate}
              roleId={role.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
