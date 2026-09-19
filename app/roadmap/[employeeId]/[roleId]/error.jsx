'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, ArrowLeft, Compass } from 'lucide-react';

/**
 * Error boundary component for Career GPS roadmap page providing graceful failure recovery.
 * @param {Object} props - Error properties.
 * @param {Error & { digest?: string }} props.error - The thrown error object.
 * @param {() => void} props.reset - Callback to retry rendering the route segment.
 * @returns {JSX.Element}
 */
export default function RoadmapError({ error, reset }) {
  useEffect(() => {
    console.error('Career GPS Roadmap Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-talent-card p-8 text-center shadow-card-elevated">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/30 mb-4">
        <Compass className="h-7 w-7 text-red-400" />
      </div>

      <h2 className="text-xl font-bold text-talent-text">
        Unable to Generate Career GPS Roadmap
      </h2>

      <p className="mt-2 max-w-md text-xs leading-relaxed text-talent-muted">
        The specified candidate profile or target role could not be located in internal telemetry records.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-lg bg-talent-surface p-3 font-mono text-[11px] text-red-400/90 border border-red-500/20">
          {error.message}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-lg bg-talent-purple px-4 py-2 text-xs font-semibold text-talent-bg shadow-glow-purple hover:opacity-90 transition-all hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-purple"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-talent-border bg-talent-surface px-4 py-2 text-xs font-semibold text-talent-subtext hover:text-talent-text transition-colors hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talent-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
