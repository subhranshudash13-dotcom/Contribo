'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Columns2,
  FileText,
  History,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import type { ProposalDraft } from '@/lib/proposal-studio/data';
import { BUILDER_SECTIONS } from '../constants';

export interface RevisionSummary {
  id: string;
  proposalId: string;
  userId: string;
  timestamp: string;
  source: 'autosave_checkpoint' | 'manual_snapshot' | 'pre_rollback_backup';
  label?: string;
  characterCount: number;
  wordCount: number;
  progress: number;
}

export interface DetailedRevision extends RevisionSummary {
  sections: Record<string, string>;
}

interface ProposalVersionModalProps {
  draft: ProposalDraft;
  onClose: () => void;
  onRestore: (sections: Record<string, string>) => void;
}

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recent';
  }
}

function countWords(text: string | undefined): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function totalWordsInSections(sections: Record<string, string> | undefined): number {
  if (!sections) return 0;
  return Object.values(sections).reduce((acc, t) => acc + countWords(t), 0);
}

export function ProposalVersionModal({
  draft,
  onClose,
  onRestore,
}: ProposalVersionModalProps) {
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected revision
  const [selectedRevId, setSelectedRevId] = useState<string>('current');
  const [selectedRevisionDetail, setSelectedRevisionDetail] = useState<DetailedRevision | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Checkpoint creation state
  const [showCheckpointInput, setShowCheckpointInput] = useState(false);
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [isCreatingCheckpoint, setIsCreatingCheckpoint] = useState(false);

  // Restore state
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  // Diff mode: 'compare' or 'snapshot'
  const [viewMode, setViewMode] = useState<'compare' | 'snapshot'>('compare');

  const currentTotalWords = useMemo(
    () => totalWordsInSections(draft.sections),
    [draft.sections]
  );

  const refreshRevisions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${draft.id}/revisions`);
      if (!res.ok) {
        throw new Error(`Failed to load revisions (${res.status})`);
      }
      const data = await res.json();
      setRevisions(data.revisions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch version history');
    } finally {
      setIsLoading(false);
    }
  }, [draft.id]);

  useEffect(() => {
    let isSubscribed = true;

    fetch(`/api/proposals/${draft.id}/revisions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load revisions (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isSubscribed) {
          setRevisions(data.revisions || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to fetch version history');
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [draft.id]);

  const handleSelectRevision = (revId: string) => {
    setSelectedRevId(revId);
    if (revId === 'current') {
      setSelectedRevisionDetail(null);
      setIsLoadingDetail(false);
    } else {
      setIsLoadingDetail(true);
    }
  };

  // Load detailed revision contents when selected
  useEffect(() => {
    if (selectedRevId === 'current') {
      return;
    }

    let isSubscribed = true;

    fetch(`/api/proposals/${draft.id}/revisions/${selectedRevId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load snapshot details');
        return res.json();
      })
      .then((data) => {
        if (isSubscribed) {
          setSelectedRevisionDetail(data.revision);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          console.error(err);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedRevId, draft.id]);

  const handleCreateCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingCheckpoint) return;

    setIsCreatingCheckpoint(true);
    try {
      const label = checkpointLabel.trim() || 'Manual Checkpoint';
      const res = await fetch(`/api/proposals/${draft.id}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, sections: draft.sections }),
      });

      if (!res.ok) {
        throw new Error('Failed to create snapshot');
      }

      setCheckpointLabel('');
      setShowCheckpointInput(false);
      await refreshRevisions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating snapshot checkpoint');
    } finally {
      setIsCreatingCheckpoint(false);
    }
  };

  const handleRestore = async (revisionId: string) => {
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/proposals/${draft.id}/revisions/${revisionId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Rollback failed');
      }

      const data = await res.json();
      if (data.proposal?.sections) {
        onRestore(data.proposal.sections);
      }
      setConfirmRestoreId(null);
      await refreshRevisions();
      handleSelectRevision('current');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error restoring version');
    } finally {
      setIsRestoring(false);
    }
  };

  const getSourceBadge = (source: RevisionSummary['source']) => {
    switch (source) {
      case 'manual_snapshot':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
            <Tag size={10} /> Checkpoint
          </span>
        );
      case 'pre_rollback_backup':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-500">
            <RotateCcw size={10} /> Safety Backup
          </span>
        );
      case 'autosave_checkpoint':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-page px-2 py-0.5 font-mono text-[10px] font-medium text-muted">
            <Clock size={10} /> Auto-Save
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="flex flex-col w-full max-w-5xl h-[88vh] rounded-3xl border border-hairline bg-surface shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <History size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-primary">
                  Proposal Version History & Time-Machine
                </h3>
                <span className="rounded-lg border border-hairline bg-page px-2 py-0.5 font-mono text-[11px] font-bold text-muted">
                  Max 20 Bounded
                </span>
              </div>
              <p className="font-mono text-xs text-muted">
                {draft.projectTitle} · Restore past snapshots non-destructively
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshRevisions}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-page text-muted hover:text-primary transition-colors cursor-pointer"
              title="Refresh revision history"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-page text-muted hover:text-primary transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Revision List (Left) & Comparison / Preview (Right) */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-hairline">
          {/* Left Column: Revision Timeline & Checkpoint Creator */}
          <div className="w-full lg:w-80 flex flex-col bg-page/50">
            {/* Create Checkpoint Banner */}
            <div className="p-3 border-b border-hairline bg-surface/50">
              {showCheckpointInput ? (
                <form onSubmit={handleCreateCheckpoint} className="space-y-2">
                  <input
                    type="text"
                    value={checkpointLabel}
                    onChange={(e) => setCheckpointLabel(e.target.value)}
                    placeholder="Checkpoint name (e.g. Mentor Feedback)"
                    maxLength={100}
                    autoFocus
                    className="w-full rounded-xl border border-hairline bg-page px-3 py-1.5 font-mono text-xs text-primary focus:border-accent focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCheckpointInput(false)}
                      className="rounded-lg px-2.5 py-1 font-mono text-xs text-muted hover:text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingCheckpoint}
                      className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1 font-mono text-xs font-bold text-white hover:bg-accent-hover disabled:opacity-50"
                    >
                      {isCreatingCheckpoint ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCheckpointInput(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/40 bg-accent/5 px-3 py-2 font-mono text-xs font-bold text-accent hover:bg-accent/10 transition-all cursor-pointer"
                >
                  <Plus size={14} /> Save Named Checkpoint
                </button>
              )}
            </div>

            {/* Revisions Scrollable Timeline */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Current Active Live State */}
              <button
                type="button"
                onClick={() => handleSelectRevision('current')}
                className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedRevId === 'current'
                    ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30'
                    : 'border-hairline bg-surface hover:bg-surface-raised'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-heading text-xs font-bold text-primary">
                      Current Live Draft
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted">Editing now</span>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted">
                  <span>{currentTotalWords} words</span>
                  <span className="text-emerald-500 font-bold">{draft.progress}% complete</span>
                </div>
              </button>

              {/* Historical Snapshots */}
              {isLoading && revisions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-2 text-muted">
                  <Loader2 size={24} className="animate-spin text-accent" />
                  <p className="font-mono text-xs">Loading snapshot history...</p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                  <AlertCircle size={20} className="mx-auto text-red-500 mb-1" />
                  <p className="font-mono text-xs text-red-400">{error}</p>
                </div>
              ) : revisions.length === 0 ? (
                <div className="p-6 text-center text-muted">
                  <History size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="font-mono text-xs">No prior snapshots recorded yet.</p>
                  <p className="font-mono text-[10px] mt-1 text-muted/80">
                    Snapshots are saved automatically when drafting or manually via checkpoints.
                  </p>
                </div>
              ) : (
                revisions.map((rev) => {
                  const isSelected = selectedRevId === rev.id;
                  const wordDelta = (rev.wordCount || 0) - currentTotalWords;

                  return (
                    <button
                      key={rev.id}
                      type="button"
                      onClick={() => handleSelectRevision(rev.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30'
                          : 'border-hairline bg-surface hover:bg-surface-raised'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-xs font-bold text-primary truncate max-w-[150px]">
                          {rev.label || 'Checkpoint'}
                        </span>
                        {getSourceBadge(rev.source)}
                      </div>

                      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted">
                        <span>{formatRelativeTime(rev.timestamp)}</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{rev.wordCount} words</span>
                          {wordDelta !== 0 && (
                            <span
                              className={`rounded px-1 text-[9px] ${
                                wordDelta > 0
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                            >
                              {wordDelta > 0 ? `+${wordDelta}` : wordDelta}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Diff / Snapshot Preview Canvas */}
          <div className="flex-1 flex flex-col bg-surface overflow-hidden">
            {/* Action Bar for Selected Snapshot */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-hairline bg-surface-raised/20">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-secondary">
                  {selectedRevId === 'current'
                    ? 'Viewing Current Working Draft'
                    : `Snapshot: ${selectedRevisionDetail?.label || 'Revision Detail'}`}
                </span>

                {selectedRevId !== 'current' && (
                  <div className="inline-flex items-center rounded-xl border border-hairline bg-page p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('compare')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all cursor-pointer ${
                        viewMode === 'compare'
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-muted hover:text-primary'
                      }`}
                    >
                      <Columns2 size={12} /> Side-by-Side Diff
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('snapshot')}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all cursor-pointer ${
                        viewMode === 'snapshot'
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-muted hover:text-primary'
                      }`}
                    >
                      <FileText size={12} /> Snapshot Only
                    </button>
                  </div>
                )}
              </div>

              {/* Restore Button */}
              {selectedRevId !== 'current' && selectedRevisionDetail && (
                <div>
                  {confirmRestoreId === selectedRevId ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-500 font-bold">
                        Confirm Rollback?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRestore(selectedRevId)}
                        disabled={isRestoring}
                        className="inline-flex items-center gap-1 rounded-xl bg-amber-600 hover:bg-amber-500 px-3 py-1.5 font-mono text-xs font-bold uppercase text-white shadow-md transition-all cursor-pointer"
                      >
                        {isRestoring ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        Yes, Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRestoreId(null)}
                        className="rounded-xl border border-hairline bg-page px-2 py-1 font-mono text-xs text-muted hover:text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRestoreId(selectedRevId)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-1.5 font-mono text-xs font-bold uppercase text-white hover:bg-accent-hover shadow-sm transition-all cursor-pointer"
                    >
                      <RotateCcw size={13} /> Roll Back to this Version
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sections Content Scrollable View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedRevId === 'current' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={18} className="text-emerald-400" />
                      <div>
                        <h4 className="font-heading text-sm font-bold text-emerald-400">
                          Active Working Copy
                        </h4>
                        <p className="font-mono text-xs text-muted">
                          Select any past checkpoint on the left to inspect differences or roll back.
                        </p>
                      </div>
                    </div>
                  </div>

                  {BUILDER_SECTIONS.map((sec) => {
                    const content = draft.sections[sec.id] || '';
                    return (
                      <div
                        key={sec.id}
                        className="rounded-2xl border border-hairline bg-page p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-hairline pb-2">
                          <span className="font-mono text-xs font-bold text-accent">
                            {sec.title}
                          </span>
                          <span className="font-mono text-[11px] text-muted">
                            {countWords(content)} words · {content.length} chars
                          </span>
                        </div>
                        <p className="font-mono text-xs text-primary whitespace-pre-wrap leading-relaxed">
                          {content || <span className="text-muted italic">(empty section)</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3 text-muted">
                  <Loader2 size={32} className="animate-spin text-accent" />
                  <p className="font-mono text-xs">Loading snapshot sections...</p>
                </div>
              ) : selectedRevisionDetail ? (
                <div className="space-y-6">
                  {BUILDER_SECTIONS.map((sec) => {
                    const snapContent = selectedRevisionDetail.sections[sec.id] || '';
                    const currentContent = draft.sections[sec.id] || '';
                    const isDifferent = snapContent !== currentContent;
                    const wordDiff = countWords(snapContent) - countWords(currentContent);

                    return (
                      <div
                        key={sec.id}
                        className={`rounded-2xl border transition-all ${
                          isDifferent
                            ? 'border-accent/40 bg-accent/5'
                            : 'border-hairline bg-page'
                        } p-4 space-y-3`}
                      >
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-hairline pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-accent">
                              {sec.title}
                            </span>
                            {isDifferent ? (
                              <span className="rounded-md bg-accent/20 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                                Modified ({wordDiff >= 0 ? `+${wordDiff}` : wordDiff} words)
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-muted">
                                Identical
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-muted">
                            Snapshot: {countWords(snapContent)} words
                          </span>
                        </div>

                        {/* Content View: Side-by-Side vs Snapshot-Only */}
                        {viewMode === 'compare' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Historical Version */}
                            <div className="rounded-xl border border-hairline bg-surface p-3 space-y-1">
                              <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider">
                                Snapshot Version ({formatRelativeTime(selectedRevisionDetail.timestamp)})
                              </span>
                              <p className="font-mono text-xs text-primary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                {snapContent || <span className="text-muted italic">(empty in snapshot)</span>}
                              </p>
                            </div>

                            {/* Current Active Version */}
                            <div className="rounded-xl border border-hairline bg-surface p-3 space-y-1">
                              <span className="font-mono text-[10px] font-bold text-muted uppercase tracking-wider">
                                Current Active Version
                              </span>
                              <p className="font-mono text-xs text-primary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                {currentContent || <span className="text-muted italic">(currently empty)</span>}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-hairline bg-surface p-3">
                            <p className="font-mono text-xs text-primary whitespace-pre-wrap leading-relaxed">
                              {snapContent || <span className="text-muted italic">(empty section)</span>}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
