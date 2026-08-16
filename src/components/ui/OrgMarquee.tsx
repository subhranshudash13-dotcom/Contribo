'use client';

import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface MarqueeLogo {
  name: string;
  logoUrl: string;
}

const DEFAULT_MARQUEE_LOGOS: MarqueeLogo[] = [
  { name: 'Apache Software', logoUrl: 'https://cdn.simpleicons.org/apache' },
  { name: 'Linux Foundation', logoUrl: 'https://cdn.simpleicons.org/linuxfoundation' },
  { name: 'Python PSF', logoUrl: 'https://cdn.simpleicons.org/python' },
  { name: 'Google Open Source', logoUrl: 'https://cdn.simpleicons.org/google' },
  { name: 'CNCF Cloud', logoUrl: 'https://cdn.simpleicons.org/cncf' },
  { name: 'Mozilla Devs', logoUrl: 'https://cdn.simpleicons.org/mozilla' },
  { name: 'Red Hat Open', logoUrl: 'https://cdn.simpleicons.org/redhat' },
  { name: 'Kubernetes Ops', logoUrl: 'https://cdn.simpleicons.org/kubernetes' },
];

function MarqueeItem({ logo }: { logo: MarqueeLogo }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider opacity-70 flex items-center gap-1.5 shrink-0 px-2">
        <Building2 size={14} className="text-accent" />
        {logo.name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.logoUrl}
      alt={logo.name}
      className="h-7 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all object-contain shrink-0"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

export function OrgMarquee() {
  const doubleLogos = [...DEFAULT_MARQUEE_LOGOS, ...DEFAULT_MARQUEE_LOGOS];

  return (
    <div className="mb-10 overflow-hidden border border-hairline rounded-2xl bg-surface/50 py-4">
      <div className="flex gap-10 animate-[marquee_40s_linear_infinite] whitespace-nowrap px-4 items-center">
        {doubleLogos.map((logo, i) => (
          <MarqueeItem key={`${logo.name}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}
