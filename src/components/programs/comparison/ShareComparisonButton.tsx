'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareComparisonButtonProps {
  selectedSlugs: string[];
  countryCode: string;
  className?: string;
}

export function ShareComparisonButton({
  selectedSlugs,
  countryCode,
  className = '',
}: ShareComparisonButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('programs', selectedSlugs.join(','));
      url.searchParams.set('country', countryCode);

      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-xs ${className}`}
      title="Copy shareable permalink with current programs and location"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
          <span className="text-emerald-600 dark:text-emerald-400">Copied Link!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-primary" />
          <span>Share Matrix</span>
        </>
      )}
    </button>
  );
}
