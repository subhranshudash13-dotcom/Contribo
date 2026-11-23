'use client';

import React from 'react';
import { Award, Zap, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import type { SkillTreeGraph, UserSkillTreeProgress } from '@/lib/skill-tree/types';

interface SkillProgressSummaryProps {
  graph: SkillTreeGraph;
  progress: UserSkillTreeProgress;
}

export function SkillProgressSummary({ graph, progress }: SkillProgressSummaryProps) {
  const percentage = progress.completionPercentage || 0;
  const earnedXp = progress.earnedXp || 0;
  const totalXp = progress.totalXp || graph.totalXp || 1000;
  const masteredCount = progress.completedNodeIds?.length || 0;
  const totalNodes = graph.nodes?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
      {/* XP Gauge */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
          <Zap className="w-5 h-5 fill-amber-400/20" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Total Skill XP</p>
          <p className="text-lg font-bold text-white">
            {earnedXp} <span className="text-xs font-normal text-slate-500">/ {totalXp} XP</span>
          </p>
        </div>
      </div>

      {/* Completion Percentage */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-medium text-slate-400">Path Completion</p>
            <p className="text-xs font-bold text-blue-400">{percentage}%</p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mastered Milestones */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Mastered Skills</p>
          <p className="text-lg font-bold text-white">
            {masteredCount} <span className="text-xs font-normal text-slate-500">/ {totalNodes} Nodes</span>
          </p>
        </div>
      </div>

      {/* Verified Badge */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
        <div
          className={`p-3 rounded-xl border transition ${
            progress.badgeUnlocked
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-500'
          }`}
        >
          {progress.badgeUnlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Program Badge</p>
          <p
            className={`text-sm font-semibold truncate ${
              progress.badgeUnlocked ? 'text-purple-300' : 'text-slate-500'
            }`}
          >
            {graph.badgeName}
          </p>
        </div>
      </div>
    </div>
  );
}
