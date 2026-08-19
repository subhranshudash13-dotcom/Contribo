'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { friendlyApiMessage, deleteCurrentUser } from '@/lib/client/api';

const CONFIRM_WORD = 'DELETE';

export function DangerZone() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === CONFIRM_WORD;

  const reset = () => {
    setIsOpen(false);
    setConfirmText('');
    setError(null);
  };

  const handleDeleteAccount = async () => {
    if (!canDelete) {
      setError(`Type ${CONFIRM_WORD} exactly to confirm.`);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError('You are offline. Reconnect to delete your account.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await deleteCurrentUser();
      if (data.success) {
        await signOut({ callbackUrl: '/' });
      } else {
        setError('Failed to delete account. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      setError(friendlyApiMessage(e, 'An unexpected error occurred.'));
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-surface border border-red-500/20 rounded-2xl p-6 mt-8"
      role="region"
      aria-labelledby="danger-zone-heading"
    >
      <div className="flex items-center gap-3 mb-4 text-red-500">
        <AlertTriangle size={20} aria-hidden />
        <h3 id="danger-zone-heading" className="font-bold text-lg text-primary">
          Danger Zone
        </h3>
      </div>
      <p className="text-secondary text-sm mb-6 max-w-2xl leading-relaxed">
        Permanently delete your account and all associated data — saved projects, applications,
        proposal drafts, and preferences. This cannot be undone.
      </p>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-sm font-semibold rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          Delete Account
        </button>
      ) : (
        <div className="space-y-4 max-w-md">
          <p className="text-sm font-semibold text-primary">
            Type <span className="font-mono text-red-500">{CONFIRM_WORD}</span> to confirm permanent
            deletion.
          </p>
          <label className="block space-y-1.5">
            <span className="sr-only">Confirmation text</span>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder={CONFIRM_WORD}
              disabled={loading}
              className="w-full h-11 rounded-xl border border-hairline bg-page px-3 text-sm font-mono text-primary placeholder:text-muted focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
              aria-invalid={!!error}
              aria-describedby={error ? 'danger-zone-error' : undefined}
            />
          </label>
          {error && (
            <p id="danger-zone-error" className="text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              disabled={loading || !canDelete}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-500/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold rounded-md flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" aria-hidden />}
              {loading ? 'Deleting…' : 'Permanently delete account'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={loading}
              className="px-4 py-2 bg-surface border border-hairline text-primary hover:bg-surface-raised text-sm font-semibold rounded-md cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
