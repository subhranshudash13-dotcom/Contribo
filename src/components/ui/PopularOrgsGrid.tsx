'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  GitPullRequest,
  ArrowRight,
} from 'lucide-react';
import { OrgLogo } from '@/components/ui/OrgLogo';
import type { FeaturedOrganization } from '@/lib/repositories/organizations';

/**
 * The home page showcase. Every card here is a row from the organizations
 * collection, so the names, links, counts and program tags a visitor sees are
 * the ones the directory at /organizations actually serves.
 */
export function PopularOrgsGrid({
  organizations,
  total,
}: {
  organizations: FeaturedOrganization[];
  total: number;
}) {
  if (organizations.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-hairline bg-surface/60">
        <div className="w-8 h-8 rounded-lg bg-brass/10 border border-brass/20 flex items-center justify-center text-brass shrink-0">
          <Building2 size={16} />
        </div>
        <p className="text-xs sm:text-sm text-secondary">
          No mentoring organizations are indexed yet — the directory fills up as
          program data is imported.
        </p>
      </div>
    );
  }

  // Two counter-scrolling tracks, split evenly so both stay on real data.
  const halfway = Math.ceil(organizations.length / 2);
  const row1 = organizations.slice(0, halfway);
  const row2 = organizations.slice(halfway);
  // A single-row split still needs enough cards to fill the loop seamlessly.
  const row1Loop = row1.length > 3 ? [...row1, ...row1] : [...row1, ...row1, ...row1, ...row1];
  const row2Source = row2.length > 0 ? row2 : row1;
  const row2Loop =
    row2Source.length > 3 ? [...row2Source, ...row2Source] : [...row2Source, ...row2Source, ...row2Source];

  const indexedLabel = total > 0 ? `${total.toLocaleString()} organizations indexed` : 'no organizations indexed yet';

  return (
    <div className="w-full space-y-4 relative overflow-hidden py-2">
      {/* Track 1: Moving Smoothly Left to Right */}
      <div className="overflow-hidden w-full">
        <div className="animate-marquee-left pause-on-hover flex gap-3.5 sm:gap-4 items-center">
          {row1Loop.map((org, index) => (
            <OrgMarqueeCard key={`row1-${org.slug}-${index}`} org={org} />
          ))}
        </div>
      </div>

      {/* Track 2: Moving Smoothly Left to Right with Offset Speed */}
      <div className="overflow-hidden w-full">
        <div className="animate-marquee-right pause-on-hover flex gap-3.5 sm:gap-4 items-center">
          {row2Loop.map((org, index) => (
            <OrgMarqueeCard key={`row2-${org.slug}-${index}`} org={org} />
          ))}
        </div>
      </div>

      {/* Bottom Directory Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-hairline bg-surface/60 backdrop-blur-sm mt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brass/10 border border-brass/20 flex items-center justify-center text-brass shrink-0">
            <Building2 size={16} />
          </div>
          <p className="text-xs sm:text-sm text-secondary">
            Hover any organization card to pause •{' '}
            <span className="font-semibold text-primary">{indexedLabel}</span>.
          </p>
        </div>

        <Link
          href="/organizations"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-page text-xs font-semibold hover:opacity-90 transition-all shadow-xs shrink-0"
        >
          Browse all{total > 0 ? ` (${total.toLocaleString()})` : ''}
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function yearBadge(org: FeaturedOrganization) {
  if (org.latestYear === null) return null;
  const tone = org.is2026
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';

  return (
    <span
      title={
        org.is2026
          ? `Indexed for the ${org.latestYear} cohort`
          : `Last indexed cohort: ${org.latestYear}`
      }
      className={`shrink-0 px-1.5 py-0.5 rounded border text-[9px] font-mono font-semibold uppercase tracking-wider ${tone}`}
    >
      {org.latestYear}
    </span>
  );
}

function OrgMarqueeCard({ org }: { org: FeaturedOrganization }) {
  const orgUrl = `/organizations/${org.slug}`;

  return (
    <Link
      href={orgUrl}
      className="group relative flex flex-col justify-between w-[285px] sm:w-[315px] h-[160px] p-4 rounded-2xl border border-hairline bg-surface/90 hover:bg-surface transition-all duration-200 hover:border-brass/50 hover:shadow-md dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] shrink-0 overflow-hidden select-none cursor-pointer"
    >
      {/* Top Brand Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: org.backgroundColor || 'var(--brass)' }}
      />

      <div>
        {/* Top Header: Logo + Name + Latest Cohort */}
        <div className="flex items-start gap-3">
          <OrgLogo
            logoUrl={org.logoUrl}
            name={org.name}
            slug={org.slug}
            className="w-10 h-10 rounded-xl"
            size={20}
          />

          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-semibold text-sm text-primary group-hover:text-brass transition-colors truncate">
              {org.name}
            </h4>
            <p className="text-[11px] font-mono text-muted truncate">
              {org.category || 'Open source organization'}
            </p>
          </div>

          {yearBadge(org)}
        </div>

        {/* Short Description */}
        <p className="text-secondary text-[11px] sm:text-xs leading-relaxed line-clamp-2 mt-2.5">
          {org.description || 'No description recorded for this organization yet.'}
        </p>
      </div>

      {/* Bottom Footer: Program & Tech Pills + Listed Project Count */}
      <div className="flex items-center justify-between pt-2 border-t border-hairline/60 gap-2">
        <div className="flex items-center gap-1 overflow-hidden">
          {org.programs.slice(0, 2).map((prog) => (
            <span
              key={prog}
              className="px-1.5 py-0.5 rounded bg-page border border-hairline text-[9px] font-mono font-medium text-secondary shrink-0"
            >
              {prog}
            </span>
          ))}
          {org.technologies.slice(0, 2).map((tech) => (
            <span
              key={tech}
              className="px-1.5 py-0.5 rounded bg-surface border border-hairline text-[9px] font-mono text-muted shrink-0"
            >
              {tech}
            </span>
          ))}
        </div>

        {org.projectCount > 0 && (
          <span
            className="inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold text-muted group-hover:text-brass transition-colors shrink-0"
            title={`${org.projectCount} project${org.projectCount === 1 ? '' : 's'} listed on Contribo`}
          >
            <GitPullRequest size={11} className="text-secondary" />
            <span className="text-[10px]">{org.projectCount}</span>
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform ml-0.5" />
          </span>
        )}
      </div>
    </Link>
  );
}
