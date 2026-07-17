import React from 'react';
import { Building2, Code2 } from 'lucide-react';
import { Organization } from '../../../types';
import { Button } from './Button';
import { SaveButton } from './SaveTrackActions';

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

  return (
    <div className="group border border-hairline rounded-md p-6 bg-surface flex flex-col h-full transition-all duration-150 ease-in-out hover:elevation-2 hover:bg-surface-raised focus-within:ring-2 focus-within:ring-brass focus-within:ring-offset-2 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-[2px] bg-hairline group-hover:bg-program-accent transition-colors duration-150"
        style={{ backgroundColor: org.backgroundColor || undefined }}
      />

      <div className="flex items-start gap-4 mb-4 mt-2">
        {org.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={org.logoUrl}
            alt={`${org.name} logo`}
            className="w-10 h-10 rounded-sm object-contain bg-white border border-hairline shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-sm bg-base flex items-center justify-center border border-hairline shrink-0">
            <Building2 size={20} className="text-muted" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold line-clamp-1 text-primary group-hover:text-program-accent transition-colors duration-100">
            {org.name}
          </h2>
          <p className="text-xs text-muted font-mono mt-1 uppercase tracking-wide">
            {org.category || 'OPEN SOURCE'}
          </p>
        </div>
      </div>

      <p className="text-muted text-sm mb-5 line-clamp-3 flex-grow leading-relaxed">
        {org.description}
      </p>

      <div className="mt-auto pt-4 border-t border-hairline">
        <div className="flex items-center gap-2 mb-4 text-xs text-muted">
          <Code2 size={14} className="shrink-0" />
          <div className="flex flex-wrap gap-1.5 overflow-hidden h-[22px] font-mono">
            {org.technologies?.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="bg-base border border-hairline px-1.5 py-0.5 rounded-sm text-primary shrink-0"
              >
                {tech}
              </span>
            ))}
            {org.technologies && org.technologies.length > 3 && (
              <span className="text-muted shrink-0 flex items-center">
                +{org.technologies.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            href={`/projects?orgSlug=${org.slug}`}
            variant="outline"
            className="w-full focus-visible:ring-0 focus-visible:outline-none"
            analyticsId={`view_org_projects_${org.slug}`}
          >
            Explore Projects
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
                techStack: org.technologies?.slice(0, 12),
              }}
              initialSaved={initialSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function OrgCardSkeleton() {
  return (
    <div className="border border-hairline rounded-md p-6 bg-surface flex flex-col h-full relative overflow-hidden animate-pulse">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-hairline" />

      <div className="flex items-start gap-4 mb-4 mt-2">
        <div className="w-10 h-10 rounded-sm bg-base shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-5 w-3/4 bg-base rounded-sm mb-2" />
          <div className="h-3 w-1/2 bg-base rounded-sm" />
        </div>
      </div>

      <div className="space-y-2 mb-5 flex-grow">
        <div className="h-4 w-full bg-base rounded-sm" />
        <div className="h-4 w-full bg-base rounded-sm" />
        <div className="h-4 w-5/6 bg-base rounded-sm" />
      </div>

      <div className="mt-auto pt-4 border-t border-hairline">
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-12 bg-base rounded-sm" />
          <div className="h-5 w-16 bg-base rounded-sm" />
        </div>
        <div className="h-10 w-full bg-base rounded-sm" />
        <div className="h-8 w-full bg-base rounded-lg mt-2" />
      </div>
    </div>
  );
}
