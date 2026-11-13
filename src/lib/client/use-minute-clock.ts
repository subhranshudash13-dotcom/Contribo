'use client';

import { useSyncExternalStore } from 'react';

const MINUTE_MS = 60_000;

/**
 * Wall clock for relative labels such as "updated 3 hours ago".
 *
 * A label computed from "now" cannot be rendered during the server pass without
 * guaranteeing a hydration mismatch, so this store reports `0` until it has
 * subscribed on the client: the server render and the first client render agree
 * on "no label", and the label then appears and ages once a minute.
 */
let currentEpochMs = 0;
let ticker: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function refresh(): void {
  currentEpochMs = Date.now();
  for (const notify of listeners) notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (ticker === null) {
    refresh();
    ticker = setInterval(refresh, MINUTE_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && ticker !== null) {
      clearInterval(ticker);
      ticker = null;
      currentEpochMs = 0;
    }
  };
}

function getSnapshot(): number {
  return currentEpochMs;
}

function getServerSnapshot(): number {
  return 0;
}

/** `Date.now()` on the client, or `0` before hydration has completed. */
export function useMinuteClock(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
