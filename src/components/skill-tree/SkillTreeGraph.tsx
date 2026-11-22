'use client';

import React from 'react';
import { Check, Lock, Play, Sparkles } from 'lucide-react';
import type { SkillTreeGraph, SkillNode, NodeStatus } from '@/lib/skill-tree/types';

interface SkillTreeGraphProps {
  graph: SkillTreeGraph;
  nodeStatuses: Record<string, NodeStatus>;
  selectedNodeId: string | null;
  onSelectNode: (node: SkillNode) => void;
}

export function SkillTreeGraph({
  graph,
  nodeStatuses,
  selectedNodeId,
  onSelectNode,
}: SkillTreeGraphProps) {
  const nodeMap = new Map<string, SkillNode>();
  for (const node of graph.nodes) {
    nodeMap.set(node.id, node);
  }

  return (
    <div className="relative w-full overflow-x-auto rounded-2xl bg-slate-950/80 border border-slate-800 p-8 min-h-[500px] shadow-2xl">
      {/* SVG Container for Bezier Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 1000, minHeight: 480 }}>
        <defs>
          <linearGradient id="edgeMastered" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="edgeDefault" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {graph.edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.position.x + 80;
          const y1 = fromNode.position.y + 40;
          const x2 = toNode.position.x;
          const y2 = toNode.position.y + 40;
          const dx = Math.abs(x2 - x1) * 0.5;

          const isSourceMastered = nodeStatuses[fromNode.id] === 'MASTERED';
          const isTargetMastered = nodeStatuses[toNode.id] === 'MASTERED';
          const isTargetAvailable = nodeStatuses[toNode.id] === 'AVAILABLE';

          const strokeStyle =
            isSourceMastered && (isTargetMastered || isTargetAvailable)
              ? 'url(#edgeMastered)'
              : '#334155';

          return (
            <path
              key={`${edge.from}->${edge.to}`}
              d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke={strokeStyle}
              strokeWidth={isSourceMastered ? 2.5 : 1.5}
              strokeDasharray={isSourceMastered ? undefined : '4 4'}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Interactive Nodes */}
      <div className="relative min-w-[1000px] min-h-[440px]">
        {graph.nodes.map((node) => {
          const status: NodeStatus = nodeStatuses[node.id] || 'LOCKED';
          const isSelected = selectedNodeId === node.id;

          let badgeColor = 'bg-slate-900/90 border-slate-800 text-slate-500';
          let icon = <Lock className="w-4 h-4 text-slate-500" />;

          if (status === 'MASTERED') {
            badgeColor = 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-lg shadow-emerald-950/40';
            icon = <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />;
          } else if (status === 'AVAILABLE') {
            badgeColor = 'bg-blue-950/80 border-blue-500/60 text-blue-200 shadow-lg shadow-blue-950/50 hover:border-blue-400';
            icon = <Play className="w-4 h-4 text-blue-400 fill-blue-400/20" />;
          } else if (status === 'IN_PROGRESS') {
            badgeColor = 'bg-amber-950/80 border-amber-500/60 text-amber-200 shadow-lg shadow-amber-950/40';
            icon = <Sparkles className="w-4 h-4 text-amber-400" />;
          }

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node)}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
              }}
              className={`absolute w-48 p-3.5 rounded-xl border text-left transition-all duration-200 backdrop-blur-sm group hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${badgeColor} ${
                isSelected ? 'ring-2 ring-blue-500 scale-[1.03]' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-75">
                  {node.tier}
                </span>
                <div className="p-1 rounded-md bg-black/40">{icon}</div>
              </div>

              <h4 className="text-xs font-semibold leading-tight line-clamp-2 text-white group-hover:text-blue-300 transition">
                {node.title}
              </h4>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                <span>{node.estimatedHours}h est.</span>
                <span className="font-semibold text-amber-400/90">+{node.xp} XP</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
