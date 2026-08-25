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
      title: 'No Internet Connection',
      statement:
        'You are currently offline. Please check your internet connection.',
      description:
        'You are not connected to the internet. Reconnect to browse live programs, run AI project matches, and sync your applications.',
      tip: 'Check your Wi-Fi, Ethernet, or mobile data. Contribo will automatically reconnect when your connection returns.',
    };
  }
  if (reason === 'server') {
    return {
      title: 'Contribo Server Unreachable',
      statement:
        'Unable to reach Contribo servers right now.',
      description:
        "Your device is online, but our server cannot be reached right now. We're attempting to reconnect.",
      tip: 'This is usually temporary — retry in a few seconds.',
    };
  }
  return {
    title: 'Connection Lost',
    statement:
      'Network connection lost. Please check your internet connection.',
    description:
      "We couldn't reach the server. Please check your internet connection and try again.",
    tip: 'If the problem continues, refresh the page.',
  };
}

/**
 * Shared offline / unreachable UI — banner, full card, inline chip, or alert statement box.
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
        className={`inline-flex items-center gap-1.5 rounded-full border border-error/30 bg-error/10 px-3 py-1 text-xs font-semibold text-error ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
        </span>
        <WifiOff size={13} aria-hidden />
        <span>{resolvedTitle}</span>
      </span>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={`w-full border-b border-error/30 bg-gradient-to-r from-error/15 via-warning/10 to-error/15 text-primary shadow-sm backdrop-blur-md ${className}`}
      >
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-error/30 bg-surface shadow-xs">
              <span className="relative flex h-2.5 w-2.5 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
              </span>
              <Icon size={16} className="text-error" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs sm:text-sm font-bold tracking-tight text-primary flex items-center gap-2 flex-wrap">
                <span className="text-error font-extrabold uppercase text-[11px] tracking-wider bg-error/15 px-1.5 py-0.5 rounded border border-error/25">
                  Offline Alert
                </span>
                <span>{copy.statement}</span>
              </p>
              <p className="text-[11px] sm:text-xs leading-snug text-secondary line-clamp-1">
                {resolvedDescription}
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={() => void onRetry()}
              disabled={retrying}
              className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border border-error/30 bg-surface px-3.5 text-xs font-bold text-primary shadow-xs transition-all hover:border-error/50 hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60"
            >
              {retrying ? (
                <Loader2 size={13} className="animate-spin text-error" />
              ) : (
                <RefreshCw size={13} className="text-error" />
              )}
              <span>{retrying ? 'Connecting…' : 'Retry connection'}</span>
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
        <div className="absolute inset-[3px] rounded-[13px] border border-error/20 bg-page" />
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
          className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-page shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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

/**
 * Standalone offline alert callout box for forms, cards, and modal dialogs.
 */
export function OfflineAlert({
  statement,
  description,
  onRetry,
  retrying,
  className = '',
}: {
  statement?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
  retrying?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-xl border border-error/30 bg-error/10 p-4 text-primary shadow-xs ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-error/30 bg-surface shadow-xs mt-0.5">
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-error" />
          </span>
          <WifiOff size={15} className="text-error" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs sm:text-sm font-bold text-primary flex items-center gap-2 flex-wrap">
            <span className="text-error font-extrabold uppercase text-[10px] tracking-wider bg-error/20 px-1.5 py-0.5 rounded border border-error/30">
              Offline Alert
            </span>
            <span>{statement || 'You are currently offline. Please check your internet connection.'}</span>
          </p>
          <p className="text-xs text-secondary leading-relaxed">
            {description || 'No internet connection detected. Please reconnect to continue with real-time matching, tracking, and proposals.'}
          </p>
          {onRetry && (
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => void onRetry()}
                disabled={retrying}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-error/30 bg-surface px-2.5 text-[11px] font-bold text-primary shadow-xs transition-all hover:bg-surface-raised disabled:opacity-60"
              >
                {retrying ? (
                  <Loader2 size={12} className="animate-spin text-error" />
                ) : (
                  <RefreshCw size={12} className="text-error" />
                )}
                <span>{retrying ? 'Retrying…' : 'Retry connection'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

