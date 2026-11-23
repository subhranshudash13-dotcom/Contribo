'use client';

import React, { useState } from 'react';
import { Bell, Clock, Calendar, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import type { ReminderOffset } from '@/lib/reminders/types';

export interface DeadlineReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  programSlug: string;
  milestoneId: string;
  milestoneLabel: string;
  deadlineIso: string;
  existingSubscriptionId?: string | null;
  onSubscribed?: () => void;
  onCancelled?: () => void;
}

const AVAILABLE_OFFSETS: { label: string; offset: ReminderOffset; description: string }[] = [
  { label: '7 days before', offset: '7d', description: 'Early heads-up to finalize proposal drafts' },
  { label: '2 days before', offset: '2d', description: 'Crucial reminder to gather reviews and proofs' },
  { label: '24 hours before', offset: '24h', description: 'Final call before portal cutoff' },
  { label: '2 hours before', offset: '2h', description: 'Immediate alert to avoid last-minute server congestion' },
];

export function DeadlineReminderModal({
  isOpen,
  onClose,
  programSlug,
  milestoneId,
  milestoneLabel,
  deadlineIso,
  existingSubscriptionId = null,
  onSubscribed,
  onCancelled,
}: DeadlineReminderModalProps) {
  const [selectedOffsets, setSelectedOffsets] = useState<ReminderOffset[]>(['7d', '2d', '24h']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const deadlineDate = new Date(deadlineIso);
  const formattedUtc = isNaN(deadlineDate.getTime())
    ? 'TBD'
    : deadlineDate.toUTCString();

  const toggleOffset = (offset: ReminderOffset) => {
    if (selectedOffsets.includes(offset)) {
      if (selectedOffsets.length === 1) return; // Keep at least one
      setSelectedOffsets(selectedOffsets.filter((o) => o !== offset));
    } else {
      setSelectedOffsets([...selectedOffsets, offset]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programSlug,
          milestoneId,
          milestoneLabel,
          deadline: deadlineIso,
          offsets: selectedOffsets,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule deadline reminders');
      }

      setSuccessMsg(`Subscribed to ${data.scheduledJobsCount} reminder alerts!`);
      if (onSubscribed) onSubscribed();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!existingSubscriptionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/reminders/${existingSubscriptionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel reminder');
      }
      setSuccessMsg('Reminder subscription cancelled.');
      if (onCancelled) onCancelled();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Deadline Alerts & Reminders</h3>
            <p className="text-xs text-slate-400">Durable account-scoped scheduling outbox</p>
          </div>
        </div>

        <div className="p-3.5 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Milestone</p>
              <p className="text-sm font-semibold text-slate-200">{milestoneLabel}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Official Cutoff (UTC)</p>
              <p className="text-sm font-mono text-emerald-300">{formattedUtc}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Notification Windows
          </label>
          <div className="grid gap-2">
            {AVAILABLE_OFFSETS.map(({ label, offset, description }) => {
              const isChecked = selectedOffsets.includes(offset);
              return (
                <button
                  key={offset}
                  type="button"
                  onClick={() => toggleOffset(offset)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                    isChecked
                      ? 'bg-blue-600/15 border-blue-500/40 text-blue-200'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-slate-400">{description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isChecked
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          {existingSubscriptionId ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-50"
            >
              Cancel Subscription
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-lg transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || selectedOffsets.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            <span>Save Reminders</span>
          </button>
        </div>
      </div>
    </div>
  );
}
