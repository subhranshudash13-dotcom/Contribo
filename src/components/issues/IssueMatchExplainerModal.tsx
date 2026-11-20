'use client';

import React from 'react';
import { X, Sparkles, CheckCircle2, BookOpen, ExternalLink } from 'lucide-react';
import type { IssueRecord } from '@/lib/issues/types';

interface IssueMatchExplainerModalProps {
  issue: IssueRecord | null;
  userSkills?: string[];
  onClose: () => void;
}

export function IssueMatchExplainerModal({
  issue,
  userSkills = [],
  onClose,
}: IssueMatchExplainerModalProps) {
  if (!issue) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="explainer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl border border-hairline bg-surface-raised text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 id="explainer-title" className="font-heading text-lg font-bold text-primary">
              Orbit AI Match Breakdown
            </h3>
            <p className="font-mono text-xs text-muted">
              {issue.repo}#{issue.number}
            </p>
          </div>
        </div>

        {/* User Skills Context */}
        {userSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted">
            <span>Evaluated against:</span>
            {userSkills.map((s) => (
              <span key={s} className="rounded-md border border-hairline bg-surface-raised px-1.5 py-0.5 text-primary uppercase">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Match Score Meter */}
        <div className="rounded-2xl border border-hairline bg-surface-raised p-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-secondary">Skill Compatibility Score</span>
            <span className="font-bold text-accent text-sm">{issue.matchScore ?? 85}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${issue.matchScore ?? 85}%` }}
            />
          </div>
        </div>

        {/* Issue Title & Program */}
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
            {issue.program} · {issue.orgName}
          </span>
          <h4 className="font-heading text-sm font-bold text-primary leading-snug">
            {issue.title}
          </h4>
        </div>

        {/* Explanation Reasons */}
        <div className="space-y-2">
          <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
            Why this issue is recommended for you:
          </h5>
          <ul className="space-y-2">
            {(issue.matchReasons || []).map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-hairline/60 bg-surface-raised/40 p-2.5 font-body text-xs text-secondary leading-relaxed"
              >
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mentor Guideline Box (if available) */}
        {issue.mentorGuideText && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <BookOpen size={14} />
              <span>Mentor Pointers & Reproduction Steps</span>
            </div>
            <p className="font-body text-xs text-secondary leading-relaxed">
              {issue.mentorGuideText}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-hairline/80">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-hairline px-4 py-2 font-mono text-xs font-semibold text-secondary hover:bg-surface-raised transition-colors cursor-pointer"
          >
            Close
          </button>
          <a
            href={issue.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 font-mono text-xs font-bold text-white hover:bg-accent-hover transition-colors shadow-xs"
          >
            <span>Open Issue on GitHub</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
