'use client';

import React, { useMemo, useState } from 'react';
import { GitCommit, GitGraphState } from '@/lib/git-sandbox/types';
import { GitBranch, GitCommit as GitCommitIcon, ArrowRight, Eye, ShieldCheck } from 'lucide-react';

interface GitGraphVisualizerProps {
  graphState: GitGraphState;
  onSelectCommit?: (commit: GitCommit) => void;
}

interface NodePosition {
  commit: GitCommit;
  x: number;
  y: number;
  lane: number;
}

export function GitGraphVisualizer({ graphState, onSelectCommit }: GitGraphVisualizerProps) {
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

  // Compute topological layout with lanes
  const { nodePositions, edges, width, height } = useMemo(() => {
    const commits = Object.values(graphState.commits);
    if (commits.length === 0) {
      return { nodePositions: [], edges: [], width: 600, height: 260 };
    }

    // Sort commits chronologically by timestamp
    const sorted = [...commits].sort((a, b) => a.timestamp - b.timestamp);

    const positions: Record<string, NodePosition> = {};
    const laneOccupancy: Record<number, number> = {};

    sorted.forEach((commit, index) => {
      let lane = 0;
      if (commit.parents.length > 0) {
        const parentPos = positions[commit.parents[0]];
        if (parentPos) {
          // Default to parent lane unless parent already had another child in that lane
          lane = parentPos.lane;
          if (laneOccupancy[lane] !== undefined && laneOccupancy[lane] >= index - 1) {
            lane = (parentPos.lane + 1) % 4;
          }
        }
      }

      laneOccupancy[lane] = index;

      positions[commit.hash] = {
        commit,
        x: 80 + index * 120,
        y: 70 + lane * 60,
        lane,
      };
    });

    const posList = Object.values(positions);

    // Build edges
    const edgeList: { from: NodePosition; to: NodePosition; isMergeParent?: boolean }[] = [];
    posList.forEach((child) => {
      child.commit.parents.forEach((parentHash, pIdx) => {
        const parent = positions[parentHash];
        if (parent) {
          edgeList.push({
            from: parent,
            to: child,
            isMergeParent: pIdx > 0,
          });
        }
      });
    });

    const maxW = Math.max(700, 100 + posList.length * 130);
    const maxH = Math.max(260, 120 + Math.max(0, ...posList.map((p) => p.y)));

    return {
      nodePositions: posList,
      edges: edgeList,
      width: maxW,
      height: maxH,
    };
  }, [graphState.commits]);

  // Map of commitHash -> ref badges (branches, remotes, tags, HEAD)
  const refsByCommit = useMemo(() => {
    const map: Record<string, { label: string; type: 'head' | 'branch' | 'remote' | 'tag' }[]> = {};

    const addRef = (hash: string, label: string, type: 'head' | 'branch' | 'remote' | 'tag') => {
      if (!map[hash]) map[hash] = [];
      map[hash].push({ label, type });
    };

    // Branches
    Object.entries(graphState.refs.branches).forEach(([bName, hash]) => {
      addRef(hash, bName, 'branch');
    });

    // Remotes
    Object.entries(graphState.refs.remotes).forEach(([remote, branches]) => {
      Object.entries(branches).forEach(([bName, hash]) => {
        addRef(hash, `${remote}/${bName}`, 'remote');
      });
    });

    // Tags
    Object.entries(graphState.refs.tags || {}).forEach(([tag, hash]) => {
      addRef(hash, `tag: ${tag}`, 'tag');
    });

    // HEAD
    const head = graphState.refs.HEAD;
    const headHash = head.type === 'branch' ? graphState.refs.branches[head.target] : head.target;
    if (headHash) {
      if (head.type === 'detached') {
        addRef(headHash, 'HEAD (detached)', 'head');
      } else {
        addRef(headHash, `HEAD -> ${head.target}`, 'head');
      }
    }

    return map;
  }, [graphState.refs]);

  const activeCommit = selectedHash ? graphState.commits[selectedHash] : null;

  return (
    <div className="flex flex-col h-full bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Graph Visualizer Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
            Git DAG Visualizer (Real-Time SVG)
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
            Active HEAD
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Branch Target
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            Merge Commit
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 overflow-auto p-4 min-h-[220px]">
        <svg
          width={width}
          height={height}
          className="select-none font-mono text-xs"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="7"
              markerHeight="6"
              refX="16"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 7 3, 0 6" fill="#64748b" />
            </marker>
            <marker
              id="arrowhead-merge"
              markerWidth="7"
              markerHeight="6"
              refX="16"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 7 3, 0 6" fill="#a855f7" />
            </marker>
          </defs>

          {/* Render Edge Connectors */}
          {edges.map((edge, idx) => {
            const dx = edge.to.x - edge.from.x;
            const dy = edge.to.y - edge.from.y;
            const cx1 = edge.from.x + dx * 0.5;
            const cy1 = edge.from.y;
            const cx2 = edge.from.x + dx * 0.5;
            const cy2 = edge.to.y;

            const d = `M ${edge.from.x} ${edge.from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${edge.to.x} ${edge.to.y}`;

            return (
              <path
                key={`edge-${idx}`}
                d={d}
                fill="none"
                stroke={edge.isMergeParent ? '#a855f7' : '#475569'}
                strokeWidth={edge.isMergeParent ? '2' : '2'}
                strokeDasharray={edge.isMergeParent ? '4 3' : 'none'}
                markerEnd={edge.isMergeParent ? 'url(#arrowhead-merge)' : 'url(#arrowhead)'}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Render Commit Nodes */}
          {nodePositions.map((pos) => {
            const isSelected = selectedHash === pos.commit.hash;
            const refs = refsByCommit[pos.commit.hash] || [];
            const hasHead = refs.some((r) => r.type === 'head');
            const isMerge = pos.commit.isMerge || pos.commit.parents.length > 1;

            let fillColor = '#1e293b';
            let strokeColor = '#64748b';
            if (hasHead) {
              fillColor = '#064e3b';
              strokeColor = '#10b981';
            } else if (isMerge) {
              fillColor = '#3b0764';
              strokeColor = '#a855f7';
            } else if (refs.length > 0) {
              fillColor = '#172554';
              strokeColor = '#3b82f6';
            }

            return (
              <g
                key={`node-${pos.commit.hash}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedHash(pos.commit.hash);
                  onSelectCommit?.(pos.commit);
                }}
              >
                {/* Node Halo for selected state */}
                {isSelected && (
                  <circle
                    r="18"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="3 2"
                    className="animate-spin"
                  />
                )}

                {/* Commit Node Circle */}
                <circle
                  r="13"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Inner Icon Dot */}
                <circle r="4" fill={strokeColor} />

                {/* Short SHA label */}
                <text
                  x="0"
                  y="-18"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="600"
                  className="group-hover:fill-sky-400 transition-colors"
                >
                  {pos.commit.shortHash}
                </text>

                {/* Commit Message Tooltip Label */}
                <text
                  x="0"
                  y="26"
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="9.5"
                  className="max-w-[100px] truncate pointer-events-none"
                >
                  {pos.commit.message.length > 16
                    ? `${pos.commit.message.slice(0, 15)}…`
                    : pos.commit.message}
                </text>

                {/* Ref Badges (branch / HEAD / tags) */}
                {refs.length > 0 && (
                  <g transform="translate(0, -32)">
                    {refs.map((ref, rIdx) => {
                      const badgeBg =
                        ref.type === 'head'
                          ? '#10b981'
                          : ref.type === 'remote'
                          ? '#6366f1'
                          : ref.type === 'tag'
                          ? '#f59e0b'
                          : '#3b82f6';

                      return (
                        <g key={`ref-${rIdx}`} transform={`translate(0, ${-rIdx * 16})`}>
                          <rect
                            x={-(ref.label.length * 3.3 + 8)}
                            y="-9"
                            width={ref.label.length * 6.6 + 16}
                            height="13"
                            rx="3"
                            fill={badgeBg}
                            opacity="0.9"
                          />
                          <text
                            x="0"
                            y="1"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="8.5"
                            fontWeight="bold"
                          >
                            {ref.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Commit Detail Drawer */}
      {activeCommit && (
        <div className="border-t border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sky-400 font-semibold">{activeCommit.shortHash}</span>
            <span className="text-slate-100 font-medium">{activeCommit.message}</span>
            <span className="text-slate-400">by {activeCommit.author.split('<')[0].trim()}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <span>Files: {Object.keys(activeCommit.files).length}</span>
            {activeCommit.isMerge && (
              <span className="px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-300 text-[10px] font-bold">
                MERGE
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
