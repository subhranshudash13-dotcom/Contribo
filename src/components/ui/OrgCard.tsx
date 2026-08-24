'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Organization } from '../../../types';
import { SaveButton } from './SaveTrackActions';
import { OrgLogo } from './OrgLogo';

export function OrgCard({
  org,
  showActions = true,
  initialSaved = false,
}: {
  org: Organization;
  showActions?: boolean;
  initialSaved?: boolean;
}) {
  const orgId = org._id ? String(org._id) : '';
  const years = org.years || [];
  const techs = org.technologies || [];

  return (
    <Link
      href={`/organizations/${org.slug}`}
      className="group relative border border-black/80 dark:border-white/20 hover:border-black dark:hover:border-white/40 rounded-none bg-surface hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-200 flex flex-col justify-between min-h-[360px] overflow-hidden select-none cursor-pointer"
    >
      {/* Top Brand Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] bg-hairline group-hover:bg-accent transition-colors duration-200 z-10"
        style={{ backgroundColor: org.backgroundColor || undefined }}
      />

      <div>
        {/* Full-Width Highlighted Top Logo Box */}
        <div className="w-full h-32 bg-page/60 dark:bg-page/40 border-b border-hairline flex items-center justify-center p-4 relative group-hover:bg-page transition-colors">
          <div className="w-full h-full flex items-center justify-center">
            <OrgLogo
              logoUrl={org.logoUrl}
              name={org.name}
              className="max-h-20 w-auto max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-200"
              size={54}
            />
          </div>

          {/* Action Button at Top Right */}
          {showActions && orgId && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="opacity-90 hover:opacity-100 transition-opacity rounded-full"
              >
                <SaveButton
                  payload={{
                    type: 'organization',
                    targetId: orgId,
                    title: org.name,
                    subtitle: org.category || 'Organization',
                    slug: org.slug,
                    techStack: techs.slice(0, 12),
                  }}
                  initialSaved={initialSaved}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Content Area */}
        <div className="p-4 sm:p-5">
          {/* Organization Name & Category */}
          <div className="mb-2">
            <h2 className="text-base font-bold font-heading text-primary group-hover:text-accent transition-colors line-clamp-1 leading-snug">
              {org.name}
            </h2>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5 line-clamp-1">
              {org.category || 'Open Source Software'}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-secondary line-clamp-3 leading-relaxed">
            {org.description}
          </p>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-hairline/60 space-y-2.5">
          {/* Technologies micro-badges */}
          {techs.length > 0 && (
            <div className="flex flex-wrap gap-1 overflow-hidden h-[22px]">
              {techs.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-page border border-hairline text-muted"
                >
                  {tech}
                </span>
              ))}
              {techs.length > 3 && (
                <span className="text-[10px] font-mono text-muted flex items-center px-1">
                  +{techs.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Card Footer: Years count + 2026 Pill + Hover Arrow */}
          <div className="flex items-center justify-between text-xs font-mono text-muted pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px]">
                {years.length > 0 ? `${years.length} active years` : 'Open Source'}
              </span>
              {org.is2026 && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider shadow-2xs">
                  <Sparkles size={9} /> 2026
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:translate-x-1 transition-transform text-[11px] shrink-0">
              Explore <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function OrgCardSkeleton() {
  return (
    <div className="border border-black/80 dark:border-white/20 rounded-none bg-surface flex flex-col justify-between min-h-[360px] animate-pulse">
      <div>
        <div className="w-full h-32 bg-page border-b border-hairline" />
        <div className="p-5">
          <div className="h-5 w-3/4 bg-page rounded-none mb-2" />
          <div className="h-3 w-1/2 bg-page rounded-none mb-4" />
          <div className="space-y-2">
            <div className="h-3.5 w-full bg-page rounded-none" />
            <div className="h-3.5 w-full bg-page rounded-none" />
            <div className="h-3.5 w-4/5 bg-page rounded-none" />
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-hairline space-y-2">
          <div className="h-4 w-1/2 bg-page rounded-none" />
          <div className="h-4 w-full bg-page rounded-none" />
        </div>
      </div>
    </div>
  );
}
