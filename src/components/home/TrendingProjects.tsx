'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Building2,
  TrendingUp,
  Sparkles,
  Globe,
  Brain,
  Server,
  ArrowRight,
  Compass,
  Layers,
} from 'lucide-react';
import { SaveButton, TrackApplicationButton } from '@/components/ui/SaveTrackActions';

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
  short: string;
  icon: React.ElementType;
  hint: string;
}[] = [
  { id: 'all', label: 'All', short: 'All', icon: Layers, hint: 'Every stack' },
  { id: 'web', label: 'Web', short: 'Web', icon: Globe, hint: 'UI & apps' },
  { id: 'ai', label: 'AI & Data', short: 'AI', icon: Brain, hint: 'ML & data' },
  { id: 'systems', label: 'Systems', short: 'Sys', icon: Server, hint: 'Infra & core' },
];

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

function difficultyTone(d: string) {
  const x = d.toLowerCase();
  if (x.includes('begin') || x.includes('easy')) {
    return 'text-merge bg-merge/10 border-merge/25';
  }
  if (x.includes('adv') || x.includes('hard')) {
    return 'text-alert bg-alert/10 border-alert/25';
  }
  return 'text-brass bg-brass/10 border-brass/25';
}

export function TrendingProjects({
  projects,
  savedProjects = [],
  trackedProjects = [],
}: TrendingProjectsProps) {
  const [domain, setDomain] = useState<Domain>('all');

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

  return (
    <section className="w-full" aria-labelledby="trending-heading">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass/15 text-brass">
              <TrendingUp size={12} strokeWidth={2.5} />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              Start here
            </span>
          </div>
          <h2
            id="trending-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight text-primary font-heading leading-[1.15]"
          >
            Projects worth contributing to
          </h2>
          <p className="text-secondary text-[15px] leading-relaxed max-w-xl">
            High-signal ideas from GSoC, Outreachy, LFX, GSSoC, ESoC and more. Filter by domain,
            save favorites, and track applications — one place to start your open-source career.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/matcher"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-brass text-white text-sm font-semibold shadow-sm hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2"
          >
            <Sparkles size={16} />
            Match my skills
          </Link>
          <Link
            href="/projects?sortBy=stars"
            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-hairline bg-surface text-primary text-sm font-semibold hover:border-brass/40 hover:bg-surface-raised transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2"
          >
            Full directory
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Domain filter — segmented control */}
      <div
        className="mb-8 p-1.5 rounded-2xl border border-hairline bg-base/80 backdrop-blur-sm flex flex-wrap gap-1"
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
              onClick={() => setDomain(tab.id)}
              className={`flex-1 min-w-[7.5rem] sm:min-w-0 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 ${
                active
                  ? 'bg-surface text-primary shadow-sm border border-hairline'
                  : 'text-muted hover:text-primary border border-transparent'
              }`}
            >
              <Icon size={16} className={active ? 'text-brass' : ''} strokeWidth={2} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
              <span
                className={`font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-md ${
                  active ? 'bg-brass/12 text-brass' : 'bg-surface-raised text-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-hairline bg-base">
            <Compass size={22} className="text-muted" />
          </div>
          <p className="text-primary font-semibold mb-1">No trending projects yet</p>
          <p className="text-sm text-muted max-w-md mx-auto mb-5">
            When project data is available, high-signal ideas will appear here.
          </p>
          <Link href="/projects" className="text-sm font-semibold text-brass hover:underline">
            Browse all projects →
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface px-6 py-14 text-center">
          <p className="text-primary font-semibold mb-1">Nothing in this domain yet</p>
          <p className="text-sm text-muted mb-4">Try another filter or open the full directory.</p>
          <button
            type="button"
            onClick={() => setDomain('all')}
            className="text-sm font-semibold text-brass hover:underline"
          >
            Show all projects
          </button>
        </div>
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            Showing {filtered.length} projects
            {domain !== 'all' ? ` in ${domain}` : ''}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((proj, index) => {
              const isFeatured = index === 0 && domain === 'all';
              return (
                <article
                  key={proj.id}
                  className={`group relative flex flex-col rounded-2xl border border-hairline bg-surface transition-all duration-200 hover:border-brass/35 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${
                    isFeatured
                      ? 'md:col-span-2 xl:col-span-2 md:flex-row md:items-stretch overflow-hidden'
                      : ''
                  }`}
                >
                  {/* Accent edge */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-brass/0 group-hover:bg-brass transition-colors"
                    aria-hidden
                  />

                  <div
                    className={`flex flex-1 flex-col p-5 sm:p-6 ${
                      isFeatured ? 'md:max-w-[58%]' : ''
                    }`}
                  >
                    {/* Meta row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1.5 max-w-full rounded-lg border border-hairline bg-base px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-muted">
                          <Building2 size={11} className="shrink-0" />
                          <span className="truncate">{proj.org}</span>
                        </span>
                        {proj.year && (
                          <span className="font-mono text-[10px] text-muted tabular-nums">
                            {proj.year}
                          </span>
                        )}
                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-brass/12 border border-brass/25 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-brass">
                            <Star size={10} className="fill-brass" /> Top pick
                          </span>
                        )}
                      </div>
                      <div className="shrink-0 inline-flex items-center gap-1 font-mono text-xs font-bold text-brass tabular-nums">
                        <Star size={13} className="fill-brass stroke-brass" />
                        {formatStars(proj.stars)}
                      </div>
                    </div>

                    <h3
                      className={`font-heading font-bold text-primary leading-snug tracking-tight group-hover:text-brass transition-colors ${
                        isFeatured ? 'text-xl sm:text-2xl mb-2' : 'text-base sm:text-lg mb-2'
                      }`}
                    >
                      <Link
                        href={`/projects?q=${encodeURIComponent(proj.title.slice(0, 80))}`}
                        className="focus-visible:outline-none focus-visible:underline"
                      >
                        {proj.title}
                      </Link>
                    </h3>

                    <p
                      className={`text-secondary leading-relaxed mb-4 flex-grow ${
                        isFeatured ? 'text-sm line-clamp-3' : 'text-sm line-clamp-2'
                      }`}
                    >
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${difficultyTone(
                          proj.difficulty
                        )}`}
                      >
                        {proj.difficulty}
                      </span>
                      {(proj.techStack || []).slice(0, isFeatured ? 5 : 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-hairline bg-base px-2 py-0.5 font-mono text-[10px] font-medium text-muted"
                        >
                          {t}
                        </span>
                      ))}
                      {proj.techStack && proj.techStack.length > (isFeatured ? 5 : 3) && (
                        <span className="font-mono text-[10px] text-muted">
                          +{proj.techStack.length - (isFeatured ? 5 : 3)}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-hairline flex flex-wrap items-center gap-2">
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
                      <Link
                        href={`/projects?q=${encodeURIComponent(proj.title.slice(0, 80))}`}
                        className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary transition-colors"
                      >
                        Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {isFeatured && (
                    <div className="hidden md:flex md:flex-1 flex-col justify-between border-t md:border-t-0 md:border-l border-hairline bg-base/40 p-6">
                      <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
                          Why start here
                        </p>
                        <ul className="space-y-2.5 text-sm text-secondary leading-relaxed">
                          <li className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                            Clear tech stack match signals for new contributors
                          </li>
                          <li className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                            Save now, track status later on your dashboard
                          </li>
                          <li className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                            Jump to AI matcher if you want ranked fits
                          </li>
                        </ul>
                      </div>
                      <Link
                        href="/roadmaps"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brass hover:underline"
                      >
                        <Compass size={16} />
                        New to open source? Follow a roadmap
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface px-5 py-4">
            <p className="text-sm text-secondary text-center sm:text-left">
              <span className="font-semibold text-primary">{filtered.length}</span> projects shown
              {domain !== 'all' ? (
                <>
                  {' '}
                  in <span className="font-semibold text-primary">{TABS.find((t) => t.id === domain)?.label}</span>
                </>
              ) : null}
              . Not sure where to begin?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/programs"
                className="inline-flex h-10 items-center rounded-xl border border-hairline px-4 text-sm font-semibold text-primary hover:border-brass/40 transition-colors"
              >
                Compare programs
              </Link>
              <Link
                href="/guidelines"
                className="inline-flex h-10 items-center rounded-xl bg-primary text-base px-4 text-sm font-semibold hover:opacity-90 transition-opacity dark:bg-white dark:text-black"
              >
                Read contributor guidelines
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
