'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createAutoSaveScheduler,
  sectionsSignature,
  type LocalDraftSnapshot,
} from '@/lib/client/proposal-autosave';

/**
 * Buffers the active draft's text to localStorage while the applicant types, so
 * a crash, a closed tab or a dropped connection cannot swallow the section they
 * were mid-sentence in. The buffer is written one quiet period after the last
 * keystroke rather than on every one.
 *
 * `enabled` must be false while a recovery prompt is still unanswered, or the
 * autosave would overwrite the very buffer being offered back to the user.
 */
export function useProposalAutoSave({
  draftId,
  sections,
  enabled = true,
  delayMs,
}: {
  draftId: string;
  sections: Record<string, string>;
  enabled?: boolean;
  delayMs?: number;
}) {
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);
  const schedulerRef = useRef<ReturnType<typeof createAutoSaveScheduler> | null>(null);

  if (schedulerRef.current === null) {
    schedulerRef.current = createAutoSaveScheduler({
      delayMs,
      onWritten: (snapshot: LocalDraftSnapshot) => setLastLocalSaveAt(snapshot.savedAt),
    });
  }

  // Signature instead of object identity: the store hands back a new sections
  // object on every keystroke, and only real text changes are worth a write.
  const signature = useMemo(
    () => sectionsSignature(draftId, sections),
    [draftId, sections]
  );

  useEffect(() => {
    const scheduler = schedulerRef.current;
    if (!scheduler || !enabled || !draftId) return;
    scheduler.schedule(draftId, sections);
    // `signature` is the dependency that actually matters; `sections` is read
    // through it so a re-render with identical text never re-arms the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, signature, enabled]);

  // Flush the buffered text when the tab is backgrounded or closed — the timer
  // may never get its quiet period.
  useEffect(() => {
    if (!enabled) return;
    const scheduler = schedulerRef.current;
    if (!scheduler) return;
    const onHide = () => {
      if (document.visibilityState === 'hidden') scheduler.flush();
    };
    const onUnload = () => scheduler.flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onUnload);
      scheduler.flush({ notify: false });
    };
  }, [enabled]);

  /** Force the buffered text out now, e.g. before a manual save or an export. */
  const flushNow = useCallback(() => {
    const snapshot = schedulerRef.current?.flush();
    if (snapshot) setLastLocalSaveAt(snapshot.savedAt);
  }, []);

  /**
   * Drop the buffered text without writing it — used when the draft it belongs
   * to is deleted, so a half-finished timer cannot resurrect a removed buffer.
   */
  const discardPending = useCallback(() => {
    schedulerRef.current?.cancel();
  }, []);

  return { lastLocalSaveAt, flushNow, discardPending };
}
