'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Sparkles,
  Clock,
  MessageSquare,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Tag,
} from 'lucide-react';
import type { IssueRecord, ContributionStatus } from '@/lib/issues/types';

interface IssueCardProps {
  issue: IssueRecord;
  isTracked?: boolean;
  currentStatus?: ContributionStatus;
  onExplainMatch?: (issue: IssueRecord) => void;
  onToggleTrack?: (issue: IssueRecord) => void;
}

export function IssueCard({
  issue,
  isTracked = false,
  currentStatus,
  onExplainMatch,
  onToggleTrack,
}: IssueCardProps) {
  const difficultyColors = {
    easy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    medium: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    hard: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };

  const statusLabels: Record<ContributionStatus, string> = {
    discovered: 'Discovered',
    claimed: 'Claimed',
    'in-progress': 'In Progress',
    'pr-submitted': 'PR Submitted',
    merged: 'Merged',
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 sm:p-6 transition-all duration-200 hover:border-accent/40 hover:shadow-lg">
      <div className="space-y-3.5">
        {/* Top Metadata Row: Program, Org, Repo, Match Score */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-lg border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-accent">
              {issue.program}
            </span>
            <Link
              href={`/organizations/${issue.orgSlug}`}
              className="font-mono text-xs font-semibold text-secondary hover:text-accent transition-colors"
            >
              {issue.orgName}
            </Link>
            <span className="text-muted/40 text-xs">/</span>
            <a
              href={issue.issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-primary transition-colors"
              title={`View ${issue.repo}#${issue.number} on GitHub`}
            >
              <span>{issue.repo}#{issue.number}</span>
              <ExternalLink size={12} className="opacity-70 group-hover:opacity-100" />
            </a>
          </div>

          {/* AI Match Score Badge */}
          {typeof issue.matchScore === 'number' && (
            <button
              type="button"
              onClick={() => onExplainMatch?.(issue)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-xs font-bold text-accent transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              title="Click to view Orbit AI match reasoning"
            >
              <Sparkles size={13} className="animate-pulse" />
              <span>{issue.matchScore}% Match</span>
            </button>
          )}
        </div>

        {/* Issue Title */}
        <h3 className="font-heading text-base sm:text-lg font-bold text-primary leading-snug group-hover:text-accent transition-colors">
          <a
            href={issue.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-hidden focus:underline"
          >
            {issue.title}
          </a>
        </h3>

        {/* Description Snippet */}
        <p className="font-body text-xs sm:text-sm text-secondary line-clamp-2 leading-relaxed">
          {issue.description}
        </p>

        {/* Tags & Labels */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {issue.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-md border border-hairline bg-surface-raised px-2 py-0.5 font-mono text-[10px] font-semibold text-primary uppercase"
            >
              {lang}
            </span>
          ))}
          {issue.labels.slice(0, 3).map((lbl) => (
            <span
              key={lbl}
              className="inline-flex items-center gap-1 rounded-md border border-hairline/80 px-2 py-0.5 font-mono text-[10px] text-muted"
            >
              <Tag size={10} />
              <span>{lbl}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Footer Row: Metrics & Actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline/70 pt-4">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
          {/* Difficulty Badge */}
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] ${
              difficultyColors[issue.difficulty]
            }`}
          >
            {issue.difficulty}
          </span>

          {/* Scope & Estimated Time */}
          <span className="inline-flex items-center gap-1" title="Estimated effort">
            <Clock size={13} />
            <span>~{issue.estimatedHours}h</span>
          </span>

          {/* Discussion Comments */}
          <span className="inline-flex items-center gap-1" title="Discussion count">
            <MessageSquare size={13} />
            <span>{issue.commentsCount}</span>
          </span>

          {/* Mentor Indicator */}
          {issue.hasMentorAssigned && (
            <span
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"
              title="Dedicated mentor guidance available"
            >
              <CheckCircle2 size={13} />
              <span className="hidden sm:inline">Mentor Guide</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onToggleTrack && (
            <button
              type="button"
              onClick={() => onToggleTrack(issue)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isTracked
                  ? 'border-accent bg-accent text-white'
                  : 'border-hairline bg-surface hover:bg-surface-raised text-secondary hover:text-primary'
              }`}
              title={isTracked ? 'Task tracked in your Kanban radar' : 'Track in your personal task radar'}
            >
              {isTracked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              <span>{isTracked ? (currentStatus ? statusLabels[currentStatus] : 'Tracked') : 'Track Task'}</span>
            </button>
          )}

          <a
            href={issue.issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl border border-hairline bg-surface-raised px-3 py-1.5 font-mono text-xs font-bold text-primary hover:bg-hairline transition-colors"
          >
            <span>Solve Issue</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </article>
  );
}
