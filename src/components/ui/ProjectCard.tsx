import React from 'react';
import Link from 'next/link';
import { ExternalLink, Code2, Users } from 'lucide-react';
import { Project } from '../../../types';
import { SaveButton, TrackApplicationButton } from './SaveTrackActions';

export function ProjectCard({
  project,
  showActions = true,
  initialSaved = false,
  initialTracked = false,
}: {
  project: Project;
  showActions?: boolean;
  initialSaved?: boolean;
  initialTracked?: boolean;
}) {
  const projectId = project._id ? String(project._id) : '';

  return (
    <div className="group border border-hairline rounded-md p-6 bg-surface flex flex-col h-full transition-all duration-150 ease-in-out hover:elevation-2 hover:bg-surface-raised focus-within:ring-2 focus-within:ring-brass focus-within:ring-offset-2 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-hairline group-hover:bg-program-accent transition-colors duration-150" />

      <div className="flex justify-between items-start gap-4 mb-3 mt-2">
        <h2 className="text-lg font-bold line-clamp-2 leading-tight text-primary group-hover:text-program-accent transition-colors duration-100">
          {project.title}
        </h2>
        {project.difficulty && (
          <span className="shrink-0 bg-base text-primary border border-hairline text-[11px] px-2 py-0.5 rounded-sm font-mono uppercase tracking-wide">
            {project.difficulty}
          </span>
        )}
      </div>

      <div className="text-xs text-muted mb-4 flex gap-2 items-center font-mono uppercase tracking-wide">
        <Link
          href={`/organizations?orgSlug=${project.orgSlug}`}
          className="hover:text-program-accent transition-colors focus-visible:outline-none focus-visible:underline"
        >
          {project.org}
        </Link>
        <span className="text-hairline">•</span>
        <span>{project.year}</span>
      </div>

      <p className="text-muted text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
        {project.description}
      </p>

      <div className="mt-auto pt-4 border-t border-hairline">
        <div className="flex items-center gap-2 mb-4 text-xs font-mono">
          <Code2 size={14} className="text-muted shrink-0" />
          <div className="flex flex-wrap gap-1.5 overflow-hidden h-[22px]">
            {project.techStack?.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="bg-base border border-hairline px-1.5 py-0.5 rounded-sm text-primary shrink-0"
              >
                {tech}
              </span>
            ))}
            {project.techStack && project.techStack.length > 3 && (
              <span className="text-muted shrink-0 flex items-center">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center font-mono text-xs mt-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-muted min-w-0">
            <Users size={14} className="shrink-0" />
            <span className="line-clamp-1 uppercase">
              {project.mentors?.slice(0, 2).join(', ') || 'TBA'}
              {project.mentors && project.mentors.length > 2
                ? ` +${project.mentors.length - 2}`
                : ''}
            </span>
          </div>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium text-slate hover:text-brass transition-colors uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass rounded-sm px-1 -mx-1"
            >
              Code <ExternalLink size={12} />
            </a>
          )}
        </div>

        {showActions && projectId && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-hairline/80">
            <SaveButton
              payload={{
                type: 'project',
                targetId: projectId,
                title: project.title,
                subtitle: project.org,
                slug: project.orgSlug,
                techStack: project.techStack?.slice(0, 12),
                programSlug: project.programName,
              }}
              initialSaved={initialSaved}
            />
            <TrackApplicationButton
              payload={{
                projectId,
                projectTitle: project.title,
                orgName: project.org,
                orgSlug: project.orgSlug,
                programId: project.programId ? String(project.programId) : undefined,
                programName: project.programName,
                status: 'researching',
              }}
              initialTracked={initialTracked}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="border border-hairline rounded-md p-6 bg-surface flex flex-col h-full relative overflow-hidden animate-pulse">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-hairline" />

      <div className="flex justify-between items-start gap-4 mb-3 mt-2">
        <div className="h-5 w-3/4 bg-base rounded-sm" />
        <div className="h-4 w-16 bg-base rounded-sm shrink-0" />
      </div>

      <div className="flex gap-2 items-center mb-4">
        <div className="h-3 w-20 bg-base rounded-sm" />
        <div className="h-3 w-3 bg-base rounded-sm" />
        <div className="h-3 w-12 bg-base rounded-sm" />
      </div>

      <div className="space-y-2 mb-6 flex-grow">
        <div className="h-4 w-full bg-base rounded-sm" />
        <div className="h-4 w-full bg-base rounded-sm" />
        <div className="h-4 w-4/5 bg-base rounded-sm" />
      </div>

      <div className="mt-auto pt-4 border-t border-hairline">
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-12 bg-base rounded-sm" />
          <div className="h-5 w-16 bg-base rounded-sm" />
        </div>
        <div className="flex justify-between mt-2">
          <div className="h-4 w-24 bg-base rounded-sm" />
          <div className="h-4 w-12 bg-base rounded-sm" />
        </div>
        <div className="flex gap-2 mt-4 pt-3 border-t border-hairline/80">
          <div className="h-8 w-16 bg-base rounded-lg" />
          <div className="h-8 w-28 bg-base rounded-lg" />
        </div>
      </div>
    </div>
  );
}
