'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { checkConnectivity, type ConnectivityResponse } from '@/lib/client/api';

export type OnlineStatus = {
  /** Browser reports online AND last probe reached the API successfully (or not yet probed). */
  isOnline: boolean;
  /** navigator.onLine */
  browserOnline: boolean;
  /** Last successful reachability of /api/connectivity */
  serverReachable: boolean;
  /** Mongo readiness from last probe */
  mongodb: 'up' | 'down' | 'unknown';
  /** API reported degraded service (e.g. Mongo down but app up) */
  degraded: boolean;
  /** True while a probe is in flight */
  checking: boolean;
  /** ISO timestamp of last probe result */
  lastCheckedAt: string | null;
  /** Force a connectivity re-check */
  recheck: () => Promise<ConnectivityResponse>;
};

const PROBE_INTERVAL_MS = 30_000;

/**
 * Tracks browser online/offline events and optionally probes /api/connectivity.
 * Use for banners, disabled actions, and retry UIs.
 */
export function useOnlineStatus(options?: {
  /** Probe server reachability (default true). */
  probeServer?: boolean;
  /** Interval between background probes while online (ms). 0 disables. */
  probeIntervalMs?: number;
}): OnlineStatus {
  const probeServer = options?.probeServer !== false;
  const probeIntervalMs =
    options?.probeIntervalMs === undefined
      ? PROBE_INTERVAL_MS
      : options.probeIntervalMs;

  const [browserOnline, setBrowserOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine !== false
  );
  const [serverReachable, setServerReachable] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine !== false
  );
  const [mongodb, setMongodb] = useState<'up' | 'down' | 'unknown'>('unknown');
  const [degraded, setDegraded] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const mounted = useRef(true);

  const applyProbe = useCallback((result: ConnectivityResponse) => {
    if (!mounted.current) return;
    setBrowserOnline(result.clientOnline);
    setServerReachable(result.serverReachable);
    setMongodb(result.mongodb ?? 'unknown');
    setDegraded(
      result.status === 'degraded' || result.mongodb === 'down'
    );
    setLastCheckedAt(result.timestamp);
  }, []);

  const recheck = useCallback(async () => {
    if (!probeServer) {
      const clientOnline =
        typeof navigator === 'undefined' ? true : navigator.onLine !== false;
      const result: ConnectivityResponse = {
        online: clientOnline,
        clientOnline,
        serverReachable: clientOnline,
        mongodb: 'unknown',
        timestamp: new Date().toISOString(),
      };
      applyProbe(result);
      return result;
    }

    setChecking(true);
    try {
      const result = await checkConnectivity();
      applyProbe(result);
      return result;
    } finally {
      if (mounted.current) setChecking(false);
    }
  }, [applyProbe, probeServer]);

  useEffect(() => {
    mounted.current = true;

    const onOnline = () => {
      setBrowserOnline(true);
      void recheck();
    };
    const onOffline = () => {
      setBrowserOnline(false);
      setServerReachable(false);
      setMongodb('unknown');
      setDegraded(false);
      setLastCheckedAt(new Date().toISOString());
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Initial probe shortly after mount (avoid blocking first paint)
    const boot = window.setTimeout(() => {
      void recheck();
    }, 200);

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (probeServer && probeIntervalMs > 0) {
      intervalId = setInterval(() => {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
        void recheck();
      }, probeIntervalMs);
    }

    return () => {
      mounted.current = false;
      window.clearTimeout(boot);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [probeIntervalMs, probeServer, recheck]);

  const isOnline = browserOnline && serverReachable;

  return {
    isOnline,
    browserOnline,
    serverReachable,
    mongodb,
    degraded: isOnline && degraded,
    checking,
    lastCheckedAt,
    recheck,
  };
}
