import React from 'react';

/**
 * Skeleton loading state for Career GPS SkillTree view matching dark editorial UI.
 * @returns {JSX.Element}
 */
export default function RoadmapLoading() {
  return (
    <div className="space-y-8 pb-16 animate-pulse">
      {/* Top Header & Breadcrumbs Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-44 rounded bg-talent-surface" />
        <div className="flex gap-1.5">
          <div className="h-6 w-16 rounded bg-talent-surface" />
          <div className="h-6 w-16 rounded bg-talent-surface" />
          <div className="h-6 w-16 rounded bg-talent-surface" />
        </div>
      </div>

      {/* Target Role & Candidate Summary Banner Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-talent-border bg-talent-card p-6 sm:p-8">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-talent-purple/30" />
          <div className="h-7 w-52 rounded bg-talent-surface" />
          <div className="h-4 w-40 rounded bg-talent-surface/60" />
          <div className="flex gap-1 pt-2">
            <div className="h-5 w-20 rounded bg-talent-surface" />
            <div className="h-5 w-24 rounded bg-talent-surface" />
            <div className="h-5 w-16 rounded bg-talent-surface" />
          </div>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-talent-border pt-4 md:pt-0 md:pl-6 space-y-2">
          <div className="h-3 w-32 rounded bg-talent-teal/30" />
          <div className="h-7 w-64 rounded bg-talent-surface" />
          <div className="h-4 w-44 rounded bg-talent-surface/60" />
          <div className="h-10 w-full rounded bg-talent-surface/40 pt-1" />
        </div>
      </div>

      {/* SkillTree Canvas Skeleton */}
      <div className="rounded-xl border border-talent-border bg-talent-card p-6 h-[460px] flex flex-col justify-between">
        <div className="flex justify-between items-center border-b border-talent-border pb-4">
          <div className="h-5 w-64 rounded bg-talent-surface" />
          <div className="flex gap-4">
            <div className="h-4 w-20 rounded bg-talent-teal/30" />
            <div className="h-4 w-20 rounded bg-talent-purple/30" />
            <div className="h-4 w-24 rounded bg-amber-500/30" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 my-auto">
          <div className="space-y-4">
            <div className="h-20 rounded-xl border border-talent-teal/30 bg-talent-surface/50" />
            <div className="h-20 rounded-xl border border-talent-teal/30 bg-talent-surface/50" />
          </div>
          <div className="space-y-4 my-auto">
            <div className="h-20 rounded-xl border border-talent-purple/30 bg-talent-surface/50" />
            <div className="h-20 rounded-xl border border-talent-purple/30 bg-talent-surface/50" />
          </div>
          <div className="space-y-4">
            <div className="h-20 rounded-xl border border-amber-500/20 bg-talent-surface/50" />
            <div className="h-20 rounded-xl border border-amber-500/20 bg-talent-surface/50" />
          </div>
          <div className="my-auto">
            <div className="h-24 rounded-xl border border-talent-border bg-talent-surface/70" />
          </div>
        </div>

        <div className="h-3 w-48 rounded bg-talent-surface/40" />
      </div>

      {/* Milestone Tri-column Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((col) => (
          <div key={col} className="rounded-xl border border-talent-border bg-talent-card p-6 space-y-3">
            <div className="h-4 w-36 rounded bg-talent-surface" />
            <div className="h-3 w-52 rounded bg-talent-surface/50" />
            <div className="space-y-2 pt-2">
              <div className="h-10 rounded-lg bg-talent-surface/60" />
              <div className="h-10 rounded-lg bg-talent-surface/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
