'use client';

import React, { useState } from 'react';
import {
  CornerDownRight,
  MessageSquare,
  Quote,
  Send,
} from 'lucide-react';
import type {
  AnnotationReply,
  AnnotationStatus,
  ProposalAnnotation,
} from '@/lib/proposal-studio/review-types';

interface AnnotationThreadProps {
  annotation: ProposalAnnotation;
  proposalId: string;
  canComment: boolean;
  onStatusChange: (annotationId: string, status: AnnotationStatus) => void;
  onReplyAdded: (annotationId: string, reply: AnnotationReply) => void;
}

export function AnnotationThread({
  annotation,
  proposalId,
  canComment,
  onStatusChange,
  onReplyAdded,
}: AnnotationThreadProps) {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleStatusChange = async (newStatus: AnnotationStatus) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/review/annotations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annotationId: annotation.id,
          status: newStatus,
        }),
      });
      if (res.ok) {
        onStatusChange(annotation.id, newStatus);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/review/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annotationId: annotation.id,
          authorName: 'Contributor',
          replyContent: replyText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onReplyAdded(annotation.id, data.annotation);
        setReplyText('');
        setShowReplyForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const roleBadgeColor =
    annotation.authorRole === 'mentor'
      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20'
      : annotation.authorRole === 'alumnus'
      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
      : 'bg-page text-muted border-hairline';

  const statusBadgeColor =
    annotation.status === 'resolved'
      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
      : annotation.status === 'addressed'
      ? 'bg-cyan-500/15 text-cyan-500 border-cyan-500/20'
      : 'bg-amber-500/15 text-amber-500 border-amber-500/20';

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-4 space-y-3 shadow-xs">
      {/* Thread Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-page border border-hairline flex items-center justify-center text-muted font-bold text-xs">
            {annotation.authorName.charAt(0)}
          </div>
          <span className="font-heading font-bold text-xs text-primary">
            {annotation.authorName}
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${roleBadgeColor}`}>
            {annotation.authorRole}
          </span>
        </div>

        {/* Status Dropdown / Badge */}
        <div className="flex items-center gap-1.5">
          <select
            value={annotation.status}
            onChange={(e) => handleStatusChange(e.target.value as AnnotationStatus)}
            className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold uppercase cursor-pointer focus:outline-none ${statusBadgeColor}`}
          >
            <option value="open">Open</option>
            <option value="addressed">Addressed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Quoted Text if selected */}
      {annotation.selectedText && (
        <div className="rounded-xl border-l-2 border-accent bg-accent/5 p-2.5 text-[11px] font-mono text-muted italic flex items-start gap-1.5">
          <Quote className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <span className="line-clamp-2">“{annotation.selectedText}”</span>
        </div>
      )}

      {/* Comment Body */}
      <p className="text-xs font-mono text-secondary leading-relaxed">
        {annotation.content}
      </p>

      {/* Replies Thread */}
      {annotation.replies && annotation.replies.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-hairline/60">
          {annotation.replies.map((rep) => (
            <div
              key={rep.id}
              className="flex items-start gap-2 rounded-xl bg-page/60 p-2 text-xs font-mono"
            >
              <CornerDownRight className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-primary text-[11px]">{rep.authorName}:</span>
                <p className="text-secondary text-[11px] leading-relaxed">{rep.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Action */}
      {canComment && (
        <div className="pt-2 border-t border-hairline/40">
          {showReplyForm ? (
            <form onSubmit={handleSendReply} className="space-y-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply to the reviewer…"
                autoFocus
                className="w-full rounded-xl border border-hairline bg-page px-3 py-1.5 font-mono text-xs text-primary focus:border-accent focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-2.5 py-1 rounded-lg font-mono text-[11px] text-muted hover:text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-accent text-white font-mono text-[11px] font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowReplyForm(true)}
              className="text-[11px] font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Reply to thread</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
