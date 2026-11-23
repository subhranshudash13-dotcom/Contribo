'use client';

import React from 'react';
import type { ProposalRevisionSnapshot } from '@/lib/proposal-live/types';
import { History, RotateCcw, Clock } from 'lucide-react';

interface RevisionHistoryTimelineProps {
  revisions: ProposalRevisionSnapshot[];
  onRollback: (revisionId: string) => Promise<void>;
  rollingBackId: string | null;
}

export function RevisionHistoryTimeline({
  revisions,
  onRollback,
  rollingBackId,
}: RevisionHistoryTimelineProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Revision Snapshot History</h3>
        </div>
        <span className="text-xs text-zinc-500 font-mono">{revisions.length} Snapshots</span>
      </div>

      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {revisions.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-4 bg-zinc-950/40 rounded-lg border border-dashed border-zinc-800">
            No revisions recorded yet.
          </div>
        ) : (
          revisions.map((rev) => {
            const isRollingBack = rollingBackId === rev.revisionId;
            const isAddition = rev.charDelta > 0;
            const deltaColor =
              rev.charDelta === 0
                ? 'text-zinc-500'
                : isAddition
                ? 'text-emerald-400'
                : 'text-rose-400';

            return (
              <div
                key={rev.revisionId}
                className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200">{rev.authorName}</span>
                    <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                      #{rev.sectionId}
                    </span>
                    <span className={`font-mono text-[10px] font-semibold ${deltaColor}`}>
                      {rev.charDelta > 0 ? `+${rev.charDelta}` : rev.charDelta} chars
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{new Date(rev.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{rev.summary}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRollback(rev.revisionId)}
                  disabled={isRollingBack}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 hover:text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isRollingBack ? 'Restoring...' : 'Rollback'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
