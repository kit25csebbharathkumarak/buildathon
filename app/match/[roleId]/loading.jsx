import React from 'react';
import { ShieldCheck, Scale, Sparkles } from 'lucide-react';

/**
 * Skeleton loading state for Blind Matching pool view matching dark editorial UI.
 * @returns {JSX.Element}
 */
export default function MatchLoading() {
  return (
    <div className="space-y-8 pb-16 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-talent-surface" />
        <div className="flex gap-1.5">
          <div className="h-6 w-16 rounded bg-talent-surface" />
          <div className="h-6 w-16 rounded bg-talent-surface" />
          <div className="h-6 w-16 rounded bg-talent-surface" />
        </div>
      </div>

      {/* Target Role & Audit Guarantee Banner Skeleton */}
      <div className="rounded-2xl border border-talent-border bg-talent-card p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 rounded bg-talent-surface" />
              <div className="h-5 w-40 rounded bg-talent-teal/20" />
            </div>
            <div className="h-8 w-72 rounded bg-talent-surface" />
            <div className="h-4 w-full max-w-lg rounded bg-talent-surface/70" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-28 rounded bg-talent-surface" />
              <div className="h-6 w-32 rounded bg-talent-surface" />
              <div className="h-6 w-24 rounded bg-talent-surface" />
            </div>
          </div>

          <div className="h-32 w-full lg:w-72 rounded-xl border border-talent-border bg-talent-surface/60 p-4" />
        </div>
      </div>

      {/* Candidate Grid Skeletons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-64 rounded bg-talent-surface" />
          <div className="h-4 w-40 rounded bg-talent-surface/60" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-talent-border bg-talent-card p-6 space-y-4 shadow-card-elevated"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-talent-surface" />
                  <div className="h-6 w-44 rounded bg-talent-surface" />
                  <div className="h-3 w-48 rounded bg-talent-surface/60" />
                </div>
                <div className="h-10 w-16 rounded bg-talent-teal/15" />
              </div>

              <div className="h-20 w-full rounded-lg bg-talent-surface/80 p-3 border-l-2 border-talent-purple/50" />

              <div className="space-y-2">
                <div className="h-3 w-36 rounded bg-talent-surface" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 rounded bg-talent-surface/50" />
                  <div className="h-12 rounded bg-talent-surface/50" />
                  <div className="h-12 rounded bg-talent-surface/50" />
                  <div className="h-12 rounded bg-talent-surface/50" />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-talent-border">
                <div className="h-7 w-28 rounded bg-talent-surface" />
                <div className="h-4 w-24 rounded bg-talent-surface/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
