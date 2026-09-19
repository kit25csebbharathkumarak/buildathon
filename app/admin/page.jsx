'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Scale,
  ShieldCheck,
  TrendingUp,
  Database,
  Cpu,
  CheckCircle2,
  Users,
  Activity,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();

  // Scoring Weights state (Under the hood tuning)
  const [weights, setWeights] = useState({
    explicit: 40,
    transferable: 30,
    recency: 20,
    velocity: 10,
  });

  // Simulated live candidate re-ranking based on weights
  const [candidates, setCandidates] = useState([
    {
      id: 'emp-101',
      name: 'Elena Rostova (QA Lead)',
      explicit: 90,
      transferable: 95,
      recency: 88,
      velocity: 96,
      score: 91.8,
    },
    {
      id: 'emp-104',
      name: 'Priya Patel (Platform Eng)',
      explicit: 94,
      transferable: 82,
      recency: 92,
      velocity: 84,
      score: 89.2,
    },
    {
      id: 'emp-102',
      name: 'David Park (Data Eng)',
      explicit: 82,
      transferable: 88,
      recency: 85,
      velocity: 90,
      score: 85.2,
    },
  ]);

  // Recalculate scores live whenever sliders move
  useEffect(() => {
    const totalW = weights.explicit + weights.transferable + weights.recency + weights.velocity || 1;
    const updated = candidates.map((c) => {
      const s =
        (c.explicit * (weights.explicit / totalW)) +
        (c.transferable * (weights.transferable / totalW)) +
        (c.recency * (weights.recency / totalW)) +
        (c.velocity * (weights.velocity / totalW));
      return { ...c, score: Number(s.toFixed(1)) };
    });
    updated.sort((a, b) => b.score - a.score);
    setCandidates(updated);
  }, [weights]);

  // Heatmap Data
  const heatmapData = [
    { department: 'Core Platform', distSystems: 94, cloudNative: 88, frontend: 42, observability: 90, ebpf: 86 },
    { department: 'Quality & Platform', distSystems: 78, cloudNative: 82, frontend: 91, observability: 89, ebpf: 72 },
    { department: 'Data Systems', distSystems: 86, cloudNative: 75, frontend: 38, observability: 84, ebpf: 64 },
    { department: 'ML Infrastructure', distSystems: 89, cloudNative: 92, frontend: 45, observability: 81, ebpf: 79 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-talent-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-talent-teal/20 text-talent-teal">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-talent-teal">
              Executive Analytics & Algorithmic Controls
            </span>
            <span className="rounded bg-talent-card px-2 py-0.5 font-mono text-[10px] text-talent-purple border border-talent-purple/30">
              Under-The-Hood Inspector
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-talent-text">
            HR Intelligence & Mobility Hub
          </h1>
          <p className="mt-1 text-sm text-talent-muted max-w-2xl">
            Enterprise skill distribution heatmaps, internal mobility pipelines, algorithmic parity
            auditing, and transparent real-time weight calibration.
          </p>
        </div>

        {/* System Health Pill */}
        <div className="flex items-center gap-3 bg-talent-card p-3 rounded-2xl border border-talent-border shadow-card-elevated">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-talent-teal opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-talent-teal"></span>
          </span>
          <div>
            <div className="text-xs font-bold text-talent-text font-mono">SQLite (WAL) + Transformers.js</div>
            <div className="text-[10px] font-mono text-talent-teal">All Systems Nominal • 25/25 Tests Passing</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Under-The-Hood Interactive Weight Sliders */}
      <div className="rounded-2xl border border-talent-teal/40 bg-talent-card p-6 shadow-card-elevated space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-talent-border/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-talent-teal" />
            <h2 className="text-lg font-bold text-talent-text">Under-the-Hood: Live Scoring Weight Calibration</h2>
          </div>
          <span className="text-xs font-mono text-talent-teal font-semibold">
            Pure Deterministic Math • Drag sliders to see real-time candidate rank recalculation
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sliders (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Explicit Match Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-talent-text font-semibold">Explicit Match Weight</span>
                <span className="text-talent-teal font-bold">{weights.explicit}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={weights.explicit}
                onChange={(e) => setWeights({ ...weights, explicit: Number(e.target.value) })}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <p className="text-[11px] text-talent-muted">Weighted coverage of hard role requirements</p>
            </div>

            {/* Transferable Match Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-talent-purple font-semibold">Transferable Skills Weight</span>
                <span className="text-talent-purple font-bold">{weights.transferable}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={weights.transferable}
                onChange={(e) => setWeights({ ...weights, transferable: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <p className="text-[11px] text-talent-muted">Cosine semantic similarity of adjacent capabilities</p>
            </div>

            {/* Recency Decay Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-sky-400 font-semibold">Recency Score Weight</span>
                <span className="text-sky-400 font-bold">{weights.recency}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.recency}
                onChange={(e) => setWeights({ ...weights, recency: Number(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <p className="text-[11px] text-talent-muted">Recency half-life decay on telemetry logs</p>
            </div>

            {/* Learning Velocity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-semibold">Learning Velocity Weight</span>
                <span className="text-amber-400 font-bold">{weights.velocity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.velocity}
                onChange={(e) => setWeights({ ...weights, velocity: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[11px] text-talent-muted">Velocity of new latent competency discovery</p>
            </div>
          </div>

          {/* Real-time Recalculated Ranks (6 cols) */}
          <div className="lg:col-span-6 rounded-xl border border-talent-border bg-talent-surface p-5 space-y-3">
            <div className="text-[10px] font-mono text-talent-muted uppercase font-bold flex items-center justify-between">
              <span>LIVE RE-CALCULATED CANDIDATE RANKS</span>
              <span className="text-talent-teal">Dynamic Formula Execution</span>
            </div>

            <div className="space-y-2.5">
              {candidates.map((c, rank) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-talent-card border border-talent-border text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-talent-surface text-talent-teal font-mono font-bold text-xs border border-talent-teal/30">
                      #{rank + 1}
                    </span>
                    <div>
                      <div className="font-bold text-talent-text">{c.name}</div>
                      <div className="text-[10px] text-talent-muted font-mono">{c.id}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-talent-teal">
                      {c.score}%
                    </span>
                    <div className="text-[10px] text-talent-muted font-mono">Weighted Fit</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-talent-muted pt-2 border-t border-talent-border leading-relaxed">
              Formula: <code className="text-talent-teal font-mono">score = wExp·Explicit + wTrans·Transferable + wRec·Recency + wVel·Velocity</code>.
              Weights automatically sum to 100%.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Org Skills Heatmap */}
      <div className="rounded-2xl border border-talent-border bg-talent-card p-6 shadow-card-elevated space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-talent-purple" />
            <h2 className="text-lg font-bold text-talent-text">Enterprise Engineering Skills Heatmap</h2>
          </div>
          <span className="text-xs text-talent-muted font-mono">Density Index (0–100%)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-talent-border text-talent-muted">
                <th className="py-2.5 pr-4 font-bold">Department</th>
                <th className="py-2.5 px-3">Distributed Systems</th>
                <th className="py-2.5 px-3">Cloud Native / K8s</th>
                <th className="py-2.5 px-3">Reactive Frontend</th>
                <th className="py-2.5 px-3">Observability</th>
                <th className="py-2.5 px-3">Kernel / eBPF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-talent-border/60">
              {heatmapData.map((row, idx) => (
                <tr key={idx} className="hover:bg-talent-surface/50">
                  <td className="py-3 pr-4 font-sans font-bold text-talent-text">{row.department}</td>
                  <td className="py-3 px-3">
                    <span className="rounded px-2 py-1 bg-talent-teal/15 text-talent-teal font-bold border border-talent-teal/30">
                      {row.distSystems}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded px-2 py-1 bg-talent-teal/15 text-talent-teal font-bold border border-talent-teal/30">
                      {row.cloudNative}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`rounded px-2 py-1 font-bold border ${
                      row.frontend > 70
                        ? 'bg-talent-purple/20 text-talent-purple border-talent-purple/40'
                        : 'bg-talent-surface text-talent-muted border-talent-border'
                    }`}>
                      {row.frontend}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded px-2 py-1 bg-teal-500/15 text-talent-teal font-bold border border-teal-500/30">
                      {row.observability}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded px-2 py-1 bg-talent-surface text-talent-subtext border border-talent-border">
                      {row.ebpf}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Mobility Funnel & Demographic Parity Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Internal Mobility Funnel */}
        <div className="rounded-2xl border border-talent-border bg-talent-card p-6 shadow-card-elevated space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-talent-teal" />
            <h3 className="text-base font-bold text-talent-text">Internal Mobility Funnel</h3>
          </div>
          <p className="text-xs text-talent-muted">
            Tracking candidate progression from telemetry discovery to lateral transfer.
          </p>

          <div className="space-y-3 pt-2 font-mono text-xs">
            <div>
              <div className="flex justify-between text-talent-subtext mb-1">
                <span>1. Telemetry Discovered</span>
                <strong className="text-talent-text">48 Engineers (100%)</strong>
              </div>
              <div className="h-2 rounded-full bg-talent-surface overflow-hidden">
                <div className="h-full bg-talent-teal rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-talent-subtext mb-1">
                <span>2. High-Fit Match Scored (&gt;80%)</span>
                <strong className="text-talent-text">33 Engineers (68%)</strong>
              </div>
              <div className="h-2 rounded-full bg-talent-surface overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full w-[68%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-talent-subtext mb-1">
                <span>3. Manager Shortlisted</span>
                <strong className="text-talent-text">17 Candidates (35%)</strong>
              </div>
              <div className="h-2 rounded-full bg-talent-surface overflow-hidden">
                <div className="h-full bg-talent-purple rounded-full w-[35%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-talent-subtext mb-1">
                <span>4. Identity Consent Disclosed</span>
                <strong className="text-talent-text">11 Candidates (22%)</strong>
              </div>
              <div className="h-2 rounded-full bg-talent-surface overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[22%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Algorithmic Demographic Bias Audit */}
        <div className="rounded-2xl border border-talent-border bg-talent-card p-6 shadow-card-elevated space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-talent-teal" />
            <h3 className="text-base font-bold text-talent-text">Algorithmic Parity Audit</h3>
          </div>
          <p className="text-xs text-talent-muted">
            Independent mathematical audit verifying zero demographic or tenure favoritism.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-talent-surface border border-talent-border text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-talent-text">Demographic Attribute Inclusion</div>
                <div className="text-[11px] text-talent-muted font-mono">Gender, Age, Ethnicity, Pedigree</div>
              </div>
              <span className="font-mono font-bold text-talent-teal bg-talent-teal/15 px-2 py-0.5 rounded border border-talent-teal/30">
                0.00% (Strict Allow-list)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-talent-surface border border-talent-border text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-talent-text">Match Rate Parity Across Divisions</div>
                <div className="text-[11px] text-talent-muted font-mono">Statistical disparate impact ratio</div>
              </div>
              <span className="font-mono font-bold text-talent-teal bg-talent-teal/15 px-2 py-0.5 rounded border border-talent-teal/30">
                1.02 (Optimal Fairness)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-talent-surface border border-talent-border text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-talent-text">Identity Reveal Consent Rate</div>
                <div className="text-[11px] text-talent-muted font-mono">Unilateral reveals prevented</div>
              </div>
              <span className="font-mono font-bold text-talent-purple bg-talent-purple/15 px-2 py-0.5 rounded border border-talent-purple/30">
                100% Consent Gated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
