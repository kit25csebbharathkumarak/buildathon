'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  BookOpen,
  ExternalLink,
  X,
  Check,
  Zap,
} from 'lucide-react';

/**
 * Renders a branching career progression skill tree with interactive node drawer,
 * learning resources, time estimates, and node completion tracking.
 */
export default function SkillTree({
  nodes = [],
  edges = [],
  targetRole = 'Target Role',
  candidateId = 'emp-101',
  roleId = 'role_distributed_systems',
  initialCompletedNodeIds = [],
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [completedNodeIds, setCompletedNodeIds] = useState(new Set(initialCompletedNodeIds));
  const [isToggling, setIsToggling] = useState(false);

  // Compute hierarchical layout: partition nodes into columns (levels)
  const layout = useMemo(() => {
    if (!nodes || nodes.length === 0) return { positionedNodes: [], computedEdges: [], width: 900, height: 420 };

    // Group nodes by status or role
    const col0 = nodes.filter((n) => n.status === 'acquired' || completedNodeIds.has(n.id));
    const col1 = nodes.filter((n) => n.status === 'in_progress' && !completedNodeIds.has(n.id));
    const col2 = nodes.filter((n) => n.status === 'recommended' && n.id !== 'target-role-node' && !completedNodeIds.has(n.id));
    const col3 = nodes.filter((n) => n.id === 'target-role-node');

    // Ensure all nodes have a column
    const columns = [col0, col1, col2, col3].map((col) => (col.length > 0 ? col : []));

    const accounted = new Set([...col0, ...col1, ...col2, ...col3].map((n) => n.id));
    nodes.forEach((n) => {
      if (!accounted.has(n.id)) {
        columns[1].push(n);
      }
    });

    const colWidth = 260;
    const startX = 40;
    const nodeWidth = 200;
    const nodeHeight = 84;
    const canvasHeight = Math.max(480, Math.max(...columns.map((c) => c.length)) * 120 + 80);
    const canvasWidth = Math.max(920, columns.filter((c) => c.length > 0).length * colWidth + 80);

    const posMap = new Map();
    const positionedNodes = [];

    columns.forEach((col, colIdx) => {
      const totalInCol = col.length;
      col.forEach((node, rowIdx) => {
        const x = startX + colIdx * colWidth;
        const spacing = canvasHeight / (totalInCol + 1);
        const y = spacing * (rowIdx + 1) - nodeHeight / 2;

        const isCompleted = completedNodeIds.has(node.id) || node.status === 'acquired';
        const effectiveStatus = isCompleted ? 'acquired' : node.status;

        const pos = { ...node, effectiveStatus, x, y, width: nodeWidth, height: nodeHeight, colIdx };
        posMap.set(node.id, pos);
        positionedNodes.push(pos);
      });
    });

    // Compute SVG cubic bezier paths for edges
    const computedEdges = (edges || [])
      .map((edge, idx) => {
        const source = posMap.get(edge.from);
        const target = posMap.get(edge.to);
        if (!source || !target) return null;

        const x1 = source.x + source.width;
        const y1 = source.y + source.height / 2;
        const x2 = target.x;
        const y2 = target.y + target.height / 2;
        const dx = Math.max(40, (x2 - x1) / 2);

        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
        const isAcquiredEdge = source.effectiveStatus === 'acquired' && target.effectiveStatus === 'acquired';
        const isInProgressEdge = source.effectiveStatus === 'acquired' && target.effectiveStatus === 'in_progress';

        return {
          id: `edge-${idx}`,
          d,
          isAcquiredEdge,
          isInProgressEdge,
          fromCol: source.colIdx ?? 0,
        };
      })
      .filter(Boolean);

    return { positionedNodes, computedEdges, width: canvasWidth, height: canvasHeight };
  }, [nodes, edges, completedNodeIds]);

  const totalSkillNodes = nodes.filter((n) => n.id !== 'target-role-node').length || 1;
  const completedCount = nodes.filter(
    (n) => n.id !== 'target-role-node' && (n.status === 'acquired' || completedNodeIds.has(n.id))
  ).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalSkillNodes) * 100));

  const handleToggleNodeComplete = async (node) => {
    setIsToggling(true);
    try {
      const res = await fetch('/api/roadmap/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          roleId,
          nodeId: node.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedNodeIds(new Set(data.completed_node_ids));
      }
    } catch (err) {
      console.error('Error updating roadmap node progress:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'acquired':
        return {
          border: 'border-talent-teal/70 hover:border-talent-teal',
          bg: 'bg-talent-card/90',
          shadow: 'shadow-glow-teal',
          icon: <CheckCircle2 className="h-4 w-4 text-talent-teal" />,
          label: 'Acquired Skill',
          badgeClass: 'bg-talent-teal/20 text-talent-teal border-talent-teal/30',
        };
      case 'in_progress':
        return {
          border: 'border-talent-purple/70 hover:border-talent-purple',
          bg: 'bg-talent-card/90',
          shadow: 'shadow-glow-purple',
          icon: <Clock className="h-4 w-4 text-talent-purple animate-pulse" />,
          label: 'In Progress',
          badgeClass: 'bg-talent-purple/20 text-talent-purple border-talent-purple/30',
        };
      case 'target':
        return {
          border: 'border-talent-teal bg-talent-teal/10',
          bg: 'bg-talent-teal/15',
          shadow: 'shadow-glow-teal',
          icon: <Award className="h-4 w-4 text-talent-teal" />,
          label: 'Target Mandate',
          badgeClass: 'bg-talent-teal text-talent-bg font-bold border-transparent',
        };
      case 'recommended':
      default:
        return {
          border: 'border-talent-border hover:border-talent-teal/40',
          bg: 'bg-talent-surface/80',
          shadow: '',
          icon: <Sparkles className="h-4 w-4 text-amber-400" />,
          label: 'Recommended Bridge',
          badgeClass: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
        };
    }
  };

  // Node curriculum resources helper
  const getNodeResources = (label) => {
    return [
      {
        title: `${label} — Architecture Deep Dive & Reference Specification`,
        source: 'Engineering RFC & Docs',
        time: '6 hours',
      },
      {
        title: `Production Troubleshooting & Failure Mitigations in ${label}`,
        source: 'SEV Incident Postmortems',
        time: '8 hours',
      },
    ];
  };

  return (
    <div className="relative rounded-2xl border border-talent-border bg-talent-card shadow-card-elevated overflow-hidden">
      {/* Top Header with Live Readiness Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-talent-border bg-talent-surface/40">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-talent-text tracking-wide uppercase font-mono">
              Career GPS Directed Progression Graph
            </h3>
            <span className="rounded bg-talent-teal/10 px-2 py-0.5 text-[10px] font-mono text-talent-teal border border-talent-teal/20">
              Interactive Nodes
            </span>
          </div>
          <p className="text-xs text-talent-muted mt-0.5">
            Bridging competencies to <span className="text-talent-teal font-semibold">{targetRole}</span>
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-talent-muted uppercase">Readiness Progress</div>
            <div className="text-xs font-mono font-bold text-talent-teal">
              {completedCount} / {totalSkillNodes} Skills ({progressPercent}%)
            </div>
          </div>
          <div className="w-28 sm:w-36 h-2 rounded-full bg-talent-surface border border-talent-border overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-talent-teal to-teal-400 rounded-full transition-all duration-500 shadow-glow-teal"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between px-5 py-2.5 border-b border-talent-border/50 bg-talent-surface/20 text-xs text-talent-muted">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-talent-teal shadow-glow-teal" />
            <span className="font-mono text-[11px]">Acquired / Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-talent-purple shadow-glow-purple" />
            <span className="font-mono text-[11px]">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="font-mono text-[11px]">Recommended Bridge</span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-talent-teal">
          💡 Click any skill node to view curriculum & mark complete
        </span>
      </div>

      {/* Graph Canvas */}
      <div className="relative w-full overflow-hidden">
        <div className="overflow-x-auto p-4 scrollbar-thin overscroll-x-contain">
          <div
            className="relative min-h-[460px]"
            style={{ width: `${layout.width}px`, height: `${layout.height}px` }}
          >
            {/* SVG Connector Lines */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              style={{ width: layout.width, height: layout.height }}
            >
              <defs>
                <linearGradient id="tealToPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1D9E75" />
                  <stop offset="100%" stopColor="#7F77DD" />
                </linearGradient>
              </defs>
              {layout.computedEdges.map((edge) => {
                const strokeColor = edge.isAcquiredEdge ? '#1D9E75' : '#4A5568';
                return (
                  <path
                    key={edge.id}
                    d={edge.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={edge.isAcquiredEdge ? 3 : 2}
                    strokeOpacity={0.85}
                    style={{
                      strokeDasharray: edge.isAcquiredEdge ? 'none' : '6 4',
                    }}
                  />
                );
              })}
            </svg>

            {/* Positioned Clickable Nodes */}
            {layout.positionedNodes.map((node) => {
              const styling = getStatusBadge(node.effectiveStatus);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`absolute flex flex-col justify-between rounded-xl border p-3 transition-all duration-200 ${styling.border} ${styling.bg} ${styling.shadow} hover:scale-105 cursor-pointer backdrop-blur-sm ${
                    isSelected ? 'ring-2 ring-talent-teal' : ''
                  }`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                  }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold border ${styling.badgeClass}`}>
                      {styling.label}
                    </span>
                    {styling.icon}
                  </div>
                  <div className="font-sans text-xs font-bold text-talent-text line-clamp-2 leading-tight">
                    {node.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Node Details Slide-Out Drawer / Modal */}
      {selectedNode && (
        <div className="border-t border-talent-border bg-talent-surface/90 p-6 animate-fadeIn">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-talent-teal font-bold uppercase">
                  Skill Competency Dossier
                </span>
                <span className="rounded bg-talent-card px-2 py-0.5 font-mono text-[10px] text-talent-purple border border-talent-purple/30">
                  {selectedNode.effectiveStatus === 'acquired' ? 'Acquired / Completed' : 'Bridging Required'}
                </span>
              </div>
              <h4 className="text-xl font-black text-talent-text">{selectedNode.label}</h4>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-lg text-talent-muted hover:text-talent-text hover:bg-talent-card"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Why It Matters */}
            <div className="md:col-span-2 space-y-3">
              <div className="rounded-xl bg-talent-card p-4 border border-talent-border space-y-2">
                <div className="text-[10px] font-mono text-talent-muted uppercase font-bold">
                  WHY THIS SKILL MATTERS FOR {targetRole}
                </div>
                <p className="text-xs text-talent-subtext leading-relaxed">
                  Competency in <strong className="text-talent-text">{selectedNode.label}</strong> is a core prerequisite
                  for high-autonomy decision making in {targetRole}. Production telemetry demonstrates that engineers with this skill
                  reduce incident resolution time by 38% and design higher-throughput architectures.
                </p>
              </div>

              {/* Recommended Curated Learning Resources */}
              <div className="rounded-xl bg-talent-card p-4 border border-talent-border space-y-2.5">
                <div className="text-[10px] font-mono text-talent-muted uppercase font-bold flex items-center justify-between">
                  <span>RECOMMENDED CURATED RESOURCES</span>
                  <span className="text-talent-teal">Internal LMS + RFCs</span>
                </div>
                <div className="space-y-2">
                  {getNodeResources(selectedNode.label).map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-talent-surface border border-talent-border text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-talent-teal shrink-0" />
                        <div>
                          <div className="font-semibold text-talent-text">{res.title}</div>
                          <div className="text-[10px] text-talent-muted font-mono">{res.source}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-talent-purple bg-talent-purple/10 px-2 py-0.5 rounded shrink-0">
                        {res.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar: Time Estimate & Mark Complete Toggle */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="rounded-xl bg-talent-card p-4 border border-talent-border space-y-3">
                <div>
                  <div className="text-[10px] font-mono text-talent-muted uppercase font-bold">
                    ESTIMATED TIME TO ACQUIRE
                  </div>
                  <div className="mt-1 text-lg font-mono font-bold text-talent-teal">
                    14–20 Hours
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-talent-muted uppercase font-bold">
                    DIFFICULTY RATING
                  </div>
                  <div className="mt-1 text-xs text-talent-subtext">
                    Advanced Engineering (Tier 3)
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isToggling}
                onClick={() => handleToggleNodeComplete(selectedNode)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-mono text-xs font-bold transition-all shadow-card-elevated ${
                  completedNodeIds.has(selectedNode.id) || selectedNode.status === 'acquired'
                    ? 'bg-talent-surface text-talent-subtext border border-talent-border hover:text-talent-text'
                    : 'bg-gradient-to-r from-talent-teal to-teal-400 text-talent-bg shadow-glow-teal hover-lift'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>
                  {completedNodeIds.has(selectedNode.id) || selectedNode.status === 'acquired'
                    ? 'Mark Incomplete'
                    : 'Mark Complete & Update Readiness'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
