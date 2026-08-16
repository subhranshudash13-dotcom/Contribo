'use client';

import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { getOfficialOrgLogo } from '@/lib/org-logos';

interface OrgLogoProps {
  logoUrl?: string | null;
  name: string;
  slug?: string;
  className?: string;
  size?: number;
}

export function OrgLogo({
  logoUrl,
  name,
  slug,
  className = 'w-10 h-10 rounded-xl',
  size = 20,
}: OrgLogoProps) {
  const [triedFallback, setTriedFallback] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cleanName = (name || '').trim();

  // 1. Primary source: database logoUrl or official brand lookup
  const primarySrc = (logoUrl && logoUrl.trim().length > 0)
    ? logoUrl.trim()
    : getOfficialOrgLogo(cleanName, slug);

  // 2. Fallback source: official brand logo engine
  const fallbackSrc = getOfficialOrgLogo(cleanName, slug);

  const activeSrc = !triedFallback ? primarySrc : fallbackSrc;
  const initial = cleanName ? cleanName.charAt(0).toUpperCase() : '';

  const handleError = () => {
    if (!triedFallback && fallbackSrc && fallbackSrc !== primarySrc) {
      setTriedFallback(true);
    } else {
      setImgError(true);
    }
  };

  if (!activeSrc || imgError) {
    return (
      <div
        className={`${className} bg-surface-raised border border-hairline flex items-center justify-center shrink-0 font-mono font-bold text-accent shadow-sm select-none`}
        style={{ fontSize: Math.max(12, size * 0.65) }}
        title={cleanName}
      >
        {initial ? initial : <Building2 size={size} className="text-muted" />}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt={`${cleanName} logo`}
      className={`${className} object-contain bg-white border border-hairline shrink-0 p-1 shadow-sm`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
}

