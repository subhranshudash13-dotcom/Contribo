'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';

export interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  variant?: 'button' | 'icon' | 'compact';
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
  copiedLabel?: string;
  showTooltip?: boolean;
}

export function ShareButton({
  url,
  title,
  variant = 'button',
  size = 'sm',
  className = '',
  label = 'Share',
  copiedLabel = 'Copied!',
  showTooltip = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleShare = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      let targetUrl = url;
      if (!targetUrl && typeof window !== 'undefined') {
        targetUrl = window.location.href;
      } else if (targetUrl && !targetUrl.startsWith('http') && typeof window !== 'undefined') {
        targetUrl = `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
      }

      const fullUrl = targetUrl || '';

      let copySuccessful = false;

      // Try clipboard API
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(fullUrl);
          copySuccessful = true;
        } catch {
          // Fallback to execCommand
        }
      }

      // Fallback for older browsers or insecure contexts
      if (!copySuccessful && typeof document !== 'undefined') {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = fullUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          copySuccessful = document.execCommand('copy');
          document.body.removeChild(textArea);
        } catch {
          copySuccessful = false;
        }
      }

      if (copySuccessful) {
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    },
    [url]
  );

  const pad = size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm';
  const iconPad = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const compactPad = 'h-7 w-7 text-xs';

  const ariaDescription = copied
    ? `Link for ${title || 'item'} copied to clipboard`
    : `Copy share link for ${title || 'item'}`;

  return (
    <div className="relative inline-flex items-center">
      {variant === 'button' ? (
        <button
          type="button"
          onClick={handleShare}
          aria-label={ariaDescription}
          title={ariaDescription}
          className={`inline-flex items-center gap-1.5 rounded-lg border font-mono uppercase tracking-wide font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-50 ${pad} ${
            copied
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-page border-hairline text-muted hover:text-primary hover:border-brass/40'
          } ${className}`}
        >
          {copied ? (
            <Check size={14} className="text-emerald-500 dark:text-emerald-400 animate-in fade-in zoom-in duration-150" />
          ) : (
            <Share2 size={14} className="transition-transform duration-150 group-hover:scale-105" />
          )}
          <span>{copied ? copiedLabel : label}</span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleShare}
          aria-label={ariaDescription}
          title={ariaDescription}
          className={`inline-flex items-center justify-center rounded-md border font-mono transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${compactPad} ${
            copied
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'bg-page/80 backdrop-blur-xs border-hairline text-muted hover:text-primary hover:border-brass/40 hover:bg-page'
          } ${className}`}
        >
          {copied ? (
            <Check size={13} className="text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Share2 size={13} />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleShare}
          aria-label={ariaDescription}
          title={ariaDescription}
          className={`inline-flex items-center justify-center rounded-lg border font-mono transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${iconPad} ${
            copied
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-page border-hairline text-muted hover:text-primary hover:border-brass/40'
          } ${className}`}
        >
          {copied ? (
            <Check size={14} className="text-emerald-500 dark:text-emerald-400 animate-in fade-in zoom-in duration-150" />
          ) : (
            <Share2 size={14} />
          )}
        </button>
      )}

      {/* Floating Tooltip Confirmation */}
      {showTooltip && copied && (
        <div
          role="status"
          aria-live="polite"
          className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded bg-surface-raised border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold whitespace-nowrap shadow-md pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150"
        >
          Copied!
        </div>
      )}
    </div>
  );
}
