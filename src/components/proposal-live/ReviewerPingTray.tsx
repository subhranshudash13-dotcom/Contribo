'use client';

import React, { useState } from 'react';
import type { ReviewerFeedbackPing } from '@/lib/proposal-live/types';
import { MessageSquarePlus, CheckCircle, Clock } from 'lucide-react';

interface ReviewerPingTrayProps {
  pings: ReviewerFeedbackPing[];
  activeSectionId: string;
  onAddPing: (message: string, selectedText?: string) => Promise<void>;
  onTogglePingStatus: (pingId: string, status: 'open' | 'resolved') => Promise<void>;
}

export function ReviewerPingTray({
  pings,
  activeSectionId,
  onAddPing,
  onTogglePingStatus,
}: ReviewerPingTrayProps) {
  const [newPingText, setNewPingText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sectionPings = pings.filter((p) => p.sectionId === activeSectionId);
  const openCount = sectionPings.filter((p) => p.status === 'open').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPingText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAddPing(newPingText.trim());
      setNewPingText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Mentor Feedback & Reactions (#{activeSectionId})
          </h3>
        </div>
        <span className="text-xs bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2 py-0.5 rounded-full font-medium">
          {openCount} Open
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newPingText}
          onChange={(e) => setNewPingText(e.target.value)}
          placeholder={`Add feedback note on #${activeSectionId}...`}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newPingText.trim() || submitting}
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          {submitting ? 'Posting...' : 'Post Note'}
        </button>
      </form>

      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
        {sectionPings.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-4 bg-zinc-950/40 rounded-lg border border-dashed border-zinc-800">
            No feedback pings for this section yet.
          </div>
        ) : (
          sectionPings.map((ping) => {
            const isOpen = ping.status === 'open';
            return (
              <div
                key={ping.id}
                className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1.5 transition-all ${
                  isOpen
                    ? 'bg-zinc-950 border-purple-900/40'
                    : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                    <span className="text-purple-400">{ping.authorName}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-bold">
                      {ping.authorRole}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTogglePingStatus(ping.id, isOpen ? 'resolved' : 'open')}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    {isOpen ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-zinc-500 hover:text-emerald-400" />
                        <span>Resolve</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-400">Resolved</span>
                      </>
                    )}
                  </button>
                </div>

                {ping.selectedText && (
                  <div className="border-l-2 border-purple-500/50 pl-2 text-[11px] text-zinc-400 italic">
                    &ldquo;{ping.selectedText}&rdquo;
                  </div>
                )}

                <p className="text-zinc-300 leading-relaxed">{ping.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
