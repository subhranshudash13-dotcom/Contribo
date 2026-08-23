'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Twitter,
  Mail,
  MessageSquare,
  FileText,
  Share2,
  Check,
  Building2,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  Flame,
  Lightbulb,
  DollarSign,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Organization, Project, Program } from '../../../types';
import { OrgLogo } from '@/components/ui/OrgLogo';
import { SaveButton } from '@/components/ui/SaveTrackActions';
import { OrgProjectBarChart, OrgYearStat } from '@/components/ui/OrgProjectBarChart';
import { ProjectDetailModal } from './ProjectDetailModal';
import { getProjectScopeAndStipend } from '@/lib/project-utils';

interface OrgDetailPageClientProps {
  org: Organization;
  program: Program | null;
  projects: Project[];
  similarOrgs: Organization[];
  initialSaved?: boolean;
}

export function OrgDetailPageClient({
  org,
  program,
  projects,
  similarOrgs,
  initialSaved = false,
}: OrgDetailPageClientProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAllProjects, setShowAllProjects] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const orgId = org._id ? String(org._id) : '';
  const yearsList = useMemo(() => {
    const raw = org.years || [];
    const projectYears = projects.map((p) => p.year).filter((y) => Number.isFinite(y));
    const combined = Array.from(new Set([...raw, ...projectYears])).sort((a, b) => b - a);
    return combined;
  }, [org.years, projects]);

  // Compute yearly project distribution for the bar chart
  const chartData: OrgYearStat[] = useMemo(() => {
    const countsByYear: Record<number, number> = {};

    projects.forEach((p) => {
      if (p.year) {
        countsByYear[p.year] = (countsByYear[p.year] || 0) + 1;
      }
    });

    if (yearsList.length > 0) {
      yearsList.forEach((y) => {
        if (countsByYear[y] === undefined) {
          countsByYear[y] = 0;
        }
      });
    }

    const stats = Object.entries(countsByYear).map(([year, count]) => ({
      year: Number(year),
      count,
    }));

    return stats.sort((a, b) => a.year - b.year);
  }, [projects, yearsList]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedYear !== 'all' && p.year !== Number(selectedYear)) {
        return false;
      }
      if (selectedDifficulty !== 'all' && p.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesTech = p.techStack?.some((t) => t.toLowerCase().includes(q));
        const matchesTopics = p.topics?.some((t) => t.toLowerCase().includes(q));
        const matchesMentor = p.mentors?.some((m) => m.toLowerCase().includes(q));
        const matchesStudent = p.student?.toLowerCase().includes(q) || p.contributor?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTech && !matchesTopics && !matchesMentor && !matchesStudent) {
          return false;
        }
      }
      return true;
    });
  }, [projects, selectedYear, selectedDifficulty, searchQuery]);

  // Visible projects (first 5 by default, expand on toggle)
  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 5);

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const programName = program?.name || 'Google Summer of Code';
  const programAccent = program?.accentColor || '#3B82F6';

  return (
    <div className="w-full pb-16">
      {/* Top Header Section: Compact & Minimal */}
      <div className="mb-6 pb-4 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border"
              style={{
                borderColor: `color-mix(in srgb, ${programAccent} 35%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${programAccent} 8%, transparent)`,
                color: programAccent,
              }}
            >
              {programName}
            </span>
            {org.is2026 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Flame size={11} className="text-emerald-500" /> Active 2026
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary tracking-tight">
            {org.name}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border border-hairline bg-surface hover:bg-surface-raised transition-all text-secondary hover:text-primary cursor-pointer shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-500 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Share2 size={12} />
                <span>Share</span>
              </>
            )}
          </button>
          {orgId && (
            <SaveButton
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

      {/* Main 2-Column Showcase: Org Details Prominently Enlarged (7 cols) & Compact Chart/Similar Orgs (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
        {/* Left Column: Organization Profile Card — Enlarged & Specially Highlighted */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="border border-hairline rounded-2xl bg-surface p-6 sm:p-7 flex flex-col justify-between h-full shadow-sm hover:border-accent/40 transition-all relative overflow-hidden ring-1 ring-accent/10">
            {/* Top Brand Decorative Glow Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: org.backgroundColor || programAccent }}
            />

            <div>
              {/* Highlighted Top Banner: Logo + Primary Action + Socials */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 pb-6 border-b border-hairline/80">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-page border border-hairline/80 p-3.5 flex items-center justify-center shadow-xs shrink-0">
                  <OrgLogo
                    logoUrl={org.logoUrl}
                    name={org.name}
                    className="w-full h-full object-contain"
                    size={52}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                      {org.category || 'Open Source Software'}
                    </span>
                    {yearsList.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-muted bg-page border border-hairline">
                        {yearsList.length} Program Years
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-primary leading-tight mb-2">
                    {org.name}
                  </h2>

                  {/* Visit Site Button & Social Strip */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
                    {org.websiteUrl ? (
                      <a
                        href={org.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-white bg-zinc-950 dark:bg-zinc-900 hover:bg-black dark:hover:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 shadow-xs transition-all cursor-pointer"
                      >
                        <Globe size={13} />
                        Visit Official Site
                        <ArrowUpRight size={13} className="opacity-80" />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-muted bg-page border border-hairline">
                        <Globe size={13} /> Open Source
                      </div>
                    )}

                    {/* Social links */}
                    <div className="flex items-center gap-1.5">
                      {org.twitterUrl && (
                        <a
                          href={org.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-page border border-hairline flex items-center justify-center text-muted hover:text-primary hover:border-accent/40 transition-all"
                          title="Twitter / X"
                        >
                          <Twitter size={14} />
                        </a>
                      )}
                      {(org.contactEmail || org.mailingList) && (
                        <a
                          href={org.contactEmail ? `mailto:${org.contactEmail}` : org.mailingList}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-page border border-hairline flex items-center justify-center text-muted hover:text-primary hover:border-accent/40 transition-all"
                          title="Contact / Mailing List"
                        >
                          <Mail size={14} />
                        </a>
                      )}
                      {(org.chatUrl || org.ircChannel) && (
                        <a
                          href={org.chatUrl || org.ircChannel}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-page border border-hairline flex items-center justify-center text-muted hover:text-primary hover:border-accent/40 transition-all"
                          title="Community Chat"
                        >
                          <MessageSquare size={14} />
                        </a>
                      )}
                      {org.ideasUrl && (
                        <a
                          href={org.ideasUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-page border border-hairline flex items-center justify-center text-muted hover:text-primary hover:border-accent/40 transition-all"
                          title="Project Ideas List"
                        >
                          <Lightbulb size={14} />
                        </a>
                      )}
                      {org.blogUrl && (
                        <a
                          href={org.blogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-page border border-hairline flex items-center justify-center text-muted hover:text-primary hover:border-accent/40 transition-all"
                          title="Documentation / Blog"
                        >
                          <FileText size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tagline / Full Description */}
              <div className="mb-6">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold mb-1.5">
                  About the Organization
                </h3>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed font-normal">
                  {org.description}
                </p>
              </div>

              {/* Technologies Section */}
              {org.technologies && org.technologies.length > 0 && (
                <div className="mb-5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold block mb-2">
                    Primary Technologies & Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {org.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics / Domains */}
              {org.topics && org.topics.length > 0 && (
                <div className="mb-5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold block mb-2">
                    Technical Topics & Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {org.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-0.5 rounded-md text-xs font-mono text-secondary bg-page border border-hairline"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Years */}
              {yearsList.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold block mb-2">
                    Participation Years
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {yearsList.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(String(year));
                          const el = document.getElementById('past-projects-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                          selectedYear === String(year)
                            ? 'bg-[#0E7490] border-[#0E7490] text-white shadow-2xs'
                            : 'bg-page border-hairline text-secondary hover:text-primary hover:border-accent/40'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Proposal Action */}
            <div className="mt-6 pt-4 border-t border-hairline">
              <Link
                href={`/proposal-studio?orgSlug=${encodeURIComponent(org.slug)}&orgName=${encodeURIComponent(
                  org.name
                )}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-primary bg-page border border-hairline hover:border-accent/40 hover:bg-surface-raised transition-all text-center shadow-2xs"
              >
                <Sparkles size={14} className="text-accent" />
                Draft Project Proposal for {org.name}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Compact Bargraph, Metrics & Shifted Similar Orgs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Reduced-Height Completed Projects Bar Chart */}
          <div className="border border-hairline rounded-2xl bg-surface p-4 sm:p-5 shadow-2xs">
            <h2 className="text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-accent" />
              Completed Projects Distribution
            </h2>
            <OrgProjectBarChart data={chartData} orgName={org.name} className="border-0 bg-transparent p-0" />
          </div>

          {/* Quick Metrics 4-Cell Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl border border-hairline bg-surface">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted font-bold block">
                Projects
              </span>
              <span className="text-base font-bold font-heading text-primary mt-0.5 block">
                {projects.length || org.projectCount || chartData.reduce((a, b) => a + b.count, 0) || 'Active'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-hairline bg-surface">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted font-bold block">
                Years Active
              </span>
              <span className="text-base font-bold font-heading text-accent mt-0.5 block">
                {yearsList.length || 1}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-hairline bg-surface">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted font-bold block">
                Stack
              </span>
              <span className="text-xs font-bold font-mono text-primary mt-0.5 block truncate">
                {org.technologies?.[0] || 'Polyglot'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-hairline bg-surface">
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted font-bold block">
                Tier
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                Tier {program?.tier || 1}
              </span>
            </div>
          </div>

          {/* Similar Organizations (Shifted to Top Section below Bar Graph) */}
          {similarOrgs && similarOrgs.length > 0 && (
            <div className="border border-hairline rounded-2xl bg-surface p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-bold flex items-center gap-1.5">
                  <Building2 size={13} className="text-accent" />
                  Similar Organizations
                </h3>
                <Link
                  href="/organizations"
                  className="text-[10px] font-mono font-bold text-accent hover:underline flex items-center gap-0.5"
                >
                  All <ArrowRight size={10} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {similarOrgs.slice(0, 4).map((simOrg) => (
                  <Link
                    key={String(simOrg._id || simOrg.slug)}
                    href={`/organizations/${simOrg.slug}`}
                    className="group border border-hairline rounded-xl bg-page/60 hover:bg-page hover:border-accent/40 p-2.5 flex items-center gap-2.5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface border border-hairline p-1 flex items-center justify-center shrink-0">
                      <OrgLogo
                        logoUrl={simOrg.logoUrl}
                        name={simOrg.name}
                        className="w-full h-full object-contain"
                        size={18}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-primary group-hover:text-accent transition-colors truncate">
                        {simOrg.name}
                      </h4>
                      <p className="text-[9px] font-mono text-muted uppercase tracking-wider truncate">
                        {simOrg.category || 'Open Source'}
                      </p>
                    </div>
                    <ArrowRight size={11} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Ideas List Banner if available */}
          {org.ideasUrl && (
            <div className="p-3 rounded-xl border border-accent/20 bg-accent/5 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Lightbulb size={15} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-primary truncate">Official Project Ideas List</h4>
                  <p className="text-[10px] text-muted truncate">Explore maintainer wishlists.</p>
                </div>
              </div>
              <a
                href={org.ideasUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-accent text-white hover:opacity-90 transition-all shrink-0 text-[11px]"
              >
                Ideas <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Past Projects Section: First 5 by Default + "View More" Toggle */}
      <section id="past-projects-section" className="mt-8 pt-6 border-t border-hairline">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-primary tracking-tight">
              Past Projects
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Showing {visibleProjects.length} of {filteredProjects.length} projects. Click any project card for scope, mentors, and proposal studio.
            </p>
          </div>

          <span className="text-[11px] font-mono text-muted bg-surface px-2.5 py-1 rounded-lg border border-hairline self-start sm:self-auto">
            {filteredProjects.length} total projects
          </span>
        </div>

        {/* Year Filter Pills Strip */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-1 overflow-x-auto">
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                : 'bg-surface border-hairline text-secondary hover:text-primary hover:border-accent/40'
            }`}
          >
            All Years
          </button>
          {yearsList.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(String(year))}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                selectedYear === String(year)
                  ? 'bg-accent text-white border-accent shadow-2xs'
                  : 'bg-surface border-hairline text-secondary hover:text-primary hover:border-accent/40'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Search & Difficulty Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter projects by title, stack, mentor..."
              className="w-full bg-surface border border-hairline rounded-xl pl-9 pr-3 py-2 text-xs text-primary placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent font-mono"
            />
          </div>

          <div className="sm:w-44">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-surface border border-hairline rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Compact & Refined Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-hairline bg-surface p-5">
            <Building2 size={28} className="mx-auto mb-2 text-muted" />
            <h3 className="text-xs font-bold text-primary mb-1">No projects match the selected filters</h3>
            <button
              onClick={() => {
                setSelectedYear('all');
                setSearchQuery('');
                setSelectedDifficulty('all');
              }}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-accent border border-accent/30 hover:bg-accent/5 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {visibleProjects.map((project) => {
                const scope = getProjectScopeAndStipend({
                  title: project.title,
                  description: project.description,
                  difficulty: project.difficulty,
                  programName: project.programName,
                });

                return (
                  <div
                    key={String(project._id || project.title)}
                    onClick={() => setSelectedProject(project)}
                    className="group border border-hairline rounded-xl bg-surface p-4 flex flex-col justify-between hover:border-accent/40 hover:shadow-sm transition-all duration-150 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-hairline group-hover:bg-accent transition-colors" />

                    <div>
                      {/* Title & Difficulty */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-xs sm:text-sm font-bold font-heading text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                          {project.title}
                        </h3>
                        {project.difficulty && (
                          <span className="shrink-0 text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-page border border-hairline text-muted">
                            {project.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Contributor / Mentor */}
                      {(project.student || project.contributor || (project.mentors && project.mentors.length > 0)) && (
                        <p className="text-[11px] text-muted font-mono mb-2 line-clamp-1">
                          {project.student || project.contributor ? (
                            <span className="text-primary font-medium">
                              Contributor: {project.student || project.contributor}
                            </span>
                          ) : (
                            <span>Mentors: {project.mentors.join(', ')}</span>
                          )}
                        </p>
                      )}

                      {/* Description snippet */}
                      <p className="text-[11px] text-secondary leading-relaxed line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    </div>

                    <div>
                      {/* Size & Stipend Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pt-2 border-t border-hairline/60">
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                          <Clock size={10} />
                          {scope.sizeLabel}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <DollarSign size={10} />
                          {scope.shortStipend}
                        </span>
                      </div>

                      {/* Tech Stack Micro-Pills */}
                      {project.techStack && project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5 h-[18px] overflow-hidden">
                          {project.techStack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-page border border-hairline text-muted"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="text-[9px] font-mono text-muted flex items-center">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Card Footer: More Details & Proposal launcher */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-1">
                        <span className="text-accent font-semibold group-hover:underline inline-flex items-center gap-0.5">
                          More Details <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>

                        <Link
                          href={`/proposal-studio?projectId=${String(project._id || '')}&projectTitle=${encodeURIComponent(
                            project.title
                          )}&orgName=${encodeURIComponent(org.name)}&orgSlug=${encodeURIComponent(org.slug)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-md text-muted hover:text-accent hover:bg-page transition-colors"
                          title="Draft Proposal in Studio"
                        >
                          <Sparkles size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More / Show Less Button */}
            {filteredProjects.length > 5 && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-hairline bg-surface hover:bg-surface-raised hover:border-accent/40 text-xs font-mono font-bold text-primary transition-all shadow-xs cursor-pointer"
                >
                  {showAllProjects ? (
                    <>
                      <span>Show Less Projects</span>
                      <ChevronUp size={14} className="text-accent" />
                    </>
                  ) : (
                    <>
                      <span>View All Projects ({filteredProjects.length - 5} more)</span>
                      <ChevronDown size={14} className="text-accent" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        orgName={org.name}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
