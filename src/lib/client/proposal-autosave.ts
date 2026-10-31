'use client';

/**
 * Local mirror of proposal draft text, so a crashed tab or a dropped
 * connection does not cost the applicant the paragraph they were writing.
 *
 * Entries are scoped per draft id — two drafts in the same browser must never
 * read each other's buffer — and a snapshot only ever counts as "worth
 * recovering" when its text actually differs from the cloud copy.
 */

export const AUTOSAVE_KEY_PREFIX = 'contribo_proposal_autosave_v1_';
export const AUTOSAVE_DEBOUNCE_MS = 2500;
/** Guard against an unbounded blob from a paste marathon; the cloud limit is larger. */
export const AUTOSAVE_MAX_SECTION_CHARS = 60_000;

export interface LocalDraftSnapshot {
  draftId: string;
  /** ISO timestamp of when the browser last wrote this buffer. */
  savedAt: string;
  sections: Record<string, string>;
}

type LocalStorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function storage(): LocalStorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    // Private mode / disabled storage: autosave is a bonus, never an error.
    return null;
  }
}

export function autosaveKeyFor(draftId: string | null | undefined): string | null {
  const id = typeof draftId === 'string' ? draftId.trim() : '';
  if (!id || id.length > 200 || /[\s/]/.test(id)) return null;
  return `${AUTOSAVE_KEY_PREFIX}${id}`;
}

/** Only string sections survive; anything else is dropped rather than coerced. */
export function sanitizeSections(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value !== 'string') continue;
    if (!key.trim() || key === '__proto__' || key === 'constructor') continue;
    out[key] = value.slice(0, AUTOSAVE_MAX_SECTION_CHARS);
  }
  return out;
}

function hasAnyText(sections: Record<string, string>): boolean {
  return Object.values(sections).some((v) => v.trim().length > 0);
}

/**
 * Strict shape check: a buffer written by an older build, truncated by a quota
 * error, or tampered with must never be applied to a draft.
 */
export function parseSnapshot(raw: string | null): LocalDraftSnapshot | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const candidate = parsed as Record<string, unknown>;
  if (typeof candidate.draftId !== 'string' || !candidate.draftId) return null;
  if (typeof candidate.savedAt !== 'string' || !isoToDate(candidate.savedAt)) return null;
  const sections = sanitizeSections(candidate.sections);
  if (!hasAnyText(sections)) return null;
  return { draftId: candidate.draftId, savedAt: candidate.savedAt, sections };
}

export function readLocalSnapshot(draftId: string): LocalDraftSnapshot | null {
  const key = autosaveKeyFor(draftId);
  const store = storage();
  if (!key || !store) return null;
  let raw: string | null = null;
  try {
    raw = store.getItem(key);
  } catch {
    return null;
  }
  const snapshot = parseSnapshot(raw);
  // The key is scoped by id, so a mismatch means the value was not written by
  // this code path. Ignore it rather than mixing drafts.
  if (snapshot && snapshot.draftId !== draftId.trim()) return null;
  return snapshot;
}

export function writeLocalSnapshot(
  draftId: string,
  sections: Record<string, string>,
  now: Date = new Date()
): LocalDraftSnapshot | null {
  const key = autosaveKeyFor(draftId);
  const store = storage();
  if (!key || !store) return null;

  const clean = sanitizeSections(sections);
  if (!hasAnyText(clean)) {
    // An emptied draft should not leave a stale buffer that later "recovers"
    // deleted work.
    try {
      store.removeItem(key);
    } catch {
      /* ignore */
    }
    return null;
  }

  const snapshot: LocalDraftSnapshot = {
    draftId: draftId.trim(),
    savedAt: now.toISOString(),
    sections: clean,
  };
  try {
    store.setItem(key, JSON.stringify(snapshot));
    return snapshot;
  } catch {
    // Quota exceeded or storage disabled — the cloud save is unaffected.
    return null;
  }
}

export function clearLocalSnapshot(draftId: string): void {
  const key = autosaveKeyFor(draftId);
  const store = storage();
  if (!key || !store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

const ISO_LIKE =
  /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export function isoToDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' && ISO_LIKE.test(value.trim())) {
    const parsed = new Date(value.trim());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function sectionsDiffer(
  local: Record<string, string> | undefined,
  cloud: Record<string, string> | undefined
): boolean {
  const a = local || {};
  const b = cloud || {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] || '').trim() !== (b[key] || '').trim()) return true;
  }
  return false;
}

/**
 * Should the local buffer be offered for recovery?
 *
 * Identical text is never worth a banner. When the cloud copy carries a real
 * timestamp the buffer has to be newer than it; when it does not (seed drafts
 * still store prose like "2 hours ago"), a differing buffer is shown rather
 * than silently discarded — the user decides, because this is only ever a
 * prompt with Restore and Discard.
 */
export function hasNewerLocalWork(
  local: LocalDraftSnapshot | null,
  cloudSections: Record<string, string> | undefined,
  cloudUpdatedAt: unknown
): boolean {
  if (!local || !hasAnyText(local.sections)) return false;
  if (!sectionsDiffer(local.sections, cloudSections)) return false;
  const cloudAt = isoToDate(cloudUpdatedAt);
  if (!cloudAt) return true;
  const localAt = isoToDate(local.savedAt);
  if (!localAt) return false;
  return localAt.getTime() > cloudAt.getTime();
}

/** 24-hour clock for the "Auto-saved locally (14:32)" pill. */
export function formatLocalSaveClock(value: unknown): string {
  const date = isoToDate(value);
  if (!date) return '';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Content signature that decides whether a keystroke actually changed anything.
 * Key order is normalised so two runs of the same text compare equal even if
 * the server and the client enumerate sections differently.
 */
export function sectionsSignature(
  draftId: string,
  sections: Record<string, string> | undefined
): string {
  const clean = sanitizeSections(sections);
  const keys = Object.keys(clean).sort();
  return `${draftId}|${keys.map((k) => `${k}:${clean[k].length}:${hashText(clean[k])}`).join('|')}`;
}

function hashText(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface AutoSaveScheduler {
  /** Buffer `sections` for `draftId`; the write happens one quiet period later. */
  schedule(draftId: string, sections: Record<string, string>): void;
  /**
   * Write whatever is buffered, now — used on tab hide, unload and draft
   * switch. `notify: false` skips the callback, for teardown paths that must
   * not touch component state.
   */
  flush(options?: { notify?: boolean }): LocalDraftSnapshot | null;
  cancel(): void;
  isPending(): boolean;
}

/**
 * The debounce lives here rather than inside the hook so its ordering can be
 * reasoned about (and driven) without a React renderer: `setTimer`/`clearTimer`
 * are injectable, and the payload is captured at schedule time so a timer can
 * never write one draft into another draft's slot.
 */
export function createAutoSaveScheduler(options: {
  delayMs?: number;
  setTimer?: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (handle: ReturnType<typeof setTimeout>) => void;
  onScheduled?: () => void;
  onWritten?: (snapshot: LocalDraftSnapshot) => void;
}): AutoSaveScheduler {
  const delayMs = options.delayMs ?? AUTOSAVE_DEBOUNCE_MS;
  const setTimer = options.setTimer ?? ((cb, ms) => setTimeout(cb, ms));
  const clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle));

  let handle: ReturnType<typeof setTimeout> | null = null;
  let pending: { draftId: string; sections: Record<string, string> } | null = null;

  function flush(flushOptions?: { notify?: boolean }): LocalDraftSnapshot | null {
    if (handle !== null) {
      clearTimer(handle);
      handle = null;
    }
    const buffered = pending;
    pending = null;
    if (!buffered) return null;
    const snapshot = writeLocalSnapshot(buffered.draftId, buffered.sections);
    // `options` is the scheduler's own config; only `notify` comes from the
    // caller, so reading either from the wrong object is a bug waiting to happen.
    if (snapshot && flushOptions?.notify !== false) options.onWritten?.(snapshot);
    return snapshot;
  }

  return {
    schedule(draftId, sections) {
      const id = draftId.trim();
      const key = autosaveKeyFor(id);
      if (!key) return;
      // Switching drafts mid-debounce: the previous draft's text has to reach
      // its own slot first, or it is lost to the new buffer.
      if (pending && pending.draftId !== id) flush();
      pending = { draftId: id, sections };
      if (options.onScheduled) options.onScheduled();
      if (handle !== null) clearTimer(handle);
      handle = setTimer(() => {
        handle = null;
        flush();
      }, delayMs);
    },
    flush,
    cancel() {
      pending = null;
      if (handle !== null) {
        clearTimer(handle);
        handle = null;
      }
    },
    isPending() {
      return pending !== null;
    },
  };
}
