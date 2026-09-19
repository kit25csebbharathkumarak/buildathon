'use client';

import React, { useState } from 'react';
import PitchCard from './PitchCard';
import {
  ShieldCheck,
  GitCompare,
  Download,
  Filter,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  Scale,
  Award,
} from 'lucide-react';

export default function BlindMatchWorkspace({ initialCandidates, role, roles }) {
  const [candidates, setCandidates] = useState(initialCandidates || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [comparedCandidates, setComparedCandidates] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [passedIds, setPassedIds] = useState(new Set());

  // Filter candidates
  const filteredCandidates = candidates.filter((cand) => {
    if (passedIds.has(cand.id)) return false;
    if (cand.score < minScore) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = cand.id.toLowerCase().includes(q);
      const pitchMatch = (cand.pitch || '').toLowerCase().includes(q);
      const skillsMatch = (cand.explicit_skills || [])
        .concat(cand.inferred_skills || [])
        .some((s) => (s.name || s).toLowerCase().includes(q));
      return idMatch || pitchMatch || skillsMatch;
    }
    return true;
  });

  // Toggle Compare
  const handleToggleCompare = (candidate) => {
    setComparedCandidates((prev) => {
      const exists = prev.some((c) => c.id === candidate.id);
      if (exists) {
        return prev.filter((c) => c.id !== candidate.id);
      }
      if (prev.length >= 2) {
        return [prev[1], candidate];
      }
      return [...prev, candidate];
    });
  };

  // Pass candidate
  const handlePass = (id) => {
    setPassedIds((prev) => new Set([...prev, id]));
  };

  // Export Shortlist
  const handleExportShortlist = () => {
    const exportData = {
      role: {
        id: role.id,
        title: role.title,
        department: role.department,
      },
      exported_at: new Date().toISOString(),
      candidates: filteredCandidates.map((c) => ({
        id: c.id,
        anonymous_label: c.anonymous_label,
        match_score: c.score,
        breakdown: c.breakdown,
        pitch: c.pitch,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talentlens-shortlist-${role.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-talent-border bg-talent-card p-4 shadow-card-elevated">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-talent-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by skill, telemetry keyword..."
              className="w-full rounded-xl border border-talent-border bg-talent-surface pl-9 pr-3 py-1.5 text-xs text-talent-text focus:outline-none focus:border-talent-teal"
            />
          </div>

          {/* Min Score Threshold Slider */}
          <div className="flex items-center gap-2 text-xs font-mono text-talent-muted bg-talent-surface px-3 py-1.5 rounded-xl border border-talent-border">
            <Filter className="h-3.5 w-3.5 text-talent-teal" />
            <span>Min Score:</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-20 accent-teal-500 cursor-pointer"
            />
            <span className="font-bold text-talent-teal w-8">{minScore}%</span>
          </div>
        </div>

        {/* Action Buttons: Compare Trigger & Export */}
        <div className="flex items-center gap-2">
          {comparedCandidates.length === 2 && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-talent-teal to-teal-400 px-3.5 py-1.5 text-xs font-mono font-bold text-talent-bg shadow-glow-teal hover-lift transition-all"
            >
              <GitCompare className="h-4 w-4" />
              <span>Compare (2 Selected)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportShortlist}
            className="flex items-center gap-1.5 rounded-xl border border-talent-border bg-talent-surface px-3.5 py-1.5 text-xs font-mono font-semibold text-talent-text hover:border-talent-teal/50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-talent-teal" />
            <span>Export Shortlist</span>
          </button>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCandidates.map((candidate) => (
          <PitchCard
            key={candidate.id}
            candidate={candidate}
            roleId={role.id}
            roleTitle={role.title}
            isCompared={comparedCandidates.some((c) => c.id === candidate.id)}
            onToggleCompare={handleToggleCompare}
            onPass={handlePass}
          />
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-16 border border-dashed border-talent-border rounded-2xl bg-talent-card p-8">
          <ShieldCheck className="h-10 w-10 text-talent-muted mx-auto mb-2" />
          <p className="text-sm font-bold text-talent-text">No Candidates Match Active Filters</p>
          <p className="text-xs text-talent-muted mt-1">Try lowering the minimum score or clearing search terms.</p>
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {isCompareModalOpen && comparedCandidates.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-talent-bg/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-2xl border border-talent-border bg-talent-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-talent-border pb-4">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-talent-teal" />
                <h3 className="text-lg font-bold text-talent-text">Side-by-Side Candidate Evaluation</h3>
                <span className="rounded bg-talent-surface px-2 py-0.5 font-mono text-xs text-talent-muted border border-talent-border">
                  {role.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1 rounded-lg text-talent-muted hover:text-talent-text hover:bg-talent-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-6">
              {comparedCandidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  className="rounded-xl border border-talent-border bg-talent-surface p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-talent-teal">
                        Candidate #{cand.id.replace('emp-', '')}
                      </span>
                      <div className="text-[10px] text-talent-muted">Anonymous Blind Dossier</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black font-mono text-talent-teal">
                        {cand.score}%
                      </span>
                      <span className="text-[10px] font-mono text-talent-muted uppercase">
                        Composite Match
                      </span>
                    </div>
                  </div>

                  {/* 4-Part Formula Breakdown Comparison */}
                  <div className="space-y-2 text-xs font-mono border-t border-b border-talent-border py-3">
                    <div className="flex justify-between">
                      <span className="text-talent-muted">Explicit Coverage:</span>
                      <span className="text-talent-teal font-bold">
                        {cand.breakdown?.weightedBreakdown?.explicit || Math.round(cand.breakdown?.explicitMatch * 40)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-talent-muted">Transferable Fit:</span>
                      <span className="text-talent-purple font-bold">
                        {cand.breakdown?.weightedBreakdown?.transferable || Math.round(cand.breakdown?.transferableMatch * 30)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-talent-muted">Recency Decay:</span>
                      <span className="text-talent-text font-bold">
                        {cand.breakdown?.weightedBreakdown?.recency || Math.round(cand.breakdown?.recencyScore * 20)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-talent-muted">Learning Velocity:</span>
                      <span className="text-amber-400 font-bold">
                        {cand.breakdown?.weightedBreakdown?.velocity || Math.round(cand.breakdown?.learningVelocity * 10)}%
                      </span>
                    </div>
                  </div>

                  {/* Pitch Summary */}
                  <div>
                    <div className="text-[10px] font-mono uppercase text-talent-muted font-bold mb-1">
                      Algorithmic Synthesis
                    </div>
                    <p className="text-xs text-talent-subtext leading-relaxed italic bg-talent-card p-3 rounded-lg border border-talent-border">
                      &ldquo;{cand.pitch}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-talent-border pt-4">
              <div className="text-xs text-talent-muted font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-talent-teal" />
                <span>Zero Demographic Attributes Exposed Under Any Circumstances</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="rounded-xl bg-talent-surface border border-talent-border px-4 py-1.5 text-xs font-semibold text-talent-text hover:bg-talent-card"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
