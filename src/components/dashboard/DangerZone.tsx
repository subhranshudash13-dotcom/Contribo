'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function DangerZone() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Sign out and redirect to home
        await signOut({ callbackUrl: '/' });
      } else {
        setError(data.error || 'Failed to delete account. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-red-500/20 rounded-md p-6 mt-8">
      <div className="flex items-center gap-3 mb-4 text-red-500">
        <AlertTriangle size={20} />
        <h3 className="font-bold text-lg">Danger Zone</h3>
      </div>
      <p className="text-secondary text-sm mb-6 max-w-2xl leading-relaxed">
        Permanently delete your account and all associated data, including your saved projects, preferences, and tracking history. This action is irreversible.
      </p>

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-sm font-semibold rounded-md transition-all cursor-pointer"
        >
          Delete Account
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-primary">
            Are you absolutely sure you want to delete your account?
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-500/90 disabled:opacity-50 text-sm font-semibold rounded-md flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Yes, delete my account
            </button>
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="px-4 py-2 bg-surface border border-hairline text-primary hover:bg-surface-raised text-sm font-semibold rounded-md cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
