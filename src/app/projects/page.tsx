import Link from 'next/link';
import { Project } from '../../../types';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterX, Search, ChevronRight, SlidersHorizontal, ChevronLeft, Star, Tag, Code, Sparkles, ArrowRight } from 'lucide-react';
import { listProjects } from '@/lib/repositories/projects';
import { auth } from '@/auth';
import { getUserItemStatus } from '@/lib/repositories/dashboard';
import { getCachedPrograms, getCachedFilterFacets } from '@/lib/data-cache';

export const metadata = {
  title: 'Projects | Contribo',
  description: 'Explore open source projects actively accepting contributors, filtered by difficulty, program, and stack.',
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const FALLBACK_TECH = [
  'Python', 'TypeScript', 'JavaScript', 'Go', 'Rust',
  'C++', 'Java', 'React', 'Node.js', 'Docker',
];

async function getProjectsData(options: {
  programId?: string;
  orgSlug?: string;
  difficulty?: string;
  tech?: string;
  q?: string;
  sortBy?: string;
  page: number;
  limit: number;
}): Promise<{
  projects: Project[];
  total: number;
  programs: { id: string; name: string; slug: string }[];
  technologies: string[];
  difficulties: string[];
}> {
  const programId =
    options.programId && options.programId !== 'all' ? options.programId : undefined;

  // Parallel: lean project page + cached programs + cached filter facets (from /api/meta/filters data path)
  const [{ projects, total }, programs, facets] = await Promise.all([
    listProjects({
      programId,
      orgSlug: options.orgSlug,
      difficulty: options.difficulty,
      tech: options.tech,
      search: options.q,
      sortBy: options.sortBy,
      limit: options.limit,
      skip: (options.page - 1) * options.limit,
      lean: true,
    }),
    getCachedPrograms(),
    getCachedFilterFacets(),
  ]);

  const techFromDb = (facets.technologies || [])
    .filter((t) => t && t.length <= 24)
    .slice(0, 16);

  return {
    projects: projects as unknown as Project[],
    total,
    programs: programs.map((p) => ({
      id: String(p._id),
      name: p.name as string,
      slug: p.slug as string,
    })),
    technologies: techFromDb.length > 0 ? techFromDb : FALLBACK_TECH,
    difficulties:
      facets.difficulties?.length > 0
        ? facets.difficulties
        : ['Beginner', 'Intermediate', 'Advanced'],
  };
}

export default async function ProjectsDirectory({ searchParams }: Props) {
  const params = await searchParams;
  
  const q = typeof params.q === 'string' ? params.q : undefined;
  let difficulty = typeof params.difficulty === 'string' ? params.difficulty : undefined;
  if (difficulty && difficulty !== 'all') {
    difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
  }
  const programId = typeof params.programId === 'string' ? params.programId : undefined;
  const orgSlug = typeof params.orgSlug === 'string' ? params.orgSlug : undefined;
  const tech = typeof params.tech === 'string' ? params.tech : undefined;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'newest';
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limit = 24; // 24 projects per page
  
  const { projects, total, programs, technologies, difficulties } = await getProjectsData({
    programId,
    orgSlug,
    difficulty,
    tech,
    q,
    sortBy,
    page,
    limit
  });

  const session = await auth();
  let savedProjects: string[] = [];
  let trackedProjects: string[] = [];

  // Batch status for visible cards only (POST /api/user/status data path)
  if (session?.user?.id && projects.length > 0) {
    try {
      const status = await getUserItemStatus(session.user.id, {
        projectIds: projects.map((p) => String(p._id)).filter(Boolean),
      });
      savedProjects = status.savedProjectIds;
      trackedProjects = status.trackedProjectIds;
    } catch (err) {
      console.error('Error fetching user status on projects page:', err);
    }
  }
  
  const totalPages = Math.ceil(total / limit);
  const startOffset = total > 0 ? (page - 1) * limit + 1 : 0;
  const endOffset = Math.min(total, page * limit);
  
  const hasActiveFilters = !!(q || (difficulty && difficulty !== 'all') || (programId && programId !== 'all') || (tech && tech !== 'all'));
  
  const createPageLink = (pageNumber: number) => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set('q', q);
    if (difficulty) urlParams.set('difficulty', difficulty);
    if (programId) urlParams.set('programId', programId);
    if (orgSlug) urlParams.set('orgSlug', orgSlug);
    if (tech) urlParams.set('tech', tech);
    if (sortBy) urlParams.set('sortBy', sortBy);
    urlParams.set('page', pageNumber.toString());
    return `/projects?${urlParams.toString()}`;
  };

  const maxPageButtons = 5;
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <main className="p-4 sm:p-6 lg:p-12 max-w-[1440px] mx-auto w-full bg-noise">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs font-mono text-muted mb-8 uppercase tracking-wide">
        <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
        <ChevronRight size={14} className="mx-2 text-hairline" />
        <span className="text-primary font-medium">Projects</span>
      </nav>

      {/* Header Block */}
      <div className="mb-8 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary font-heading">
          Explore Projects
        </h1>
        <p className="text-secondary text-sm max-w-2xl font-normal leading-relaxed">
          Find open source projects actively accepting contributors. Search repositories, filter by program milestones, difficulty tags, or tech stack.
        </p>
      </div>

      {/* Orbit AI Suitability Callout Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/25 rounded-3xl p-6 sm:p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_12px_40px_rgba(198,120,72,0.02)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-3xl relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold bg-accent/10 px-3 py-1 rounded-full border border-accent/25 inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent animate-pulse" /> Orbit AI Recommendation
          </span>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-primary font-heading leading-tight">
            Confused which project to choose or don't know which one you are most suitable to work on?
          </h2>
          <p className="text-secondary text-xs sm:text-sm font-normal">
            Use our Orbit AI Matcher to find out! Get instant matching scores based on your developer skills, preferred frameworks, and contribution experience.
          </p>
        </div>
        
        <div className="shrink-0 w-full md:w-auto relative z-10">
          <Link 
            href="/matcher" 
            className="inline-flex items-center justify-center h-12 px-6 bg-accent hover:bg-accent-hover text-white font-semibold rounded-2xl transition-all shadow-[0_4px_20px_rgba(198,120,72,0.15)] dark:shadow-[0_4px_20px_rgba(229,149,105,0.1)] gap-2 group w-full md:w-auto cursor-pointer"
          >
            <span>Match with Orbit AI</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
      
      {/* Search and Filters Layout Wrapper */}
      <form id="filters-form" action="/projects" method="GET">
        {orgSlug && <input type="hidden" name="orgSlug" value={orgSlug} />}
        <input type="hidden" name="tech" value={tech || "all"} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Sidebar Filters */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 bg-surface border border-hairline/85 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-hairline/60">
              <span className="font-heading font-medium text-sm text-primary flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </span>
              {hasActiveFilters && (
                <Link 
                  href="/projects" 
                  className="text-xs text-accent hover:text-accent-hover font-mono flex items-center gap-1 uppercase tracking-wider font-semibold"
                >
                  <FilterX size={13} /> Clear
                </Link>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={q || ""} 
                  placeholder="Title, tech, org..."
                  className="w-full bg-base border border-hairline rounded-xl pl-9 pr-4 py-2 text-sm text-primary placeholder-muted/80 focus:outline-none focus:border-accent"
                />
                <Search size={14} className="absolute left-3.5 top-3 text-muted/70" />
              </div>
            </div>

            {/* Difficulty Level — from /api/meta/filters */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">Difficulty</label>
              <select 
                name="difficulty" 
                defaultValue={difficulty || "all"}
                className="w-full bg-base border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-primary focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Program Milestone */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">Program</label>
              <select 
                name="programId" 
                defaultValue={programId || "all"}
                className="w-full bg-base border border-hairline rounded-xl px-3.5 py-2.5 text-sm text-primary focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="all">All Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
            >
              Apply Filters
            </button>

            {/* Tech Tags Cloud — live facets from /api/meta/filters */}
            <div className="space-y-3 pt-4 border-t border-hairline/60">
              <label className="text-xs font-mono uppercase tracking-wider text-muted font-bold block">Popular Stacks</label>
              <div className="flex flex-wrap gap-1.5">
                {technologies.map(t => {
                  const isActive = tech?.toLowerCase() === t.toLowerCase();
                  return (
                    <button 
                      key={t}
                      type="button"
                      data-tech-tag={t}
                      data-active={isActive ? "true" : "false"}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-accent/10 border-accent/40 text-accent font-semibold' 
                          : 'bg-base border-hairline text-secondary hover:border-accent/40'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Results Area */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Results bar header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-surface border border-hairline/80 rounded-2xl px-6 py-4 gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.005)]">
              <span className="text-sm font-mono text-muted uppercase tracking-wider font-semibold">
                {total} Projects Found
              </span>
              
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <span className="text-xs font-mono text-muted uppercase tracking-wide">Sort by</span>
                <select
                  name="sortBy"
                  defaultValue={sortBy}
                  className="bg-base border border-hairline rounded-xl px-3 py-1.5 text-xs text-primary focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest Added</option>
                  <option value="stars">GitHub Stars</option>
                  <option value="title">Alphabetical</option>
                </select>
                <button 
                  type="submit" 
                  className="px-3 py-1.5 bg-base border border-hairline hover:border-accent/45 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Sort
                </button>
              </div>
            </div>

            {/* List/Grid of Cards */}
            {projects.length === 0 ? (
              <EmptyState 
                icon={Search}
                title="No Projects Found"
                description="We couldn't find any projects matching the current filters. Try expanding your search criteria."
                actionLabel="Explore All Projects"
                actionHref="/projects"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj._id?.toString()}
                    project={proj}
                    initialSaved={savedProjects.includes(String(proj._id))}
                    initialTracked={trackedProjects.includes(String(proj._id))}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-hairline/60 gap-4">
                <span className="text-xs text-muted font-mono uppercase tracking-wide">
                  Showing {startOffset} - {endOffset} of {total} Projects
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Previous Page Link */}
                  {page > 1 ? (
                    <Link 
                      href={createPageLink(page - 1)}
                      className="w-9 h-9 rounded-xl border border-hairline bg-surface hover:bg-surface-raised flex items-center justify-center text-secondary transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </Link>
                  ) : (
                    <span className="w-9 h-9 rounded-xl border border-hairline/50 bg-base/50 flex items-center justify-center text-muted/40 cursor-not-allowed">
                      <ChevronLeft size={16} />
                    </span>
                  )}

                  {/* Page Numbers */}
                  {pageNumbers.map(p => (
                    <Link
                      key={p}
                      href={createPageLink(p)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-mono transition-all ${
                        p === page
                          ? 'bg-accent/10 border-accent/40 text-accent font-bold'
                          : 'border-hairline bg-surface hover:bg-surface-raised text-secondary'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}

                  {/* Next Page Link */}
                  {page < totalPages ? (
                    <Link 
                      href={createPageLink(page + 1)}
                      className="w-9 h-9 rounded-xl border border-hairline bg-surface hover:bg-surface-raised flex items-center justify-center text-secondary transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span className="w-9 h-9 rounded-xl border border-hairline/50 bg-base/50 flex items-center justify-center text-muted/40 cursor-not-allowed">
                      <ChevronRight size={16} />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </form>
      
      {/* Client-side script to handle reactive tag clicks preserving input state */}
      <script dangerouslySetInnerHTML={{ __html: `
        if (!window.techTagListenerAdded) {
          window.techTagListenerAdded = true;
          document.addEventListener('click', function(e) {
            const tag = e.target.closest('[data-tech-tag]');
            if (tag) {
              const form = document.getElementById('filters-form');
              if (form) {
                const tech = tag.getAttribute('data-tech-tag');
                const isActive = tag.getAttribute('data-active') === 'true';
                const techInput = form.querySelector('input[name="tech"]');
                if (techInput) {
                  techInput.value = isActive ? 'all' : tech;
                  
                  // Reset page back to 1 when changing stack filters
                  const pageInput = form.querySelector('input[name="page"]');
                  if (pageInput) pageInput.value = '1';
                  
                  form.submit();
                }
              }
            }
          });
        }
      `}} />
    </main>
  );
}
