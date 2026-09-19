'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  Star,
  Send,
  XCircle,
  CheckCircle2,
  GitCompare,
} from 'lucide-react';

/**
 * Renders an anonymized candidate pitch card with pure weighted telemetry breakdown,
 * shortlist management, identity reveal request workflow, and side-by-side compare selection.
 */
export default function PitchCard({
  candidate,
  roleId,
  roleTitle = 'Target Role',
  isCompared = false,
  onToggleCompare,
  onPass,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [isLoadingIdentity, setIsLoadingIdentity] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [revealRequested, setRevealRequested] = useState(false);
  const [isRequestingReveal, setIsRequestingReveal] = useState(false);

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

  const handleToggleShortlist = async () => {
    try {
      const nextState = !isShortlisted;
      setIsShortlisted(nextState);
      await fetch('/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: nextState ? 'add' : 'remove',
          candidateId: candidate.id,
          roleId: roleId || 'role_distributed_systems',
        }),
      });
    } catch (err) {
      console.error('Shortlist update error:', err);
    }
  };

  const handleRequestRevealConsent = async () => {
    setIsRequestingReveal(true);
    try {
      const res = await fetch('/api/reveal-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          roleId: roleId || 'role_distributed_systems',
          roleTitle: roleTitle,
          note: `Manager shortlisted candidate #${candidate.id.replace('emp-', '')} based on top match score (${score}%).`,
        }),
      });
      if (res.ok) {
        setRevealRequested(true);
      }
    } catch (err) {
      console.error('Failed to request reveal:', err);
    } finally {
      setIsRequestingReveal(false);
    }
  };

  return (
    <div
      className={`group flex flex-col justify-between rounded-xl border bg-talent-card p-5 sm:p-6 shadow-card-elevated hover-lift transition-all duration-200 ${
        isCompared
          ? 'border-talent-teal ring-2 ring-talent-teal/30 bg-talent-teal/5'
          : 'border-talent-border hover:border-talent-border-highlight'
      }`}
    >
      {/* Top Controls: Compare Checkbox, Shortlist, Pass */}
      <div className="flex items-center justify-between border-b border-talent-border/60 pb-3 mb-4 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer font-mono text-[11px] text-talent-muted hover:text-talent-teal">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={() => onToggleCompare && onToggleCompare(candidate)}
            className="rounded border-talent-border bg-talent-surface text-talent-teal focus:ring-talent-teal focus:ring-offset-0 h-3.5 w-3.5"
          />
          <span className="flex items-center gap-1">
            <GitCompare className="h-3 w-3" />
            <span>Compare</span>
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleShortlist}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] font-bold transition-colors ${
              isShortlisted
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-talent-surface text-talent-muted hover:text-talent-text border border-talent-border'
            }`}
            title="Add to manager shortlist"
          >
            <Star className={`h-3 w-3 ${isShortlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
          </button>

          {onPass && (
            <button
              type="button"
              onClick={() => onPass(candidate.id)}
              className="p-1 rounded-lg text-talent-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Pass candidate"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Top Header: Responsive Layout to Avoid Crowding */}
      <div>
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-talent-surface px-2 py-0.5 font-mono text-xs text-talent-muted border border-talent-border">
                {candidate.id}
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-talent-teal/10 px-2 py-0.5 text-[11px] font-medium text-talent-teal border border-talent-teal/20">
                <ShieldCheck className="h-3 w-3 flex-shrink-0" />
                <span>Blind Profile</span>
              </span>
            </div>

            {/* Smooth Animated Reveal Container (Crossfade / Slide) */}
            <div className="mt-3 min-h-[44px] flex flex-col justify-center overflow-hidden">
              {isRevealed && identity ? (
                <div key="revealed" className="animate-revealSlide">
                  <h3 className="text-base sm:text-lg font-bold text-talent-text truncate">
                    {identity.name}
                  </h3>
                  <p className="text-xs text-talent-teal font-medium truncate">
                    {identity.title} • {identity.age} yrs old
                  </p>
                </div>
              ) : (
                <div key="anonymized" className="animate-fadeIn">
                  <h3 className="text-base sm:text-lg font-bold text-talent-text">
                    Candidate Profile <span className="font-mono text-talent-subtext">#{candidate.id.replace('emp-', '')}</span>
                  </h3>
                  <p className="text-xs text-talent-muted truncate">
                    Identity concealed to eliminate unconscious bias
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Score Badge: Preserved Minimum Width */}
          <div className="flex flex-col items-end flex-shrink-0 pl-2">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-talent-teal font-mono">
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
        <div className="mt-4 rounded-lg bg-talent-surface/80 p-4 border-l-2 border-talent-purple transition-colors">
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
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-talent-border pt-4">
        <div className="flex items-center gap-2">
          {revealRequested ? (
            <span className="flex items-center gap-1 rounded bg-teal-500/15 px-2.5 py-1 text-[11px] font-mono text-talent-teal border border-talent-teal/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Consent Dispatched</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRequestRevealConsent}
              disabled={isRequestingReveal}
              className="flex items-center gap-1 rounded-lg border border-talent-purple/30 bg-talent-purple/10 px-2.5 py-1 text-xs font-mono font-semibold text-talent-purple hover:bg-talent-purple/20 transition-all"
              title="Send identity reveal request to candidate inbox"
            >
              <Send className="h-3 w-3" />
              <span>{isRequestingReveal ? 'Sending...' : 'Request Reveal'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleReveal}
            disabled={isLoadingIdentity}
            aria-label={isRevealed ? `Conceal candidate ${candidate.id} identity` : `Reveal candidate ${candidate.id} identity`}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal transition-all ${
              isRevealed
                ? 'bg-talent-surface text-talent-subtext border border-talent-border hover:text-talent-text'
                : 'bg-talent-card text-talent-muted border border-talent-border hover:text-talent-text hover:border-talent-teal/40'
            }`}
          >
            {isLoadingIdentity ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : isRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Conceal</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Direct Reveal</span>
              </>
            )}
          </button>
        </div>

        <Link
          href={`/roadmap/${candidate.id}/${roleId || 'role-dist-arch'}`}
          className="flex items-center gap-1 text-xs font-medium text-talent-teal hover:text-talent-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal rounded px-1.5 py-0.5 transition-colors"
        >
          <span>Career GPS</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
