'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useOnlineStatus, type OnlineStatus } from '@/hooks/useOnlineStatus';
import { OfflineBanner } from './OfflineState';

const NetworkContext = createContext<OnlineStatus | null>(null);

/**
 * Soft banner when the app is reachable but MongoDB (or another core dependency) is down.
 * Does not block browsing static/cached content.
 */
function DegradedBanner({
  visible,
  checking,
  onRetry,
}: {
  visible: boolean;
  checking?: boolean;
  onRetry?: () => void | Promise<void>;
}) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 inset-x-0 z-40 border-b border-warning/25 bg-warning/10 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <AlertTriangle size={16} className="shrink-0 text-warning" aria-hidden />
          <p className="text-xs text-secondary sm:text-sm">
            <span className="font-semibold text-primary">Limited connectivity — </span>
            some live data may be temporarily unavailable.
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={() => void onRetry()}
            disabled={checking}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 text-xs font-semibold text-primary transition-colors hover:bg-surface-raised disabled:opacity-60"
          >
            {checking ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            {checking ? 'Checking…' : 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Provides online/offline status app-wide and renders a top banner when offline.
 */
export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const status = useOnlineStatus({ probeServer: true, probeIntervalMs: 45_000 });

  const value = useMemo(() => status, [status]);

  return (
    <NetworkContext.Provider value={value}>
      <OfflineBanner
        isOnline={status.isOnline}
        browserOnline={status.browserOnline}
        checking={status.checking}
        onRetry={async () => {
          await status.recheck();
        }}
      />
      {/* Only show degraded when fully online (offline banner takes precedence) */}
      <DegradedBanner
        visible={status.isOnline && status.degraded}
        checking={status.checking}
        onRetry={async () => {
          await status.recheck();
        }}
      />
      {children}
    </NetworkContext.Provider>
  );
}

/** Access shared online status (must be under NetworkProvider). */
export function useNetwork(): OnlineStatus {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    // Safe fallback when used outside provider (e.g. isolated tests)
    return {
      isOnline: true,
      browserOnline: true,
      serverReachable: true,
      mongodb: 'unknown',
      degraded: false,
      checking: false,
      lastCheckedAt: null,
      recheck: async () => ({
        online: true,
        clientOnline: true,
        serverReachable: true,
        mongodb: 'unknown',
        status: 'ok',
        timestamp: new Date().toISOString(),
      }),
    };
  }
  return ctx;
}
