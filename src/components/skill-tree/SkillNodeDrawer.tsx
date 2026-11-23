'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Check, Lock, Play, Loader2, Link2, ShieldAlert } from 'lucide-react';
import type { SkillNode, NodeStatus } from '@/lib/skill-tree/types';

interface SkillNodeDrawerProps {
  node: SkillNode | null;
  status: NodeStatus;
  allNodes: SkillNode[];
  onClose: () => void;
  onUpdateStatus: (nodeId: string, status: NodeStatus, evidenceUrl?: string) => Promise<void>;
}

export function SkillNodeDrawer({
  node,
  status,
  allNodes,
  onClose,
  onUpdateStatus,
}: SkillNodeDrawerProps) {
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!node) return null;

  const nodeMap = new Map<string, SkillNode>();
  for (const n of allNodes) {
    nodeMap.set(n.id, n);
  }

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpdateStatus(node.id, 'MASTERED', evidenceUrl);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = status === 'LOCKED';
  const isMastered = status === 'MASTERED';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto text-slate-100 animate-slide-left"
    >
      <div className="flex items-start justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
            {node.tier} MILESTONE
          </span>
          <h3 className="text-lg font-bold text-white mt-1 leading-snug">{node.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="py-4 space-y-4">
        {/* Badges / Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            +{node.xp} XP
          </div>
          <div className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs">
            {node.estimatedHours} hours est.
          </div>
          <div
            className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
              isMastered
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : isLocked
                ? 'bg-slate-800 border border-slate-700 text-slate-500'
                : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}
          >
            {status}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overview</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{node.description}</p>
        </div>

        {/* Prerequisites */}
        {node.prerequisites && node.prerequisites.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Required Prerequisites
            </h4>
            <div className="space-y-1.5">
              {node.prerequisites.map((prereqId) => {
                const prereqNode = nodeMap.get(prereqId);
                return (
                  <div
                    key={prereqId}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-xs"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-slate-300">{prereqNode?.title || prereqId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Curated Resources */}
        {node.resources && node.resources.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Learning Guides & Exercises
            </h4>
            <div className="space-y-1.5">
              {node.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-blue-300 hover:text-white hover:bg-slate-800 transition group"
                >
                  <span className="truncate">{res.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Verification Task */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Verification Task
          </h4>
          <p className="text-xs text-slate-400">{node.verification.description}</p>

          {node.verification.type === 'pr_link' && (
            <div className="pt-2">
              <label className="text-[11px] font-medium text-slate-300 mb-1 block">
                Evidence Pull Request / Commit URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  placeholder="https://github.com/org/repo/pull/123"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800">
        {isMastered ? (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center gap-2 font-semibold">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Milestone Mastered!</span>
          </div>
        ) : isLocked ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-700/50"
          >
            <Lock className="w-4 h-4" />
            <span>Complete Prerequisites to Unlock</span>
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Mark Skill Mastered</span>
          </button>
        )}
      </div>
    </div>
  );
}
