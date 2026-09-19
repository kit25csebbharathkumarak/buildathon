'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, Clock, Sparkles, Award, ArrowRight } from 'lucide-react';

/**
 * Renders a branching career progression skill tree using pure absolute-positioned divs and SVG connector lines without external graph libraries.
 * @param {Object} props - Component properties.
 * @param {Array<{id: string, label: string, status: 'acquired'|'in_progress'|'recommended'|'target'}>} props.nodes - Graph nodes.
 * @param {Array<{from: string, to: string}>} props.edges - Directed edges connecting node IDs.
 * @param {string} [props.targetRole] - Target role title.
 * @returns {JSX.Element}
 */
export default function SkillTree({ nodes = [], edges = [], targetRole = 'Target Role' }) {
  // Compute hierarchical layout: partition nodes into columns (levels)
  const layout = useMemo(() => {
    if (!nodes || nodes.length === 0) return { positionedNodes: [], computedEdges: [], width: 900, height: 420 };

    // Group nodes by status or role
    const col0 = nodes.filter((n) => n.status === 'acquired');
    const col1 = nodes.filter((n) => n.status === 'in_progress');
    const col2 = nodes.filter((n) => n.status === 'recommended' && n.id !== 'target-role-node');
    const col3 = nodes.filter((n) => n.id === 'target-role-node');

    // Ensure all nodes have a column
    const columns = [col0, col1, col2, col3].map((col) => (col.length > 0 ? col : []));

    // Fallback if some statuses differ
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

        const pos = { ...node, x, y, width: nodeWidth, height: nodeHeight, colIdx };
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
        const isAcquiredEdge = source.status === 'acquired' && target.status === 'acquired';
        const isInProgressEdge = source.status === 'acquired' && target.status === 'in_progress';

        return {
          id: `edge-${idx}`,
          d,
          isAcquiredEdge,
          isInProgressEdge,
          fromStatus: source.status,
          toStatus: target.status,
        };
      })
      .filter(Boolean);

    return { positionedNodes, computedEdges, width: canvasWidth, height: canvasHeight };
  }, [nodes, edges]);

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
      default:
        return {
          border: 'border-amber-500/40 hover:border-amber-500/80 border-dashed',
          bg: 'bg-talent-card/70',
          shadow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          icon: <Sparkles className="h-4 w-4 text-amber-400" />,
          label: 'Target Milestone',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-talent-border bg-talent-bg shadow-card-elevated">
      {/* SkillTree Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-talent-border bg-talent-surface/80 px-6 py-4 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-semibold tracking-wide text-talent-text uppercase">
              Career GPS Directed Progression Graph
            </h3>
            <span className="rounded bg-talent-teal/10 px-2 py-0.5 text-[10px] font-mono text-talent-teal border border-talent-teal/20">
              Zero External Graph Libs
            </span>
          </div>
          <p className="text-xs text-talent-muted mt-0.5">
            Dynamic bridging path to <span className="text-talent-teal font-semibold">{targetRole}</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-talent-teal shadow-glow-teal" />
            <span className="text-talent-subtext font-mono text-[11px]">Acquired</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-talent-purple shadow-glow-purple" />
            <span className="text-talent-subtext font-mono text-[11px]">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-talent-subtext font-mono text-[11px]">Recommended</span>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="overflow-x-auto p-4 scrollbar-thin">
        <div
          className="relative min-h-[460px]"
          style={{ width: `${layout.width}px`, height: `${layout.height}px` }}
        >
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(#7F77DD 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

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
              <linearGradient id="purpleToAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7F77DD" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {layout.computedEdges.map((edge) => {
              const strokeColor = edge.isAcquiredEdge
                ? '#1D9E75'
                : edge.isInProgressEdge
                ? 'url(#tealToPurple)'
                : '#4A5568';

              return (
                <g key={edge.id}>
                  {/* Glowing background path */}
                  <path
                    d={edge.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={edge.isAcquiredEdge ? 3 : 2}
                    strokeOpacity={0.8}
                    strokeDasharray={edge.isAcquiredEdge ? 'none' : '4,4'}
                  />
                </g>
              );
            })}
          </svg>

          {/* Absolute Positioned Nodes */}
          {layout.positionedNodes.map((node) => {
            const styling = getStatusBadge(node.status);
            return (
              <div
                key={node.id}
                className={`absolute flex flex-col justify-between rounded-xl border p-3 transition-all duration-200 ${styling.border} ${styling.bg} ${styling.shadow} hover:scale-105 cursor-pointer backdrop-blur-sm`}
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
  );
}
