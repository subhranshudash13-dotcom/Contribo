'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass, RefreshCw } from 'lucide-react';
import { SkillProgressSummary } from '@/components/skill-tree/SkillProgressSummary';
import { SkillTreeGraph as SkillTreeGraphView } from '@/components/skill-tree/SkillTreeGraph';
import { SkillNodeDrawer } from '@/components/skill-tree/SkillNodeDrawer';
import type {
  SkillTreeGraph,
  SkillNode,
  UserSkillTreeProgress,
  NodeStatus,
} from '@/lib/skill-tree/types';
import { evaluateNodeStatuses } from '@/lib/skill-tree/engine';

interface SkillTreeClientProps {
  initialGraph: SkillTreeGraph;
  slug: string;
}

export function SkillTreeClient({ initialGraph, slug }: SkillTreeClientProps) {
  const [graph] = useState<SkillTreeGraph>(initialGraph);
  const [progress, setProgress] = useState<UserSkillTreeProgress>({
    userId: 'anonymous',
    programSlug: slug,
    earnedXp: 0,
    totalXp: initialGraph.totalXp,
    completionPercentage: 0,
    nodes: {},
    completedNodeIds: [],
    availableNodeIds: [],
    lockedNodeIds: [],
    badgeUnlocked: false,
    updatedAt: new Date().toISOString(),
  });
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/skill-tree?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.progress) {
          setProgress(data.progress);
        }
      }
    } catch {
      // In offline / signed out mode, retain local initial progress
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/user/skill-tree?slug=${encodeURIComponent(slug)}`);
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data?.progress) {
            setProgress(data.progress);
          }
        }
      } catch {
        // In offline / signed out mode, retain local initial progress
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [slug]);

  const handleUpdateStatus = async (
    nodeId: string,
    status: NodeStatus,
    evidenceUrl?: string
  ) => {
    const res = await fetch('/api/user/skill-tree/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programSlug: slug,
        nodeId,
        status,
        evidenceUrl,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update milestone progress');
    }

    if (data.progress) {
      setProgress(data.progress);
    }
  };

  const masteredSet = new Set(progress.completedNodeIds || []);
  const nodeStatuses = evaluateNodeStatuses(graph, masteredSet);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <Link
              href={`/programs/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
              <span>Back to {graph.programName}</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {graph.programName} Skill-Tree & Pathway
                </h1>
                <p className="text-xs text-slate-400">{graph.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              title="Refresh Progress"
              aria-label="Refresh progress"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress Summary Cards */}
        <SkillProgressSummary graph={graph} progress={progress} />

        {/* Directed Acyclic Graph Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <p>Click any node to view prerequisites, learning guides, and submit verification.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Mastered</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600" /> Locked</span>
            </div>
          </div>

          <SkillTreeGraphView
            graph={graph}
            nodeStatuses={nodeStatuses}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={(node) => setSelectedNode(node)}
          />
        </div>
      </div>

      {/* Side Slide-Over Drawer */}
      {selectedNode && (
        <SkillNodeDrawer
          node={selectedNode}
          status={nodeStatuses[selectedNode.id] || 'LOCKED'}
          allNodes={graph.nodes}
          onClose={() => setSelectedNode(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
