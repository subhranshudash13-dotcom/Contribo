'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** How long the "Copied!" confirmation stays visible, in ms. */
export const COPIED_FEEDBACK_MS = 2000;

/**
 * Clipboard write mirroring the strategy already used by ShareButton: the async
 * Clipboard API when the context allows it, otherwise an off-screen textarea so
 * plain-http deployments and older browsers still work.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the execCommand path below.
    }
  }

  if (typeof document === 'undefined') return false;

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textArea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Normalises the text a reader sees. `innerText` mirrors what is painted, so it
 * inserts a blank line between every stacked block element; those breaks are
 * layout, not content, and pasting them into a terminal history or a PR body
 * looks wrong. Trailing spaces on each line go too.
 *
 * Numbered lines are left alone on purpose — in these snippets the numbering is
 * authored content (commit messages in a transcript), not a highlighter gutter.
 */
export function cleanSnippetText(raw: string): string {
  return raw
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export interface SnippetCopyButtonProps {
  /** Resolved at click time so the caller can read the live, rendered text. */
  getText: () => string;
  label?: string;
  className?: string;
}

export function SnippetCopyButton({
  getText,
  label = 'Copy snippet',
  className = '',
}: SnippetCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const text = cleanSnippetText(getText());
      if (!text) return;

      if (await writeToClipboard(text)) {
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
      }
    },
    [getText]
  );

  const description = copied ? `${label} copied to clipboard` : `Copy ${label.toLowerCase()}`;

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={description}
      title={description}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border font-mono text-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
        copied
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
          : 'bg-page border-hairline text-muted hover:text-primary hover:border-brass/40'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check size={14} />
          <span className="sr-only">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span className="sr-only">{label}</span>
        </>
      )}
    </button>
  );
}

export interface CopyableSnippetProps {
  children: React.ReactNode;
  /**
   * Classes for the snippet body, exactly as they were before — background,
   * border and rounding stay the caller's business. Reserve a little top padding
   * (`pt-10`) so the control never sits on top of the first line of code.
   */
  className?: string;
  label?: string;
}

/**
 * Wraps a code or terminal block and floats a copy control inside its top-right
 * corner. The copied text is read from the rendered node, so a snippet can never
 * drift out of sync with a second hardcoded string, and the control lives outside
 * that node so its own label is never copied.
 */
export function CopyableSnippet({ children, className = '', label }: CopyableSnippetProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div ref={bodyRef} className={className}>
        {children}
      </div>
      <SnippetCopyButton
        getText={() => bodyRef.current?.innerText ?? ''}
        label={label}
        className="absolute top-2 right-2"
      />
    </div>
  );
}
