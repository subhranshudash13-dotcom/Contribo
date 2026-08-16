'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, Loader2, ListPlus, Check } from 'lucide-react';
import {
  ApiError,
  friendlyApiMessage,
  saveUserItem,
  unsaveUserItem,
  createUserApplication,
  type SaveItemPayload,
  type TrackApplicationPayload,
} from '@/lib/client/api';
import { useNetwork } from '@/components/ui/NetworkProvider';

type SavePayload = SaveItemPayload;
type TrackPayload = TrackApplicationPayload;

export function SaveButton({
  payload,
  initialSaved = false,
  size = 'sm',
  className = '',
}: {
  payload: SavePayload;
  initialSaved?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const router = useRouter();
  const { isOnline } = useNetwork();
  const [saved, setSaved] = useState(initialSaved);
  const [prevInitialSaved, setPrevInitialSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (initialSaved !== prevInitialSaved) {
    setPrevInitialSaved(initialSaved);
    setSaved(initialSaved);
  }

  const toggle = useCallback(async () => {
    if (!isOnline) {
      setError('You are offline. Reconnect to save items.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (saved) {
        await unsaveUserItem({ type: payload.type, targetId: payload.targetId });
        setSaved(false);
      } else {
        await saveUserItem(payload);
        setSaved(true);
      }
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        return;
      }
      setError(friendlyApiMessage(e, 'Could not update saved item'));
    } finally {
      setLoading(false);
    }
  }, [saved, payload, router, isOnline]);

  const pad = size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm';

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        disabled={loading || !payload.targetId}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save item'}
        className={`inline-flex items-center gap-1.5 rounded-lg border font-mono uppercase tracking-wide font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-50 ${pad} ${
          saved
            ? 'bg-brass/10 border-brass/40 text-brass'
            : 'bg-base border-hairline text-muted hover:text-primary hover:border-brass/40'
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : saved ? (
          <BookmarkCheck size={14} />
        ) : (
          <Bookmark size={14} />
        )}
        {saved ? 'Saved' : 'Save'}
      </button>
      {error && (
        <span className="text-[10px] text-alert font-mono max-w-[140px] leading-tight">{error}</span>
      )}
    </div>
  );
}

export function TrackApplicationButton({
  payload,
  className = '',
  label = 'Track application',
  initialTracked = false,
}: {
  payload: TrackPayload;
  className?: string;
  label?: string;
  initialTracked?: boolean;
}) {
  const router = useRouter();
  const { isOnline } = useNetwork();
  const [tracked, setTracked] = useState(initialTracked);
  const [prevInitialTracked, setPrevInitialTracked] = useState(initialTracked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (initialTracked !== prevInitialTracked) {
    setPrevInitialTracked(initialTracked);
    setTracked(initialTracked);
  }

  const track = useCallback(async () => {
    if (tracked) {
      router.push('/dashboard');
      return;
    }
    if (!isOnline) {
      setError('You are offline. Reconnect to track applications.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createUserApplication({
        ...payload,
        status: payload.status || 'researching',
      });
      setTracked(true);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        return;
      }
      setError(friendlyApiMessage(e, 'Could not track application'));
    } finally {
      setLoading(false);
    }
  }, [tracked, payload, router, isOnline]);

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={track}
        disabled={loading}
        aria-label={tracked ? 'Open dashboard' : label}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-mono uppercase tracking-wide font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-50 ${
          tracked
            ? 'bg-merge/10 border-merge/40 text-merge'
            : 'bg-base border-hairline text-muted hover:text-primary hover:border-merge/40'
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : tracked ? (
          <Check size={14} />
        ) : (
          <ListPlus size={14} />
        )}
        {tracked ? 'Tracked' : label}
      </button>
      {error && (
        <span className="text-[10px] text-alert font-mono max-w-[160px] leading-tight">{error}</span>
      )}
    </div>
  );
}
