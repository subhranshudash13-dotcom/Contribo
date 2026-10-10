'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';

interface MarqueeLogo {
  name: string;
  logoUrl: string;
  brandColor: string;
  slug: string;
}

const DEFAULT_MARQUEE_LOGOS: MarqueeLogo[] = [
  { name: 'Apache Software', logoUrl: 'https://cdn.simpleicons.org/apache/D22128', brandColor: '#D22128', slug: 'apache-software-foundation' },
  { name: 'Linux Foundation', logoUrl: 'https://cdn.simpleicons.org/linuxfoundation/0070FF', brandColor: '#0070FF', slug: 'cncf' },
  { name: 'Python PSF', logoUrl: 'https://cdn.simpleicons.org/python/3776AB', brandColor: '#3776AB', slug: 'python-software-foundation' },
  { name: 'Google DeepMind', logoUrl: 'https://cdn.simpleicons.org/google/4285F4', brandColor: '#4285F4', slug: 'google-deepmind' },
  { name: 'CNCF Cloud', logoUrl: 'https://cdn.simpleicons.org/cncf/008BB8', brandColor: '#008BB8', slug: 'cncf' },
  { name: 'Mozilla Devs', logoUrl: 'https://cdn.simpleicons.org/mozilla/FF7139', brandColor: '#FF7139', slug: 'mozilla' },
  { name: 'Red Hat Open', logoUrl: 'https://cdn.simpleicons.org/redhat/EE0000', brandColor: '#EE0000', slug: 'redhat-mlh' },
  { name: 'PostgreSQL', logoUrl: 'https://cdn.simpleicons.org/postgresql/4169E1', brandColor: '#4169E1', slug: 'postgresql' },
];

function MarqueeItem({ logo }: { logo: MarqueeLogo }) {
  const [hasError, setHasError] = useState(false);

  return (
    <Link
      href={`/organizations/${logo.slug}`}
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-hairline/80 bg-surface hover:border-accent/40 transition-all shrink-0 select-none shadow-2xs hover:scale-[1.02] cursor-pointer"
    >
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
    </Link>
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
