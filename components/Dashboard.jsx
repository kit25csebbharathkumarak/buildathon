'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Compass,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

/**
 * Main dashboard component rendering talent metrics, feature spotlights, employee directory, and target roles.
 * @param {Object} props - Component properties.
 * @param {Array} props.employees - List of employee objects.
 * @param {Array} props.roles - List of target role objects.
 * @returns {JSX.Element}
 */
export default function Dashboard({ employees = [], roles = [] }) {
  const [selectedRole, setSelectedRole] = useState(roles[0]?.id || 'role-dist-arch');

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-talent-border bg-gradient-to-b from-talent-card via-talent-surface to-talent-bg p-8 sm:p-12 shadow-card-elevated">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-talent-teal/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-72 w-72 rounded-full bg-talent-purple/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-talent-teal/30 bg-talent-teal/10 px-3 py-1 text-xs font-mono text-talent-teal mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built by 4D Developers • Hackathon MVP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-talent-text leading-tight">
            AI-Powered Internal Talent{' '}
            <span className="bg-gradient-to-r from-talent-teal via-emerald-400 to-talent-purple bg-clip-text text-transparent">
              Discovery & Mobility
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-talent-subtext leading-relaxed">
            Eliminate internal mobility blind spots. Uncover hidden engineering competencies from raw work telemetry, chart directed career progression trees, and match talent purely on capability with zero demographic bias.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-talent-border pt-6">
            <div>
              <div className="font-mono text-2xl font-bold text-talent-teal">{employees.length}</div>
              <div className="text-xs text-talent-muted">Engineers Indexed</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-talent-purple">
                {employees.reduce((acc, e) => acc + (e.inferred_skills?.length || 0), 0)}
              </div>
              <div className="text-xs text-talent-muted">Latent Skills Uncovered</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-talent-text">384-Dim</div>
              <div className="text-xs text-talent-muted">Local Embeddings Space</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-emerald-400">0%</div>
              <div className="text-xs text-talent-muted">Demographic Bias</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars of TalentLens */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-talent-text">
              The Three Core Pillars
            </h2>
            <p className="text-xs text-talent-muted">
              Engineered architecture designed for high-signal talent discovery
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Hidden Skill Detective */}
          <div className="group rounded-xl border border-talent-border bg-talent-card p-6 shadow-card-elevated hover:border-talent-teal/60 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-talent-teal/15 text-talent-teal border border-talent-teal/30 mb-4 group-hover:scale-110 transition-transform">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-talent-text">Hidden Skill Detective</h3>
            <p className="mt-2 text-xs leading-relaxed text-talent-muted">
              Scans unstructured work telemetry (postmortems, PR reviews, RFCs). Uses streaming Socket.IO to emit detected capabilities and confidence scores in real-time.
            </p>
            <div className="mt-4 pt-4 border-t border-talent-border flex items-center justify-between">
              <span className="font-mono text-[11px] text-talent-teal">Socket.IO Streaming</span>
              <Link
                href="/employee/emp-101"
                className="flex items-center gap-1 text-xs font-semibold text-talent-text hover:text-talent-teal transition-colors"
              >
                <span>Live Feed</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Career GPS */}
          <div className="group rounded-xl border border-talent-border bg-talent-card p-6 shadow-card-elevated hover:border-talent-purple/60 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-talent-purple/15 text-talent-purple border border-talent-purple/30 mb-4 group-hover:scale-110 transition-transform">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-talent-text">Career GPS</h3>
            <p className="mt-2 text-xs leading-relaxed text-talent-muted">
              Renders directed progression graphs connecting current skills to target roles using absolute-positioned nodes and native SVG bezier connectors without external graph libraries.
            </p>
            <div className="mt-4 pt-4 border-t border-talent-border flex items-center justify-between">
              <span className="font-mono text-[11px] text-talent-purple">Pure SVG SkillTree</span>
              <Link
                href="/roadmap/emp-101/role-dist-arch"
                className="flex items-center gap-1 text-xs font-semibold text-talent-text hover:text-talent-purple transition-colors"
              >
                <span>View Graph</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: Blind Matching */}
          <div className="group rounded-xl border border-talent-border bg-talent-card p-6 shadow-card-elevated hover:border-emerald-500/60 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-talent-text">Blind Matching</h3>
            <p className="mt-2 text-xs leading-relaxed text-talent-muted">
              Deterministic 4-variable formula (0.4 explicit + 0.3 transferable + 0.2 recency + 0.1 velocity) with zero LLM in scoring. Generates anonymized 3-sentence capability pitches.
            </p>
            <div className="mt-4 pt-4 border-t border-talent-border flex items-center justify-between">
              <span className="font-mono text-[11px] text-emerald-400">Pure Mathematical Model</span>
              <Link
                href={`/match/${selectedRole}`}
                className="flex items-center gap-1 text-xs font-semibold text-talent-text hover:text-emerald-400 transition-colors"
              >
                <span>Launch Pool</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Employee Talent Directory Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-talent-text">
              Internal Talent Directory
            </h2>
            <p className="text-xs text-talent-muted">
              Profiles with explicit CV skills vs. AI-inferred production competencies
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-talent-border bg-talent-card shadow-card-elevated">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-talent-border bg-talent-surface text-talent-muted font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Candidate / ID</th>
                  <th className="px-6 py-3.5">Explicit Skills</th>
                  <th className="px-6 py-3.5">AI-Inferred Latent Skills</th>
                  <th className="px-6 py-3.5">Velocity</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-talent-border/70">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-talent-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-talent-text">{emp.hidden?.name}</div>
                      <div className="font-mono text-[11px] text-talent-muted">
                        {emp.id} • {emp.hidden?.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {emp.explicit_skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="rounded bg-talent-surface px-2 py-0.5 text-[11px] text-talent-subtext border border-talent-border"
                          >
                            {skill}
                          </span>
                        ))}
                        {emp.explicit_skills.length > 3 && (
                          <span className="text-[10px] text-talent-muted self-center">
                            +{emp.explicit_skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex flex-wrap gap-1">
                        {emp.inferred_skills.slice(0, 2).map((skill, i) => (
                          <span
                            key={i}
                            className="rounded bg-talent-teal/10 px-2 py-0.5 text-[11px] font-medium text-talent-teal border border-talent-teal/20"
                          >
                            ✨ {skill}
                          </span>
                        ))}
                        {emp.inferred_skills.length > 2 && (
                          <span className="text-[10px] text-talent-teal/80 self-center font-mono">
                            +{emp.inferred_skills.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <div className="flex items-center gap-1.5 text-talent-text font-bold">
                        <TrendingUp className="h-3.5 w-3.5 text-talent-purple" />
                        <span>{Math.round((emp.learning_velocity || 0.85) * 100)}%</span>
                      </div>
                      <span className="text-[10px] text-talent-muted">Recency: {Math.round((emp.recency_score || 0.9) * 100)}%</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/employee/${emp.id}`}
                          className="rounded-md border border-talent-teal/30 bg-talent-teal/10 px-2.5 py-1 text-[11px] font-semibold text-talent-teal hover:bg-talent-teal hover:text-talent-bg transition-colors"
                        >
                          Detective
                        </Link>
                        <Link
                          href={`/roadmap/${emp.id}/${selectedRole}`}
                          className="rounded-md border border-talent-purple/30 bg-talent-purple/10 px-2.5 py-1 text-[11px] font-semibold text-talent-purple hover:bg-talent-purple hover:text-talent-bg transition-colors"
                        >
                          GPS
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Target Roles Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-talent-text">
              Target Mobility Roles
            </h2>
            <p className="text-xs text-talent-muted">
              Select an open role to run real-time blind matching against all indexed internal talent
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`flex flex-col justify-between rounded-xl border p-6 transition-all ${
                selectedRole === role.id
                  ? 'border-talent-teal bg-talent-card shadow-glow-teal'
                  : 'border-talent-border bg-talent-card hover:border-talent-border-highlight'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded bg-talent-surface px-2 py-0.5 font-mono text-[10px] uppercase text-talent-muted border border-talent-border">
                      {role.department}
                    </span>
                    <h3 className="mt-2 font-bold text-talent-text text-base">{role.title}</h3>
                  </div>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-talent-subtext line-clamp-2">
                  {role.description}
                </p>

                <div className="mt-4">
                  <div className="text-[10px] font-mono text-talent-muted uppercase mb-1.5">
                    Required Competencies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.required_skills.slice(0, 3).map((req, i) => (
                      <span
                        key={i}
                        className="rounded bg-talent-surface px-2 py-0.5 text-[10px] text-talent-subtext border border-talent-border"
                      >
                        {req}
                      </span>
                    ))}
                    {role.required_skills.length > 3 && (
                      <span className="text-[10px] text-talent-muted self-center">
                        +{role.required_skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-talent-border flex items-center justify-between">
                <button
                  onClick={() => setSelectedRole(role.id)}
                  className={`text-xs font-mono font-semibold ${selectedRole === role.id ? 'text-talent-teal' : 'text-talent-muted hover:text-talent-text'}`}
                >
                  {selectedRole === role.id ? '✓ Selected' : 'Set Active'}
                </button>
                <Link
                  href={`/match/${role.id}`}
                  className="flex items-center gap-1 rounded-lg bg-talent-surface border border-talent-teal/40 px-3 py-1.5 text-xs font-semibold text-talent-teal hover:bg-talent-teal hover:text-talent-bg transition-colors"
                >
                  <span>Match Pool</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
