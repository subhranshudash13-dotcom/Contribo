'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GitGraphState, GitChallenge, GitCommit } from '@/lib/git-sandbox/types';
import { executeGitCommand, resolveConflict } from '@/lib/git-sandbox/engine';
import { GIT_CHALLENGES } from '@/lib/git-sandbox/challenges';
import {
  saveSandboxState,
  loadSandboxState,
  saveActiveChallengeId,
  loadActiveChallengeId,
  getCompletedChallenges,
  markChallengeCompleted,
} from '@/lib/git-sandbox/storage';
import { GitGraphVisualizer } from '@/components/git-sandbox/GitGraphVisualizer';
import { VirtualTerminal } from '@/components/git-sandbox/VirtualTerminal';
import { ConflictEditor } from '@/components/git-sandbox/ConflictEditor';
import { ChallengeProgressCard } from '@/components/git-sandbox/ChallengeProgressCard';
import { CommandCheatSheet } from '@/components/git-sandbox/CommandCheatSheet';
import {
  GitPullRequest,
  CheckCircle,
  Trophy,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export function SandboxClient() {
  const [challenges] = useState<GitChallenge[]>(GIT_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<GitChallenge>(GIT_CHALLENGES[0]);
  const [graphState, setGraphState] = useState<GitGraphState>(() => GIT_CHALLENGES[0].initialState());
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showConflictEditor, setShowConflictEditor] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(null);

  // Initialize from storage or default
  useEffect(() => {
    const savedCompleted = getCompletedChallenges();
    setCompletedIds(savedCompleted);

    const savedChallengeId = loadActiveChallengeId();
    if (savedChallengeId) {
      const match = GIT_CHALLENGES.find((c) => c.id === savedChallengeId);
      if (match) {
        setActiveChallenge(match);
        const savedState = loadSandboxState();
        if (savedState) {
          setGraphState(savedState);
          return;
        } else {
          setGraphState(match.initialState());
          return;
        }
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    saveSandboxState(graphState);
    if (Object.keys(graphState.staging.conflicts).length > 0) {
      setShowConflictEditor(true);
    }
  }, [graphState]);

  // Check challenge completion
  useEffect(() => {
    const allDone = activeChallenge.objectives.every((o) => o.check(graphState));
    if (allDone && !completedIds.includes(activeChallenge.id)) {
      const updated = markChallengeCompleted(activeChallenge.id);
      setCompletedIds(updated);
    }
  }, [graphState, activeChallenge, completedIds]);

  const handleExecuteCommand = useCallback(
    (rawCmd: string) => {
      const result = executeGitCommand(rawCmd, graphState);
      setGraphState(result.graphState);

      if (result.conflictDetected || Object.keys(result.graphState.staging.conflicts).length > 0) {
        setShowConflictEditor(true);
      }

      return {
        success: result.success,
        output: result.output,
        error: result.error,
      };
    },
    [graphState]
  );

  const handleSelectChallenge = (challenge: GitChallenge) => {
    setActiveChallenge(challenge);
    saveActiveChallengeId(challenge.id);
    const newState = challenge.initialState();
    setGraphState(newState);
    setShowConflictEditor(false);
  };

  const handleResetChallenge = () => {
    const freshState = activeChallenge.initialState();
    setGraphState(freshState);
    setShowConflictEditor(false);
  };

  const handleResolveConflict = (file: string, resolvedContent: string) => {
    const next = resolveConflict(graphState, file, resolvedContent);
    setGraphState(next);
    if (Object.keys(next.staging.conflicts).length === 0) {
      setShowConflictEditor(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <Link href="/" className="hover:text-slate-200">
              Contribo
            </Link>
            <span>/</span>
            <span className="text-slate-300">Interactive Lab</span>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Git DAG Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-400" />
            Git DAG Simulator & Conflict Sandbox
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Master Git branching, upstream synchronization, rebasing, and merge conflict resolution in a deterministic, zero-risk virtual terminal with real-time SVG graph visualizer.
          </p>
        </div>

        {/* Challenge Selection Dropdown / Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Badges: {completedIds.length}/{challenges.length} Earned</span>
          </div>
          <Link
            href="/passport"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>View in Passport</span>
          </Link>
        </div>
      </div>

      {/* Challenge Picker Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {challenges.map((c, idx) => {
          const isSelected = c.id === activeChallenge.id;
          const isDone = completedIds.includes(c.id);

          return (
            <button
              key={c.id}
              onClick={() => handleSelectChallenge(c)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-800 border-sky-500 text-slate-100 shadow-md shadow-sky-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                {idx + 1}
              </span>
              <span>{c.title}</span>
              {isDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Active Conflict Editor Banner if active */}
      {showConflictEditor && Object.keys(graphState.staging.conflicts).length > 0 && (
        <ConflictEditor
          conflicts={graphState.staging.conflicts}
          onResolve={handleResolveConflict}
          onDismiss={() => setShowConflictEditor(false)}
        />
      )}

      {/* Main Sandbox Grid (Visualizer, Terminal & Challenge Checklist) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* Left Column: DAG Visualizer (Top) + Virtual Terminal (Bottom) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top: SVG DAG Graph */}
          <div className="h-[280px]">
            <GitGraphVisualizer
              graphState={graphState}
              onSelectCommit={(commit) => setSelectedCommit(commit)}
            />
          </div>

          {/* Bottom: Virtual Terminal Shell */}
          <div className="h-[340px]">
            <VirtualTerminal
              graphState={graphState}
              onExecuteCommand={handleExecuteCommand}
            />
          </div>
        </div>

        {/* Right Column: Challenge Progress Checklist & Objectives */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1">
            <ChallengeProgressCard
              challenge={activeChallenge}
              graphState={graphState}
              allChallenges={challenges}
              completedChallengeIds={completedIds}
              onSelectChallenge={handleSelectChallenge}
              onResetChallenge={handleResetChallenge}
            />
          </div>
        </div>
      </div>

      {/* Command Cheat Sheet Accordion */}
      <CommandCheatSheet />
    </div>
  );
}
