'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Filter,
  FileText,
  X,
} from 'lucide-react';
import type { IssueRecord } from '@/lib/issues/types';
import {
  triageIssues,
  buildProposalSeedFromIssue,
  type ScoredIssueTriage,
  type TriageTier,
  type ProposalSeed,
} from '@/lib/issues/triage-scorer';

interface TriageClientProps {
  issues: IssueRecord[];
}

const POPULAR_SKILLS = [
  'TypeScript',
  'Python',
  'Go',
  'Rust',
  'React',
  'Next.js',
  'Docker',
  'Kubernetes',
];

function TierBadge({ tier }: { tier: TriageTier }) {
  const styles: Record<TriageTier, string> = {
    'Starter Friendly':
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    Intermediate:
      'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    'Deep Core':
      'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[tier]}`}
    >
      {tier}
    </span>
  );
}

export function TriageClient({ issues }: TriageClientProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['TypeScript', 'React']);
  const [selectedTier, setSelectedTier] = useState<TriageTier | 'ALL'>('ALL');
  const [hideBlocked, setHideBlocked] = useState(true);
  const [activeSeed, setActiveSeed] = useState<ProposalSeed | null>(null);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const triaged = useMemo(
    () =>
      triageIssues(issues, {
        skills: selectedSkills,
        tier: selectedTier === 'ALL' ? null : selectedTier,
        includeBlocked: !hideBlocked,
      }),
    [issues, selectedSkills, selectedTier, hideBlocked]
  );

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleCopySeed(seed: ProposalSeed) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(seed, null, 2));
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/issues"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Issues Explorer
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-500 shrink-0" />
            Good-First-Issue Triage &amp; Readiness Scorer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Deterministic 4-signal issue triage ranking tickets by reproduction clarity, blast
            radius, maintainer responsiveness, and your tech stack.
          </p>
        </div>

        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl">
          {triaged.length} matching issues
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Filter className="w-4 h-4 text-sky-500" />
            Your Skill Profile &amp; Triage Filters
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hideBlocked}
              onChange={(e) => setHideBlocked(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Hide stale or PR-claimed issues
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {POPULAR_SKILLS.map((skill) => {
            const active = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          {(['ALL', 'Starter Friendly', 'Intermediate', 'Deep Core'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                selectedTier === tier
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tier === 'ALL' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </section>

      {/* Triage Queue */}
      <section className="space-y-4">
        {triaged.map((item: ScoredIssueTriage) => (
          <div
            key={item.issue.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TierBadge tier={item.tier} />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {item.issue.repo}#{item.issue.number}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />~{item.estimatedHoursToFirstPr}h to PR
                  </span>
                  {item.isBlocked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      {item.blockReasons.join(', ')}
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.issue.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {item.issue.description}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {item.readinessScore}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSeed(buildProposalSeedFromIssue(item))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Convert to Proposal Seed
                  </button>
                  <a
                    href={item.issue.issueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* 4-Signal Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Repro Clarity (30%)</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.signals.reproductionClarity}%
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Scope Safety (25%)</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.signals.scopeBlastRadius}%
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Maintainer Sync (25%)</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.signals.maintainerResponsiveness}%
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Stack Overlap (20%)</span>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  {item.signals.skillStackOverlap}%
                  {item.matchedSkills.length > 0 && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Proposal Seed Modal */}
      {activeSeed && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-2xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Generated Proposal Studio Seed
              </h3>
              <button
                type="button"
                onClick={() => setActiveSeed(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-80">
              {JSON.stringify(activeSeed, null, 2)}
            </pre>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => void handleCopySeed(activeSeed)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {copiedSeed ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied Seed JSON
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Seed JSON
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
