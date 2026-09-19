import Link from 'next/link';
import { notFound } from 'next/navigation';
import employees from '../../../../data/employees.json';
import roles from '../../../../data/roles.json';
import SkillTree from '../../../../components/SkillTree';
import { generateRoadmap } from '../../../../lib/ai/generate-roadmap';
import { ArrowLeft, Compass, CheckCircle2, Sparkles, User, Briefcase } from 'lucide-react';

/**
 * Career GPS Roadmap page displaying interactive branching progression graph to target role.
 * @param {Object} props - Page properties.
 * @param {{employeeId: string, roleId: string}} props.params - Dynamic route parameters.
 * @returns {Promise<JSX.Element>}
 */
export default async function RoadmapPage({ params }) {
  const employee = employees.find((e) => e.id === params.employeeId) || employees[0];
  const role = roles.find((r) => r.id === params.roleId) || roles[0];

  if (!employee || !role) {
    notFound();
  }

  const currentSkills = [
    ...(employee.explicit_skills || []),
    ...(employee.inferred_skills || []),
  ];

  // Generate Career GPS roadmap graph
  const roadmapData = await generateRoadmap({
    current_skills: currentSkills,
    target_role: role.title,
    role_requirements: role.required_skills,
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/employee/${employee.id}`}
          className="inline-flex items-center gap-2 font-mono text-xs text-talent-muted hover:text-talent-teal transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {employee.hidden?.name}&apos;s Profile</span>
        </Link>

        {/* Role Selector Quick Links */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-talent-muted font-mono">Target Role:</span>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <Link
                key={r.id}
                href={`/roadmap/${employee.id}/${r.id}`}
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

      {/* Target Role & Candidate Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-talent-border bg-talent-card p-6 sm:p-8 shadow-card-elevated">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-talent-purple mb-2">
            <User className="h-3.5 w-3.5" />
            <span>Candidate Profile</span>
          </div>
          <h2 className="text-xl font-bold text-talent-text">{employee.hidden?.name}</h2>
          <p className="text-xs text-talent-muted mt-0.5">
            Current Title: <strong className="text-talent-subtext">{employee.hidden?.title}</strong>
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {currentSkills.slice(0, 4).map((s, i) => (
              <span
                key={i}
                className="rounded bg-talent-surface px-2 py-0.5 text-[10px] text-talent-subtext border border-talent-border"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-talent-border pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2 text-xs font-mono text-talent-teal mb-2">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Target Role Mandate</span>
          </div>
          <h2 className="text-xl font-bold text-talent-text">{role.title}</h2>
          <p className="text-xs text-talent-muted mt-0.5">
            Department: <strong className="text-talent-subtext">{role.department}</strong>
          </p>
          <p className="mt-2 text-xs text-talent-subtext leading-relaxed">
            {role.description}
          </p>
        </div>
      </div>

      {/* Career GPS SkillTree Interactive Component */}
      <SkillTree
        nodes={roadmapData.nodes}
        edges={roadmapData.edges}
        targetRole={role.title}
      />

      {/* Structured Competency Gap & Transition Plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-talent-teal/30 bg-talent-card p-6 shadow-card-elevated">
          <div className="flex items-center gap-2 text-talent-teal font-mono text-xs font-bold uppercase mb-3">
            <CheckCircle2 className="h-4 w-4" />
            <span>Acquired Foundation</span>
          </div>
          <p className="text-xs text-talent-muted mb-4">
            Competencies already verified through work logs and self-reporting.
          </p>
          <div className="space-y-2">
            {roadmapData.nodes
              .filter((n) => n.status === 'acquired')
              .map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg bg-talent-surface/80 p-2.5 text-xs font-semibold text-talent-text border border-talent-border flex items-center justify-between"
                >
                  <span>{n.label}</span>
                  <span className="text-talent-teal text-[10px] font-mono">100% Fit</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-talent-purple/30 bg-talent-card p-6 shadow-card-elevated">
          <div className="flex items-center gap-2 text-talent-purple font-mono text-xs font-bold uppercase mb-3">
            <Compass className="h-4 w-4 animate-spin" />
            <span>In-Progress Bridge</span>
          </div>
          <p className="text-xs text-talent-muted mb-4">
            Active growth vectors bridging existing capabilities to role standards.
          </p>
          <div className="space-y-2">
            {roadmapData.nodes
              .filter((n) => n.status === 'in_progress')
              .map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg bg-talent-surface/80 p-2.5 text-xs font-semibold text-talent-text border border-talent-border flex items-center justify-between"
                >
                  <span>{n.label}</span>
                  <span className="text-talent-purple text-[10px] font-mono">Bridging</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-talent-card p-6 shadow-card-elevated">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase mb-3">
            <Sparkles className="h-4 w-4" />
            <span>Target Role Milestones</span>
          </div>
          <p className="text-xs text-talent-muted mb-4">
            Key milestone prerequisites required for full transition sign-off.
          </p>
          <div className="space-y-2">
            {roadmapData.nodes
              .filter((n) => n.status === 'recommended')
              .map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg bg-talent-surface/80 p-2.5 text-xs font-semibold text-talent-text border border-talent-border flex items-center justify-between"
                >
                  <span>{n.label}</span>
                  <span className="text-amber-400 text-[10px] font-mono">Target</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
