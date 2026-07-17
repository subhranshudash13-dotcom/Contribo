import React from 'react';
import { Building2, Code2, ArrowRight, FolderOpen } from 'lucide-react';
import { Organization } from '../../../types';
import { Button } from './Button';
import { SaveButton } from './SaveTrackActions';

export function ProgramOrgCard({
  org,
  showActions = true,
  initialSaved = false,
  accentColor,
}: {
  org: Organization;
  showActions?: boolean;
  initialSaved?: boolean;
  accentColor?: string;
}) {
  const orgId = org._id ? String(org._id) : '';
  const years = org.years || [];
  const techs = Array.from(new Set((org.technologies || []).map(t => t.trim()))).filter(Boolean);

  return (
    <div className="group border border-hairline rounded-2xl bg-surface flex flex-col h-full transition-all duration-200 hover:border-accent/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
      {/* Accent top bar */}
      <div
        className="h-[3px] w-full transition-colors duration-200"
        style={{
          backgroundColor: accentColor
            ? `color-mix(in srgb, ${accentColor} 50%, transparent)`
            : undefined,
        }}
      />

      <div className="p-5 flex flex-col h-full">
        {/* Header: logo + name */}
        <div className="flex items-start gap-3.5 mb-3">
          {org.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logoUrl}
              alt={`${org.name} logo`}
              className="w-11 h-11 rounded-xl object-contain bg-white border border-hairline shrink-0 p-1"
              loading="lazy"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-base flex items-center justify-center border border-hairline shrink-0">
              <Building2 size={20} className="text-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold line-clamp-1 text-primary group-hover:text-accent transition-colors duration-150">
              {org.name}
            </h3>
            <p className="text-[11px] text-muted font-mono mt-0.5 uppercase tracking-wider line-clamp-1">
              {org.category || 'Open Source'}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {org.description}
        </p>

        {/* Project count */}
        {typeof org.projectCount === 'number' && org.projectCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3 text-xs font-mono text-secondary">
            <FolderOpen size={13} className="text-accent shrink-0" />
            <span className="font-bold">{org.projectCount}</span>
            <span className="text-muted">
              {org.projectCount === 1 ? 'project' : 'projects'}
            </span>
          </div>
        )}

        {/* Year badges */}
        {years.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {years
              .sort((a, b) => b - a)
              .slice(0, 6)
              .map((year) => (
                <span
                  key={year}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors"
                  style={{
                    borderColor: accentColor
                      ? `color-mix(in srgb, ${accentColor} 30%, transparent)`
                      : undefined,
                    color: accentColor || undefined,
                    backgroundColor: accentColor
                      ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                      : undefined,
                  }}
                >
                  {year}
                </span>
              ))}
            {years.length > 6 && (
              <span className="text-[10px] font-mono text-muted flex items-center">
                +{years.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Tech stack */}
        {techs.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <Code2 size={13} className="text-muted shrink-0" />
            <div className="flex flex-wrap gap-1 overflow-hidden h-[20px] font-mono text-[10px]">
              {techs.slice(0, 3).map((tech, idx) => (
                <span
                  key={`${tech}-${idx}`}
                  className="bg-base border border-hairline px-1.5 py-0.5 rounded-md text-primary shrink-0"
                >
                  {tech}
                </span>
              ))}
              {techs.length > 3 && (
                <span className="text-muted shrink-0 flex items-center">
                  +{techs.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-hairline flex flex-col gap-2">
          <Button
            href={`/projects?orgSlug=${org.slug}`}
            variant="outline"
            className="w-full text-xs group/btn"
            analyticsId={`explore_org_${org.slug}`}
          >
            <span className="flex items-center justify-center gap-1.5 w-full">
              Explore this org
              <ArrowRight
                size={13}
                className="transition-transform group-hover/btn:translate-x-0.5"
              />
            </span>
          </Button>
          {showActions && orgId && (
            <SaveButton
              className="w-full [&>button]:w-full [&>button]:justify-center"
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
          )}
        </div>
      </div>
    </div>
  );
}

export function ProgramOrgCardSkeleton() {
  return (
    <div className="border border-hairline rounded-2xl bg-surface flex flex-col h-full relative overflow-hidden animate-pulse">
      <div className="h-[3px] w-full bg-hairline" />
      <div className="p-5">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-xl bg-base shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 w-3/4 bg-base rounded-md mb-1.5" />
            <div className="h-3 w-1/2 bg-base rounded-md" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3.5 w-full bg-base rounded-md" />
          <div className="h-3.5 w-5/6 bg-base rounded-md" />
        </div>
        <div className="flex gap-1.5 mb-3">
          <div className="h-5 w-12 bg-base rounded-md" />
          <div className="h-5 w-12 bg-base rounded-md" />
          <div className="h-5 w-12 bg-base rounded-md" />
        </div>
        <div className="pt-3 border-t border-hairline">
          <div className="h-9 w-full bg-base rounded-xl" />
        </div>
      </div>
    </div>
  );
}
