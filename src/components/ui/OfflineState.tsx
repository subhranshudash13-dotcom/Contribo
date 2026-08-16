'use client';

import React from 'react';
import {
  WifiOff,
  RefreshCw,
  ServerCrash,
  Loader2,
  CloudOff,
  Signal,
} from 'lucide-react';

type OfflineStateProps = {
  /** Browser offline vs server unreachable */
  reason?: 'browser' | 'server' | 'unknown';
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
  retrying?: boolean;
  /** compact banner vs full empty-state card */
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
};

function defaultCopy(reason: OfflineStateProps['reason']) {
  if (reason === 'browser') {
    return {
      title: "You're offline",
      description:
        'No internet connection detected. Reconnect to browse programs, projects, and your dashboard.',
      tip: 'Check Wi-Fi or mobile data, then try again.',
    };
  }
  if (reason === 'server') {
    return {
      title: 'Contribo is unreachable',
      description:
        "Your device is online, but we can't reach the Contribo service right now.",
      tip: 'This is usually temporary — retry in a few seconds.',
    };
  }
  return {
    title: 'Connection problem',
    description:
      "We couldn't complete this request. Check your network and try again.",
    tip: 'If the problem continues, refresh the page.',
  };
}

/**
 * Shared offline / unreachable UI — banner, full card, or inline chip.
 */
export function OfflineState({
  reason = 'unknown',
  title,
  description,
  onRetry,
  retrying = false,
  variant = 'card',
  className = '',
}: OfflineStateProps) {
  const copy = defaultCopy(reason);
  const resolvedTitle = title || copy.title;
  const resolvedDescription = description || copy.description;
  const Icon = reason === 'server' ? ServerCrash : WifiOff;

  if (variant === 'inline') {
    return (
      <span
        role="status"
        className={`inline-flex items-center gap-1.5 rounded-full border border-error/25 bg-error/10 px-2.5 py-1 text-xs font-medium text-error ${className}`}
      >
        <WifiOff size={12} aria-hidden />
        {resolvedTitle}
      </span>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={`w-full border-b border-error/20 bg-gradient-to-r from-error/12 via-warning/8 to-error/10 text-primary backdrop-blur-sm ${className}`}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-error/25 bg-surface shadow-sm sm:mt-0">
              <Icon size={18} className="text-error" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-semibold leading-tight tracking-tight">
                {resolvedTitle}
              </p>
              <p className="text-xs leading-snug text-secondary sm:text-[13px]">
                {resolvedDescription}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={() => void onRetry()}
              disabled={retrying}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-hairline bg-surface px-3.5 text-xs font-semibold text-primary shadow-sm transition-all hover:border-primary/20 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60"
            >
              {retrying ? (
                <Loader2 size={14} className="animate-spin text-muted" />
              ) : (
                <RefreshCw size={14} className="text-muted" />
              )}
              {retrying ? 'Checking…' : 'Retry connection'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full card — professional empty state
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`relative overflow-hidden rounded-2xl border border-hairline bg-surface p-8 text-center shadow-sm sm:p-12 ${className}`}
    >
      {/* Soft decorative glow */}
      <div
        className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-error/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-error/30 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-error/10" />
        <div className="absolute inset-[3px] rounded-[13px] border border-error/20 bg-base" />
        <Icon size={28} className="relative text-error" strokeWidth={1.5} aria-hidden />
      </div>

      <h3 className="relative mb-2 text-xl font-bold tracking-tight text-primary">
        {resolvedTitle}
      </h3>
      <p className="relative mx-auto mb-3 max-w-md text-sm leading-relaxed text-secondary">
        {resolvedDescription}
      </p>
      <p className="relative mx-auto mb-8 flex max-w-sm items-center justify-center gap-1.5 text-xs text-muted">
        {reason === 'server' ? (
          <CloudOff size={12} aria-hidden />
        ) : (
          <Signal size={12} aria-hidden />
        )}
        {copy.tip}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={() => void onRetry()}
          disabled={retrying}
          className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-base shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          {retrying ? 'Checking connection…' : 'Try again'}
        </button>
      )}
    </div>
  );
}

/**
 * Fixed top banner driven by useOnlineStatus — drop into root layout.
 */
export function OfflineBanner({
  isOnline,
  browserOnline,
  checking,
  onRetry,
}: {
  isOnline: boolean;
  browserOnline: boolean;
  checking?: boolean;
  onRetry?: () => void | Promise<void>;
}) {
  if (isOnline) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-40">
      <OfflineState
        variant="banner"
        reason={browserOnline ? 'server' : 'browser'}
        onRetry={onRetry}
        retrying={checking}
      />
    </div>
  );
}
