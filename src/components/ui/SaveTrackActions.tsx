'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, BookmarkCheck, Loader2, ListPlus, Check } from 'lucide-react';

type SavePayload = {
  type: 'project' | 'organization';
  targetId: string;
  title: string;
  subtitle?: string;
  slug?: string;
  programSlug?: string;
  techStack?: string[];
};

type TrackPayload = {
  projectId?: string;
  projectTitle: string;
  orgName: string;
  orgSlug?: string;
  programId?: string;
  programSlug?: string;
  programName?: string;
  status?: string;
  deadline?: string | null;
};

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data.error === 'string' ? data.error : res.statusText;
  } catch {
    return res.statusText || 'Request failed';
  }
}

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
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const toggle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (saved) {
        const qs = new URLSearchParams({
          type: payload.type,
          targetId: payload.targetId,
        });
        const res = await fetch(`/api/user/saved?${qs.toString()}`, {
          method: 'DELETE',
        });
        if (res.status === 401) {
          router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
          return;
        }
        if (!res.ok && res.status !== 404) {
          throw new Error(await parseError(res));
        }
        setSaved(false);
      } else {
        const res = await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
          return;
        }
        if (!res.ok) {
          throw new Error(await parseError(res));
        }
        setSaved(true);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update saved item');
    } finally {
      setLoading(false);
    }
  }, [saved, payload, router]);

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
  const [tracked, setTracked] = useState(initialTracked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setTracked(initialTracked);
  }, [initialTracked]);

  const track = useCallback(async () => {
    if (tracked) {
      router.push('/dashboard');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          status: payload.status || 'researching',
        }),
      });
      if (res.status === 401) {
        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        return;
      }
      if (!res.ok) {
        throw new Error(await parseError(res));
      }
      setTracked(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not track application');
    } finally {
      setLoading(false);
    }
  }, [tracked, payload, router]);

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
