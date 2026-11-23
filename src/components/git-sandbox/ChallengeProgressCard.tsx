'use client';

import React, { useState } from 'react';
import { GitChallenge, GitGraphState } from '@/lib/git-sandbox/types';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Trophy,
  ChevronRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface ChallengeProgressCardProps {
  challenge: GitChallenge;
  graphState: GitGraphState;
  allChallenges: GitChallenge[];
  completedChallengeIds: string[];
  onSelectChallenge: (challenge: GitChallenge) => void;
  onResetChallenge: () => void;
}

export function ChallengeProgressCard({
  challenge,
  graphState,
  allChallenges,
  completedChallengeIds,
  onSelectChallenge,
  onResetChallenge,
}: ChallengeProgressCardProps) {
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Evaluate each objective against current graphState
  const objectiveResults = challenge.objectives.map((obj) => ({
    ...obj,
    completed: obj.check(graphState),
  }));

  const allCompleted = objectiveResults.every((o) => o.completed);
  const completedCount = objectiveResults.filter((o) => o.completed).length;

  const currentIdx = allChallenges.findIndex((c) => c.id === challenge.id);
  const nextChallenge = allChallenges[currentIdx + 1];

  const difficultyColors = {
    Beginner: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    Intermediate: 'bg-blue-950/80 text-blue-300 border-blue-800',
    Advanced: 'bg-purple-950/80 text-purple-300 border-purple-800',
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
              difficultyColors[challenge.difficulty]
            }`}
          >
            {challenge.difficulty}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {challenge.estimatedMinutes} mins
          </span>
        </div>
        <h2 className="text-base font-bold text-slate-100 leading-snug">
          {challenge.title}
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {challenge.description}
        </p>
      </div>

      {/* Objectives Checklist */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Objectives ({completedCount}/{challenge.objectives.length})
          </span>
          {allCompleted && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold animate-pulse">
              <Trophy className="w-3.5 h-3.5" />
              Completed!
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {objectiveResults.map((obj) => (
            <div
              key={obj.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-colors ${
                obj.completed
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-300'
              }`}
            >
              {obj.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{obj.description}</span>
            </div>
          ))}
        </div>

        {/* Hints Accordion */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHints ? 'Hide Hints' : 'Need a Hint?'}
          </button>
          {showHints && (
            <div className="mt-2 p-3 bg-sky-950/30 border border-sky-900/40 rounded-lg text-xs text-sky-200 space-y-1.5 font-sans">
              {challenge.hints.map((hint, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solution Accordion */}
        <div>
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {showSolution ? 'Hide Solution Steps' : 'View Solution Commands'}
          </button>
          {showSolution && (
            <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono space-y-1 text-slate-300">
              {challenge.solutionSteps.map((step, idx) => (
                <div key={idx} className="text-emerald-400">
                  $ {step}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onResetChallenge}
          className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
          title="Reset this challenge to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        {allCompleted && nextChallenge ? (
          <button
            type="button"
            onClick={() => onSelectChallenge(nextChallenge)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all animate-bounce"
          >
            <span>Next Challenge</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-[11px] text-slate-500 font-mono">
            {completedChallengeIds.length}/{allChallenges.length} Badges Earned
          </div>
        )}
      </div>
    </div>
  );
}
