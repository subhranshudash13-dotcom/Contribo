'use client';

import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface MarqueeLogo {
  name: string;
  logoUrl: string;
  brandColor: string;
}

const DEFAULT_MARQUEE_LOGOS: MarqueeLogo[] = [
  { name: 'Apache Software', logoUrl: 'https://cdn.simpleicons.org/apache/D22128', brandColor: '#D22128' },
  { name: 'Linux Foundation', logoUrl: 'https://cdn.simpleicons.org/linuxfoundation/0070FF', brandColor: '#0070FF' },
  { name: 'Python PSF', logoUrl: 'https://cdn.simpleicons.org/python/3776AB', brandColor: '#3776AB' },
  { name: 'Google Open Source', logoUrl: 'https://cdn.simpleicons.org/google/4285F4', brandColor: '#4285F4' },
  { name: 'CNCF Cloud', logoUrl: 'https://cdn.simpleicons.org/cncf/008BB8', brandColor: '#008BB8' },
  { name: 'Mozilla Devs', logoUrl: 'https://cdn.simpleicons.org/mozilla/FF7139', brandColor: '#FF7139' },
  { name: 'Red Hat Open', logoUrl: 'https://cdn.simpleicons.org/redhat/EE0000', brandColor: '#EE0000' },
  { name: 'Kubernetes Ops', logoUrl: 'https://cdn.simpleicons.org/kubernetes/326CE5', brandColor: '#326CE5' },
];

function MarqueeItem({ logo }: { logo: MarqueeLogo }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-hairline/80 bg-surface hover:border-accent/40 transition-all shrink-0 select-none shadow-2xs">
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.logoUrl}
          alt={logo.name}
          className="h-5 w-5 object-contain shrink-0"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <Building2 size={16} style={{ color: logo.brandColor }} />
      )}
      <span className="text-xs font-semibold text-primary tracking-tight">
        {logo.name}
      </span>
    </div>
  );
}

export function OrgMarquee() {
  const doubleLogos = [...DEFAULT_MARQUEE_LOGOS, ...DEFAULT_MARQUEE_LOGOS, ...DEFAULT_MARQUEE_LOGOS];

  return (
    <div className="mb-10 relative overflow-hidden border border-hairline rounded-2xl bg-surface/40 py-3.5">
      {/* Left and right fade gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-page to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-page to-transparent z-10" />

      <div className="flex gap-4 animate-marquee-left pause-on-hover whitespace-nowrap px-4 items-center">
        {doubleLogos.map((logo, i) => (
          <MarqueeItem key={`${logo.name}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}
