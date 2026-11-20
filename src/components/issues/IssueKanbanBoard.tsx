'use client';

import React from 'react';
import {
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Trash2,
  CheckCircle,
  Compass,
} from 'lucide-react';
import type { TrackedTask, ContributionStatus } from '@/lib/issues/types';

interface IssueKanbanBoardProps {
  tasks: TrackedTask[];
  onUpdateStatus: (issueId: string, status: ContributionStatus) => void;
  onRemoveTask: (issueId: string) => void;
  onUpdatePrUrl: (issueId: string, prUrl: string) => void;
  onExploreMore: () => void;
}

const COLUMNS: { id: ContributionStatus; label: string; description: string }[] = [
  { id: 'discovered', label: 'Discovered', description: 'Bookmarked for research' },
  { id: 'claimed', label: 'Claimed', description: 'Assigned or requested' },
  { id: 'in-progress', label: 'In Progress', description: 'Actively coding branch' },
  { id: 'pr-submitted', label: 'PR Submitted', description: 'Review in progress' },
  { id: 'merged', label: 'Merged', description: 'Landed in upstream' },
];

export function IssueKanbanBoard({
  tasks,
  onUpdateStatus,
  onRemoveTask,
  onUpdatePrUrl,
  onExploreMore,
}: IssueKanbanBoardProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-hairline bg-surface p-12 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-surface-raised text-accent">
          <Compass size={28} />
        </div>
        <div className="max-w-md space-y-1">
          <h3 className="font-heading text-lg font-bold text-primary">Your Task Radar is Empty</h3>
          <p className="font-body text-xs sm:text-sm text-secondary">
            Bookmark good first issues from the directory to track your open source journey from claim to merged PR.
          </p>
        </div>
        <button
          type="button"
          onClick={onExploreMore}
          className="rounded-xl bg-accent px-5 py-2.5 font-mono text-xs font-bold text-white hover:bg-accent-hover transition-colors shadow-xs cursor-pointer"
        >
          Explore Beginner Issues
        </button>
      </div>
    );
  }

  const getNextStatus = (current: ContributionStatus): ContributionStatus | null => {
    const order: ContributionStatus[] = ['discovered', 'claimed', 'in-progress', 'pr-submitted', 'merged'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: ContributionStatus): ContributionStatus | null => {
    const order: ContributionStatus[] = ['discovered', 'claimed', 'in-progress', 'pr-submitted', 'merged'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="space-y-6">
      {/* Top Radar Overview Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface p-4 sm:p-5">
        <div>
          <h3 className="font-heading text-base font-bold text-primary">Active Contribution Pipeline</h3>
          <p className="font-mono text-xs text-muted">
            Tracking {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} across {new Set(tasks.map((t) => t.issue.orgSlug)).size} organizations
          </p>
        </div>
        <button
          type="button"
          onClick={onExploreMore}
          className="rounded-xl border border-hairline bg-surface-raised px-4 py-2 font-mono text-xs font-bold text-primary hover:bg-hairline transition-colors cursor-pointer"
        >
          + Add More Issues
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-hairline bg-surface/80 p-3.5 space-y-3 min-h-[350px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-hairline/60 pb-2.5">
                <div>
                  <h4 className="font-mono text-xs font-bold text-primary">{col.label}</h4>
                  <p className="font-mono text-[10px] text-muted">{col.description}</p>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised border border-hairline font-mono text-[11px] font-bold text-secondary">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards in Column */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTasks.map((item) => {
                  const next = getNextStatus(item.status);
                  const prev = getPrevStatus(item.status);

                  return (
                    <div
                      key={item.issueId}
                      className="group relative rounded-xl border border-hairline bg-surface p-3.5 space-y-2.5 shadow-xs hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-mono text-[10px] font-semibold text-accent uppercase">
                          {item.issue.program}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveTask(item.issueId)}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-rose-500 transition-opacity p-0.5 cursor-pointer"
                          title="Remove from task radar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <h5 className="font-heading text-xs font-bold text-primary line-clamp-2 leading-snug">
                        <a
                          href={item.issue.issueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-accent transition-colors"
                        >
                          {item.issue.title}
                        </a>
                      </h5>

                      <div className="flex items-center justify-between font-mono text-[10px] text-muted">
                        <span className="truncate max-w-[100px]">{item.issue.orgName}</span>
                        <span>~{item.issue.estimatedHours}h</span>
                      </div>

                      {/* PR Input on PR-Submitted Column */}
                      {item.status === 'pr-submitted' && (
                        <div className="pt-1">
                          <input
                            type="url"
                            placeholder="PR link (e.g. github.com/.../pull/12)"
                            value={item.prUrl || ''}
                            onChange={(e) => onUpdatePrUrl(item.issueId, e.target.value)}
                            className="w-full rounded-lg border border-hairline bg-surface-raised px-2 py-1 font-mono text-[10px] text-primary placeholder:text-muted focus:border-accent focus:outline-hidden"
                          />
                        </div>
                      )}

                      {/* Move Column Controls */}
                      <div className="flex items-center justify-between border-t border-hairline/60 pt-2">
                        {prev ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(item.issueId, prev)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-hairline bg-surface-raised text-muted hover:text-primary transition-colors cursor-pointer"
                            title={`Move back to ${prev}`}
                          >
                            <ChevronLeft size={13} />
                          </button>
                        ) : (
                          <div className="h-6 w-6" />
                        )}

                        <a
                          href={item.issue.issueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-accent hover:underline"
                        >
                          <span>Issue #{item.issue.number}</span>
                          <ExternalLink size={10} />
                        </a>

                        {next ? (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(item.issueId, next)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-hairline bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer"
                            title={`Move to ${next}`}
                          >
                            <ChevronRight size={13} />
                          </button>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center text-emerald-500" title="Complete!">
                            <CheckCircle size={15} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-hairline/60 p-2 text-center font-mono text-[11px] text-muted/60">
                    No tasks in {col.label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
