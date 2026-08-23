'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Building2,
  Sparkles,
  Globe,
  Brain,
  Server,
  ArrowRight,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  Banknote,
  Clock,
} from 'lucide-react';
import { SaveButton, TrackApplicationButton } from '@/components/ui/SaveTrackActions';
import { getProjectScopeAndStipend } from '@/lib/project-utils';

export type TrendingProject = {
  id: string;
  title: string;
  org: string;
  orgSlug?: string;
  difficulty: string;
  techStack: string[];
  stars: number;
  description: string;
  programId?: string;
  programName?: string;
  year?: number;
};

interface TrendingProjectsProps {
  projects: TrendingProject[];
  savedProjects?: string[];
  trackedProjects?: string[];
}

type Domain = 'all' | 'web' | 'ai' | 'systems';

const WEB_TOKENS = new Set([
  'javascript',
  'js',
  'typescript',
  'ts',
  'react',
  'next.js',
  'nextjs',
  'html',
  'css',
  'svelte',
  'vue',
  'angular',
  'flutter',
  'ui',
  'frontend',
  'tailwindcss',
  'html/css',
  'sass',
  'graphql',
]);

const AI_TOKENS = new Set([
  'python',
  'machine learning',
  'pytorch',
  'tensorflow',
  'deep learning',
  'data science',
  'nlp',
  'computer vision',
  'r',
  'julia',
  'jupyter',
  'ai',
  'genai',
  'llm',
  'scikit-learn',
  'pandas',
  'numpy',
  'discord.py',
]);

const SYS_TOKENS = new Set([
  'go',
  'golang',
  'rust',
  'c++',
  'c',
  'c/c++',
  'c#',
  'shell',
  'docker',
  'kubernetes',
  'linux',
  'aws',
  'prometheus',
  'webassembly',
  'devops',
  'backend',
  'cli',
  'ebpf',
  'terraform',
]);

function classifyDomains(techStack: string[]): Domain[] {
  const stack = techStack.map((t) => t.toLowerCase());
  const domains: Domain[] = [];
  if (stack.some((t) => WEB_TOKENS.has(t))) domains.push('web');
  if (stack.some((t) => AI_TOKENS.has(t))) domains.push('ai');
  if (stack.some((t) => SYS_TOKENS.has(t))) domains.push('systems');
  if (domains.length === 0) domains.push('systems');
  return domains;
}

const TABS: {
  id: Domain;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'all', label: 'All Stacks', icon: Layers },
  { id: 'web', label: 'Web & UI', icon: Globe },
  { id: 'ai', label: 'AI & Data', icon: Brain },
  { id: 'systems', label: 'Systems & Cloud', icon: Server },
];

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

/**
 * Cohesive Theme-Matched Subtle Color System:
 * - Uses Contribo's native design tokens (bg-surface, text-primary, text-secondary, border-hairline)
 * - Harmonious translucent color tints for every card
 * - Flawless light and dark mode support with 100% text contrast
 */
interface CardPalette {
  tintBg: string;
  border: string;
  accentBar: string;
  numberTag: string;
  badge: string;
}

const CARD_PALETTES: CardPalette[] = [
  {
    // 1. Sage Emerald
    tintBg: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] hover:bg-emerald-500/[0.08]',
    border: 'border-emerald-500/25 hover:border-emerald-500/50',
    accentBar: 'bg-emerald-500',
    numberTag: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
  },
  {
    // 2. Warm Amber
    tintBg: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06] hover:bg-amber-500/[0.08]',
    border: 'border-amber-500/25 hover:border-amber-500/50',
    accentBar: 'bg-amber-500',
    numberTag: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
  },
  {
    // 3. Sky Blue
    tintBg: 'bg-sky-500/[0.04] dark:bg-sky-500/[0.06] hover:bg-sky-500/[0.08]',
    border: 'border-sky-500/25 hover:border-sky-500/50',
    accentBar: 'bg-sky-500',
    numberTag: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
  },
  {
    // 4. Rose / Terracotta
    tintBg: 'bg-rose-500/[0.04] dark:bg-rose-500/[0.06] hover:bg-rose-500/[0.08]',
    border: 'border-rose-500/25 hover:border-rose-500/50',
    accentBar: 'bg-rose-500',
    numberTag: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
  },
  {
    // 5. Purple / Violet
    tintBg: 'bg-purple-500/[0.04] dark:bg-purple-500/[0.06] hover:bg-purple-500/[0.08]',
    border: 'border-purple-500/25 hover:border-purple-500/50',
    accentBar: 'bg-purple-500',
    numberTag: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
  },
  {
    // 6. Orange / Copper
    tintBg: 'bg-orange-500/[0.04] dark:bg-orange-500/[0.06] hover:bg-orange-500/[0.08]',
    border: 'border-orange-500/25 hover:border-orange-500/50',
    accentBar: 'bg-orange-500',
    numberTag: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/25',
  },
  {
    // 7. Seafoam Teal
    tintBg: 'bg-teal-500/[0.04] dark:bg-teal-500/[0.06] hover:bg-teal-500/[0.08]',
    border: 'border-teal-500/25 hover:border-teal-500/50',
    accentBar: 'bg-teal-500',
    numberTag: 'text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25',
  },
  {
    // 8. Indigo
    tintBg: 'bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] hover:bg-indigo-500/[0.08]',
    border: 'border-indigo-500/25 hover:border-indigo-500/50',
    accentBar: 'bg-indigo-500',
    numberTag: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
  },
];

const INITIAL_DISPLAY_COUNT = 6;

export function TrendingProjects({
  projects,
  savedProjects = [],
  trackedProjects = [],
}: TrendingProjectsProps) {
  const [domain, setDomain] = useState<Domain>('all');
  const [showAll, setShowAll] = useState(false);

  const classified = useMemo(
    () =>
      projects.map((p) => ({
        ...p,
        domains: classifyDomains(p.techStack || []),
      })),
    [projects]
  );

  const filtered = useMemo(() => {
    if (domain === 'all') return classified;
    return classified.filter((p) => p.domains.includes(domain));
  }, [classified, domain]);

  const counts = useMemo(() => {
    const c: Record<Domain, number> = { all: classified.length, web: 0, ai: 0, systems: 0 };
    for (const p of classified) {
      if (p.domains.includes('web')) c.web += 1;
      if (p.domains.includes('ai')) c.ai += 1;
      if (p.domains.includes('systems')) c.systems += 1;
    }
    return c;
  }, [classified]);

  const displayedProjects = showAll ? filtered : filtered.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <section className="w-full relative" aria-labelledby="trending-heading">
      {/* Header with High-Contrast Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-hairline">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-hairline text-xs font-mono font-medium text-secondary shadow-xs">
            <Sparkles size={13} className="text-brass" />
            <span className="tracking-wide uppercase text-[11px] font-semibold">High-Signal Opportunities</span>
          </div>
          <h2
            id="trending-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-primary font-heading"
          >
            Projects worth contributing to
          </h2>
          <p className="text-secondary text-sm sm:text-[15px] leading-relaxed">
            Handpicked opportunities across GSoC, Outreachy, LFX, and top open-source ecosystems.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/matcher"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-brass hover:bg-brass-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Sparkles size={14} />
            Match skills
          </Link>
          <Link
            href="/projects?sortBy=stars"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            All 13.4k+
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Domain Filter Tabs */}
      <div
        className="mb-8 flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border border-hairline bg-surface/70 backdrop-blur-md"
        role="tablist"
        aria-label="Filter projects by domain"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = domain === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setDomain(tab.id);
                setShowAll(false);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-surface-raised text-primary shadow-xs border border-hairline font-semibold'
                  : 'text-muted hover:text-primary hover:bg-surface/50 border border-transparent'
              }`}
            >
              <Icon size={14} className={active ? 'text-brass' : 'opacity-70'} />
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${
                  active ? 'bg-brass/15 text-brass font-bold' : 'bg-surface border border-hairline text-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid: SHARP-CORNERED BOXES (rounded-none) + COHESIVE SUBTLE COLOR PALETTES */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface/50 p-12 text-center">
          <Compass size={24} className="mx-auto text-muted mb-2 opacity-50" />
          <p className="text-primary font-medium text-sm">No curated projects found</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface/50 p-10 text-center">
          <p className="text-secondary text-sm mb-3">No projects found for this stack.</p>
          <button
            type="button"
            onClick={() => setDomain('all')}
            className="text-xs font-semibold text-brass hover:underline cursor-pointer"
          >
            Show all projects
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProjects.map((proj, idx) => {
              const projectLink = `/projects?q=${encodeURIComponent(proj.title.slice(0, 80))}`;
              const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
              const scope = getProjectScopeAndStipend({
                title: proj.title,
                description: proj.description,
                difficulty: proj.difficulty,
                programName: proj.programName,
              });

              return (
                <article
                  key={proj.id}
                  className={`group relative flex flex-col justify-between rounded-none border bg-surface ${palette.border} ${palette.tintBg} p-5 transition-all duration-200 hover:shadow-md overflow-hidden`}
                >
                  {/* Top Color Accent Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${palette.accentBar}`} />

                  <div>
                    {/* Index Coordinate & Organization Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[11px] font-mono font-bold ${palette.numberTag}`}>
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-surface-raised border border-hairline text-[11px] font-mono font-medium text-secondary truncate">
                          <Building2 size={11} className="shrink-0 text-muted" />
                          <span className="truncate">{proj.org}</span>
                        </span>
                        {proj.year && (
                          <span className="text-[10px] font-mono text-muted tabular-nums">
                            {proj.year}
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-brass tabular-nums bg-surface-raised px-1.5 py-0.5 rounded-none border border-hairline">
                        <Star size={11} className="fill-brass stroke-brass" />
                        {formatStars(proj.stars)}
                      </div>
                    </div>

                    {/* Scope, Stipend & Difficulty Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {/* Stipend Tag */}
                      <span
                        title={scope.tooltip}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-none bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono font-bold cursor-help"
                      >
                        <Banknote size={11} className="shrink-0" />
                        <span>{scope.shortStipend}</span>
                      </span>

                      {/* Size Tag */}
                      <span
                        title={scope.tooltip}
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-none ${palette.badge} border font-mono font-semibold cursor-help`}
                      >
                        <Clock size={10} className="shrink-0" />
                        <span>{scope.sizeLabel}</span>
                      </span>

                      {/* Difficulty Tag */}
                      <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded-none bg-surface-raised border border-hairline text-muted ml-auto">
                        {proj.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[15px] sm:text-base font-heading font-semibold text-primary group-hover:text-brass transition-colors leading-snug line-clamp-2 mb-2">
                      <Link href={projectLink} className="focus-visible:outline-none focus-visible:underline">
                        {proj.title}
                      </Link>
                    </h3>

                    {/* Clean Description */}
                    <p className="text-secondary text-xs sm:text-[13px] leading-relaxed line-clamp-2 mb-4">
                      {proj.description}
                    </p>
                  </div>

                  {/* Bottom Tech & Actions */}
                  <div>
                    {/* Tech Stack Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4 pt-3 border-t border-hairline/60">
                      {(proj.techStack || []).slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-none bg-surface-raised border border-hairline text-[10px] font-mono text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                      {proj.techStack && proj.techStack.length > 3 && (
                        <span className="text-[10px] font-mono text-muted font-medium">
                          +{proj.techStack.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <SaveButton
                          payload={{
                            type: 'project',
                            targetId: proj.id,
                            title: proj.title,
                            subtitle: proj.org,
                            slug: proj.orgSlug,
                            techStack: proj.techStack?.slice(0, 12),
                            programSlug: proj.programName,
                          }}
                          initialSaved={savedProjects.includes(proj.id)}
                        />
                        <TrackApplicationButton
                          payload={{
                            projectId: proj.id,
                            projectTitle: proj.title,
                            orgName: proj.org,
                            orgSlug: proj.orgSlug,
                            programId: proj.programId,
                            programName: proj.programName || 'Open Source Program',
                            status: 'researching',
                          }}
                          initialTracked={trackedProjects.includes(proj.id)}
                        />
                      </div>

                      <Link
                        href={projectLink}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-brass transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Normal Rounded Catalog Expand Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-hairline bg-surface/60 backdrop-blur-sm">
            <p className="text-xs sm:text-sm text-secondary">
              Showing <span className="font-semibold text-primary">{displayedProjects.length}</span> of{' '}
              <span className="font-semibold text-primary">{filtered.length}</span> curated opportunities
              {domain !== 'all' && (
                <span> in <span className="text-primary font-medium">{TABS.find((t) => t.id === domain)?.label}</span></span>
              )}
            </p>

            <div className="flex items-center gap-2">
              {filtered.length > INITIAL_DISPLAY_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs font-semibold transition-all cursor-pointer"
                >
                  {showAll ? (
                    <>
                      <ChevronUp size={14} />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Show all {filtered.length} picks
                    </>
                  )}
                </button>
              )}

              <Link
                href="/projects?sortBy=stars"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brass hover:bg-brass-hover text-white text-xs font-semibold transition-all shadow-xs"
              >
                All 13.4k+ Projects
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
