'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GitGraphState, GitChallenge } from '@/lib/git-sandbox/types';
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
  CheckCircle,
  Trophy,
  Award,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export function SandboxClient() {
  const [challenges] = useState<GitChallenge[]>(GIT_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<GitChallenge>(GIT_CHALLENGES[0]);
  const [graphState, setGraphState] = useState<GitGraphState>(() => GIT_CHALLENGES[0].initialState());
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showConflictEditor, setShowConflictEditor] = useState(false);

  // Initialize from storage or default
  useEffect(() => {
    const timer = setTimeout(() => {
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
          } else {
            setGraphState(match.initialState());
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save state on change
  useEffect(() => {
    saveSandboxState(graphState);
  }, [graphState]);

  // Check challenge completion
  useEffect(() => {
    const allDone = activeChallenge.objectives.every((o) => o.check(graphState));
    if (allDone && !completedIds.includes(activeChallenge.id)) {
      const updated = markChallengeCompleted(activeChallenge.id);
      const timer = setTimeout(() => {
        setCompletedIds(updated);
      }, 0);
      return () => clearTimeout(timer);
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
    const nextState = resolveConflict(graphState, file, resolvedContent);
    setGraphState(nextState);
    if (Object.keys(nextState.staging.conflicts).length === 0) {
      setShowConflictEditor(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
            <Link href="/resources" className="hover:text-primary transition-colors">
              Resources
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">Interactive Git DAG Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Git DAG Simulator & Conflict Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Simulate Git branching, detached HEAD, rebasing, octopus merges, and 3-way conflict resolution directly in your browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-foreground font-semibold">
              {completedIds.length} / {challenges.length} Done
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetChallenge}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Reset Current
          </button>
        </div>
      </div>

      {/* Challenge Selection Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {challenges.map((c, idx) => {
          const isActive = c.id === activeChallenge.id;
          const isDone = completedIds.includes(c.id);

          return (
            <button
              key={c.id}
              onClick={() => handleSelectChallenge(c)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border hover:border-primary/50'
              }`}
            >
              <span className="font-mono opacity-80">0{idx + 1}.</span>
              <span>{c.title}</span>
              {isDone && (
                <CheckCircle className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-emerald-500'}`} />
              )}
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

          <div>
            <CommandCheatSheet />
          </div>
        </div>
      </div>

      {/* Educational Footer Callout */}
      <div className="p-4 rounded-xl border border-border bg-card/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary shrink-0" />
          <span>
            Practice common scenarios: rebasing on main, cherry-picking hotfixes, and resolving merge conflicts before pushing to upstream open-source repositories.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[11px]">Contribo Git DAG Engine v1.0</span>
      </div>
    </div>
  );
}
