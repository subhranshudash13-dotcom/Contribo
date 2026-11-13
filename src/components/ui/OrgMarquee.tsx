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

/**
 * The marquee used to be a fixed list of eight names with hand-written slugs,
 * and one of them — the Linux Foundation tile — reused the CNCF slug, so two
 * tiles pointed at the same detail page and neither was checked against the
 * database. It now renders organizations from the caller's result set, so every
 * tile is a page that actually exists.
 */
export function OrgMarquee({
  organizations = [],
}: {
  organizations?: { name?: string; slug?: string; logoUrl?: string; backgroundColor?: string }[];
}) {
  const logos: MarqueeLogo[] = [];
  const seen = new Set<string>();
  for (const org of organizations) {
    const slug = typeof org?.slug === 'string' ? org.slug.trim() : '';
    const name = typeof org?.name === 'string' ? org.name.trim() : '';
    if (!slug || !name || seen.has(slug)) continue;
    seen.add(slug);
    logos.push({
      name,
      slug,
      logoUrl: typeof org.logoUrl === 'string' ? org.logoUrl : '',
      brandColor: typeof org.backgroundColor === 'string' && org.backgroundColor ? org.backgroundColor : '#64748b',
    });
    if (logos.length >= 12) break;
  }

  if (logos.length === 0) return null;

  // Repeat the strip enough times that the CSS loop never shows a gap.
  const repeats = logos.length >= 8 ? 3 : Math.max(2, Math.ceil(24 / logos.length));
  const loopedLogos = Array.from({ length: repeats }, () => logos).flat();

  return (
    <div className="mb-10 relative overflow-hidden border border-hairline rounded-2xl bg-surface/40 py-3.5">
      {/* Left and right fade gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-page to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-page to-transparent z-10" />

      <div className="flex gap-4 animate-marquee-left pause-on-hover whitespace-nowrap px-4 items-center">
        {loopedLogos.map((logo, i) => (
          <MarqueeItem key={`${logo.slug}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}

function MarqueeItem({ logo }: { logo: MarqueeLogo }) {
  const [hasError, setHasError] = useState(false);

  return (
    <Link
      href={`/organizations/${logo.slug}`}
      className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-hairline/80 bg-surface hover:border-accent/40 transition-all shrink-0 select-none shadow-2xs hover:scale-[1.02] cursor-pointer"
    >
      {!hasError && logo.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.logoUrl}
          alt={`${logo.name} logo`}
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
