'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Code2,
  Calendar,
  Sparkles,
  DollarSign,
  Clock,
  Github,
  Award,
  Layers,
  Building2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { Project } from '../../../types';
import { getProjectScopeAndStipend } from '@/lib/project-utils';

interface ProjectDetailModalProps {
  project: Project | null;
  orgName?: string;
  onClose: () => void;
}

export function ProjectDetailModal({
  project,
  orgName,
  onClose,
}: ProjectDetailModalProps) {
  if (!project) return null;

  const scope = getProjectScopeAndStipend({
    title: project.title,
    description: project.description,
    difficulty: project.difficulty,
    programName: project.programName,
  });

  const proposalStudioUrl = `/proposal-studio?projectId=${String(project._id || '')}&projectTitle=${encodeURIComponent(
    project.title
  )}&orgName=${encodeURIComponent(orgName || project.org || '')}&orgSlug=${encodeURIComponent(
    project.orgSlug || ''
  )}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-xs">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-surface border border-hairline rounded-2xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Top Brand Header Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent via-brass to-emerald-500" />

          {/* Modal Header */}
          <div className="p-6 pb-4 border-b border-hairline flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-page border border-hairline text-muted">
                  <Building2 size={11} className="text-accent" />
                  {orgName || project.org}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-page border border-hairline text-muted">
                  <Calendar size={11} />
                  {project.year}
                </span>
                {project.difficulty && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                    <Award size={11} />
                    {project.difficulty}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-primary leading-snug">
                {project.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted hover:text-primary hover:bg-page transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* Scope & Stipend Highlight Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-page/80 border border-hairline">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold">
                    Estimated Stipend
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-base mt-0.5">
                    {scope.stipendRange}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Location-adjusted contributor stipend
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold">
                    Project Size & Duration
                  </div>
                  <div className="font-bold text-primary text-base mt-0.5">
                    {scope.sizeLabel} (~{scope.durationWeeks} weeks)
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    ~{scope.hours} hours estimated effort
                  </div>
                </div>
              </div>
            </div>

            {/* Contributor / Student / Mentors */}
            {(project.student || project.contributor || (project.mentors && project.mentors.length > 0)) && (
              <div className="flex flex-wrap gap-4 p-3 rounded-xl bg-surface border border-hairline/70">
                {(project.student || project.contributor) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider font-bold">
                      Contributor:
                    </span>
                    <span className="text-xs font-bold text-primary font-mono bg-page px-2 py-0.5 rounded border border-hairline">
                      {project.student || project.contributor}
                    </span>
                  </div>
                )}
                {project.mentors && project.mentors.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider font-bold">
                      Mentors:
                    </span>
                    {project.mentors.map((mentor) => (
                      <span
                        key={mentor}
                        className="text-xs text-secondary font-mono bg-page px-2 py-0.5 rounded border border-hairline"
                      >
                        {mentor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Project Description */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
                <FileText size={13} className="text-accent" />
                Project Description & Overview
              </h3>
              <div className="text-secondary leading-relaxed whitespace-pre-line bg-page/40 p-4 rounded-xl border border-hairline">
                {project.description}
              </div>
            </div>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
                  <Code2 size={13} className="text-accent" />
                  Technologies & Languages
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {project.topics && project.topics.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
                  <Layers size={13} className="text-accent" />
                  Domains & Topics
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-page border border-hairline text-secondary"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 bg-page/80 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-hairline bg-surface hover:bg-surface-raised transition-colors text-primary w-full sm:w-auto"
                >
                  <Github size={14} />
                  Repository
                  <ExternalLink size={11} className="text-muted" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold border border-hairline hover:bg-surface text-secondary transition-colors cursor-pointer w-full sm:w-auto text-center"
              >
                Close
              </button>
              <Link
                href={proposalStudioUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-90 transition-all shadow-sm w-full sm:w-auto text-center"
              >
                <Sparkles size={14} />
                Draft Proposal in Studio
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
