import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEmployeeById, getAllRoles } from '../../../lib/db/queries';
import LiveExtractionFeed from '../../../components/LiveExtractionFeed';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Sparkles,
  TrendingUp,
  FileCode2,
  Compass,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * Employee Profile view rendering work telemetry, explicit/inferred skills, and the LiveExtractionFeed.
 * Queries directly from SQLite relational tables.
 * @param {Object} props - Page properties.
 * @param {{id: string}} props.params - Dynamic route parameters.
 * @returns {JSX.Element}
 */
const getSkillName = (s) => (typeof s === 'object' && s !== null ? (s.name || s.skill || '') : String(s || ''));

export default function EmployeePage({ params }) {
  const employee = getEmployeeById(params.id) || getEmployeeById('emp-001') || getEmployeeById('emp-101');

  if (!employee) {
    notFound();
  }

  const roles = getAllRoles();
  const defaultRole = roles[0]?.id || 'role-dist-arch';

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-talent-muted hover:text-talent-teal transition-colors rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/roadmap/${employee.id}/${defaultRole}`}
            className="flex items-center gap-1.5 rounded-lg border border-talent-purple/40 bg-talent-purple/10 px-3 py-1.5 text-xs font-semibold text-talent-purple hover:bg-talent-purple hover:text-talent-bg transition-colors hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-purple"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Launch Career GPS</span>
          </Link>
          <Link
            href={`/match/${defaultRole}`}
            className="flex items-center gap-1.5 rounded-lg border border-talent-teal/40 bg-talent-teal/10 px-3 py-1.5 text-xs font-semibold text-talent-teal hover:bg-talent-teal hover:text-talent-bg transition-colors hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Blind Match Pool</span>
          </Link>
        </div>
      </div>

      {/* Employee Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-talent-border bg-talent-card p-6 sm:p-8 shadow-card-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded bg-talent-surface px-2.5 py-1 font-mono text-xs text-talent-muted border border-talent-border">
                {employee.id}
              </span>
              <span className="rounded bg-talent-teal/10 px-2.5 py-1 font-mono text-xs font-medium text-talent-teal border border-talent-teal/20">
                Active Telemetry Stream
              </span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-black text-talent-text">
              {employee.hidden?.name}
            </h1>
            <p className="mt-1 text-sm text-talent-subtext flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-talent-muted" />
              <span>{employee.hidden?.title}</span>
              <span>•</span>
              <span>Age {employee.hidden?.age}</span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-talent-border pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="flex items-center gap-1 text-lg sm:text-xl font-bold font-mono text-talent-purple">
                <TrendingUp className="h-4 w-4" />
                <span>{Math.round((employee.learning_velocity || 0.85) * 100)}%</span>
              </div>
              <div className="text-[11px] text-talent-muted">Learning Velocity</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-lg sm:text-xl font-bold font-mono text-talent-teal">
                <Zap className="h-4 w-4" />
                <span>{Math.round((employee.recency_score || 0.9) * 100)}%</span>
              </div>
              <div className="text-[11px] text-talent-muted">Recency Score</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold font-mono text-talent-text">
                {employee.raw_logs?.length || 0}
              </div>
              <div className="text-[11px] text-talent-muted">Work Logs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Skills & Raw Telemetry */}
        <div className="lg:col-span-6 space-y-6">
          {/* Inferred Skills Card - Elevated Prominence ("AI Found This" Moment) */}
          <div className="relative overflow-hidden rounded-xl border-2 border-talent-teal/60 bg-gradient-to-br from-talent-teal/15 via-talent-card to-talent-card p-6 shadow-glow-teal hover-lift">
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-talent-teal/10 blur-2xl" />
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-talent-teal/20 text-talent-teal border border-talent-teal/30">
                  <Sparkles className="h-4 w-4 text-talent-teal" />
                </div>
                <h2 className="text-sm font-bold font-mono tracking-wide text-talent-text uppercase">
                  AI-Inferred Latent Skills ({employee.inferred_skills?.length || 0})
                </h2>
              </div>
              <span className="rounded-full bg-talent-teal/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-talent-teal border border-talent-teal/40 uppercase tracking-wider">
                AI Uncovered
              </span>
            </div>
            <p className="text-xs text-talent-muted mb-4 leading-relaxed">
              Uncovered by NLP extraction from unstructured telemetry (postmortems, PR reviews, RFCs) — invisible in standard resumes.
            </p>
            <div className="flex flex-wrap gap-2">
              {employee.inferred_skills?.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-lg border border-talent-teal/50 bg-talent-teal/20 px-3 py-1.5 text-xs font-semibold text-talent-teal shadow-glow-teal hover:bg-talent-teal/30 transition-colors"
                >
                  <span className="text-[11px]">✨</span>
                  <span>{getSkillName(skill)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Skills Card */}
          <div className="rounded-xl border border-talent-border bg-talent-card p-6 shadow-card-elevated">
            <div className="flex items-center gap-2 mb-3">
              <FileCode2 className="h-4 w-4 text-talent-muted" />
              <h2 className="text-sm font-bold font-mono tracking-wide text-talent-text uppercase">
                Self-Reported Explicit Skills ({employee.explicit_skills?.length || 0})
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {employee.explicit_skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-talent-border bg-talent-surface px-2.5 py-1 text-xs text-talent-subtext"
                >
                  {getSkillName(skill)}
                </span>
              ))}
            </div>
          </div>

          {/* Raw Work Logs Telemetry */}
          <div className="rounded-xl border border-talent-border bg-talent-card p-6 shadow-card-elevated">
            <h2 className="text-sm font-bold font-mono tracking-wide text-talent-text uppercase mb-4">
              Raw Production Telemetry Logs ({employee.raw_logs?.length || 0})
            </h2>
            <div className="space-y-3">
              {employee.raw_logs?.map((log, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-talent-border/70 bg-talent-surface/60 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="rounded bg-talent-card px-2 py-0.5 font-mono text-[10px] font-semibold text-talent-purple border border-talent-purple/30">
                      {log.type}
                    </span>
                    <span className="font-mono text-[10px] text-talent-muted">Entry #{idx + 1}</span>
                  </div>
                  <p className="text-talent-subtext leading-relaxed font-sans">{log.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: LiveExtractionFeed Component */}
        <div className="lg:col-span-6 space-y-6">
          <div className="sticky top-20">
            <LiveExtractionFeed employeeId={employee.id} rawLogs={employee.raw_logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
