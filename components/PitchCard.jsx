'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ShieldCheck, Zap, Activity, Award, ArrowUpRight, Loader2 } from 'lucide-react';

/**
 * Renders an anonymized candidate pitch card with pure weighted telemetry breakdown and a secure on-demand identity reveal toggle.
 * @param {Object} props - Component properties.
 * @param {Object} props.candidate - Candidate data with ID, scores, breakdown, and pitch (strictly zero pre-loaded identity fields).
 * @param {string} props.roleId - Associated role ID.
 * @returns {JSX.Element}
 */
export default function PitchCard({ candidate, roleId }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [isLoadingIdentity, setIsLoadingIdentity] = useState(false);

  const score = candidate.score || 85;
  const breakdown = candidate.breakdown || {
    explicitMatch: 0.85,
    transferableMatch: 0.8,
    recencyScore: 0.9,
    learningVelocity: 0.88,
    weightedBreakdown: {
      explicit: 34.0,
      transferable: 24.0,
      recency: 18.0,
      velocity: 8.8,
    },
  };

  const handleToggleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    if (identity) {
      setIsRevealed(true);
      return;
    }

    setIsLoadingIdentity(true);
    try {
      const res = await fetch(`/api/reveal/${candidate.id}`);
      if (res.ok) {
        const data = await res.json();
        setIdentity(data);
        setIsRevealed(true);
      }
    } catch (err) {
      console.error('Failed to reveal identity:', err);
    } finally {
      setIsLoadingIdentity(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-talent-border bg-talent-card p-6 shadow-card-elevated hover:border-talent-border-highlight transition-all duration-300">
      {/* Top Header: Anonymized Identity & Score Gauge */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-talent-surface px-2 py-0.5 font-mono text-xs text-talent-muted border border-talent-border">
                {candidate.id}
              </span>
              <span className="flex items-center gap-1 rounded bg-talent-teal/10 px-2 py-0.5 text-[11px] font-medium text-talent-teal border border-talent-teal/20">
                <ShieldCheck className="h-3 w-3" />
                Blind Profile
              </span>
            </div>

            {/* Revealed Identity or Anonymized Headline */}
            <div className="mt-3">
              {isRevealed && identity ? (
                <div className="animate-fadeIn">
                  <h3 className="text-lg font-bold text-talent-text">
                    {identity.name}
                  </h3>
                  <p className="text-xs text-talent-teal font-medium">
                    {identity.title} • {identity.age} yrs old
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-talent-text">
                    Candidate Profile <span className="font-mono text-talent-subtext">#{candidate.id.replace('emp-', '')}</span>
                  </h3>
                  <p className="text-xs text-talent-muted">
                    Identity concealed to eliminate unconscious bias
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Score Badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black tracking-tight text-talent-teal font-mono">
                {score}
              </span>
              <span className="text-xs font-bold text-talent-muted">%</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-talent-muted font-mono">
              Match Fit
            </span>
          </div>
        </div>

        {/* 3-Sentence Anonymized Pitch */}
        <div className="mt-4 rounded-lg bg-talent-surface/80 p-4 border-l-2 border-talent-purple">
          <p className="font-sans text-xs leading-relaxed text-talent-subtext">
            {candidate.pitch ||
              'Candidate displays high direct capability alignment and transferable domain mastery in distributed platforms. Demonstrating rapid adaptability across production telemetry, their engineering profile proves strong resilience. Recommended for immediate zero-bias talent mobility transition.'}
          </p>
        </div>

        {/* Weighted Scoring Breakdown Telemetry */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-talent-muted">Weighted Telemetry Breakdown</span>
            <span className="text-talent-purple font-semibold">Pure Formula</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Explicit Match (40%) */}
            <div className="rounded-md border border-talent-border/70 bg-talent-surface/50 p-2">
              <div className="flex justify-between items-center text-[10px] text-talent-muted">
                <span>Explicit (40%)</span>
                <span className="font-mono text-talent-teal font-semibold">
                  {breakdown.weightedBreakdown?.explicit || Math.round(breakdown.explicitMatch * 40)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full bg-talent-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-talent-teal rounded-full"
                  style={{ width: `${(breakdown.explicitMatch || 0.8) * 100}%` }}
                />
              </div>
            </div>

            {/* Transferable Match (30%) */}
            <div className="rounded-md border border-talent-border/70 bg-talent-surface/50 p-2">
              <div className="flex justify-between items-center text-[10px] text-talent-muted">
                <span>Transferable (30%)</span>
                <span className="font-mono text-talent-purple font-semibold">
                  {breakdown.weightedBreakdown?.transferable || Math.round(breakdown.transferableMatch * 30)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full bg-talent-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-talent-purple rounded-full"
                  style={{ width: `${(breakdown.transferableMatch || 0.75) * 100}%` }}
                />
              </div>
            </div>

            {/* Recency (20%) */}
            <div className="rounded-md border border-talent-border/70 bg-talent-surface/50 p-2">
              <div className="flex justify-between items-center text-[10px] text-talent-muted">
                <span>Recency (20%)</span>
                <span className="font-mono text-talent-text font-semibold">
                  {breakdown.weightedBreakdown?.recency || Math.round(breakdown.recencyScore * 20)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full bg-talent-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${(breakdown.recencyScore || 0.9) * 100}%` }}
                />
              </div>
            </div>

            {/* Velocity (10%) */}
            <div className="rounded-md border border-talent-border/70 bg-talent-surface/50 p-2">
              <div className="flex justify-between items-center text-[10px] text-talent-muted">
                <span>Velocity (10%)</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {breakdown.weightedBreakdown?.velocity || Math.round(breakdown.learningVelocity * 10)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full bg-talent-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(breakdown.learningVelocity || 0.85) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-talent-border pt-4">
        <button
          onClick={handleToggleReveal}
          disabled={isLoadingIdentity}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            isRevealed
              ? 'bg-talent-surface text-talent-subtext border border-talent-border hover:text-talent-text'
              : 'bg-talent-purple/20 text-talent-purple border border-talent-purple/40 hover:bg-talent-purple/30 shadow-glow-purple'
          }`}
        >
          {isLoadingIdentity ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Fetching Identity...</span>
            </>
          ) : isRevealed ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Conceal Identity</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Reveal Identity</span>
            </>
          )}
        </button>

        <Link
          href={`/roadmap/${candidate.id}/${roleId || 'role-dist-arch'}`}
          className="flex items-center gap-1 text-xs font-medium text-talent-teal hover:text-talent-teal-light transition-colors"
        >
          <span>View Career GPS</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
