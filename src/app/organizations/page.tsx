import Link from 'next/link';
import { Organization } from '../../../types';
import { OrgCard } from '@/components/ui/OrgCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrgSearch } from '@/components/ui/OrgSearch';
import { OrgMarquee } from '@/components/ui/OrgMarquee';
import { redirect } from 'next/navigation';
import { FilterX, Building2, ChevronLeft, ChevronRight, Compass, Cpu, X } from 'lucide-react';
import { listOrganizations } from '@/lib/repositories/organizations';
import { auth } from '@/auth';
import { getUserItemStatus } from '@/lib/repositories/dashboard';
import {
  getCachedFilterFacets,
  getCachedPrograms,
  getCachedDefaultOrganizations,
  ORGANIZATIONS_PAGE_SIZE,
} from '@/lib/data-cache';
import { parsePage } from '@/lib/pagination';
import { pageCount, pageRange, pageWindow } from '@/lib/pagination-helpers.mjs';

export const metadata = {
  title: 'Organizations | Contribo',
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getOrganizationsPage(page: number, programId?: string, search?: string, category?: string) {
  const orgPromise =
    !programId && !search && !category
      ? getCachedDefaultOrganizations(page)
      : listOrganizations({
          programId,
          search,
          category,
          limit: ORGANIZATIONS_PAGE_SIZE,
          skip: (page - 1) * ORGANIZATIONS_PAGE_SIZE,
          lean: true,
        });

  const [{ organizations, total }, programs, facets] = await Promise.all([
    orgPromise,
    getCachedPrograms(),
    getCachedFilterFacets(),
  ]);

  return {
    organizations: organizations as unknown as Organization[],
    total,
    programs: programs.map((p) => ({
      id: String(p._id),
      name: p.name as string,
      slug: p.slug as string,
    })),
    categories: facets.orgCategories || [],
  };
}

export default async function OrganizationsDirectory({ searchParams }: Props) {
  const params = await searchParams;
  const programId = typeof params.programId === 'string' ? params.programId : undefined;
  const searchQuery =
  typeof params.q === 'string'
    ? params.q
    : typeof params.search === 'string'
      ? params.search
      : undefined;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const page = parsePage(params.page);

  const [pageData, session] = await Promise.all([
    getOrganizationsPage(page, programId, searchQuery, category),
    auth(),
  ]);

  const { organizations, total, programs, categories } = pageData;

  const buildFilterUrl = (newParams: { programId?: string; q?: string; category?: string; page?: number }) => {
    const p = new URLSearchParams();
    if (newParams.programId && newParams.programId !== 'all') p.set('programId', newParams.programId);
    if (newParams.q) p.set('q', newParams.q);
    if (newParams.category) p.set('category', newParams.category);
    if (newParams.page && newParams.page > 1) p.set('page', String(newParams.page));
    const query = p.toString();
    return query ? `/organizations?${query}` : '/organizations';
  };

  const totalPages = pageCount(total, ORGANIZATIONS_PAGE_SIZE);
  // A page past the end (old link, changed filters) goes to the last real page.
  if (page > totalPages) {
    redirect(buildFilterUrl({ programId, q: searchQuery, category, page: totalPages }));
  }
  const { start, end } = pageRange(page, ORGANIZATIONS_PAGE_SIZE, total);
  const pageLink = (target: number) => buildFilterUrl({ programId, q: searchQuery, category, page: target });

  let savedOrgs: string[] = [];
  if (session?.user?.id && organizations.length > 0) {
    try {
      const status = await getUserItemStatus(session.user.id, {
        organizationIds: organizations.map((o) => String(o._id)).filter(Boolean),
      });
      savedOrgs = status.savedOrganizationIds;
    } catch (err) {
      console.error('Error fetching user status on organizations page:', err);
    }
  }

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20">
      <nav className="flex items-center text-xs font-mono text-muted mb-8 uppercase tracking-widest font-medium">
        <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link href="/programs" className="hover:text-primary transition-colors">Programs</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-primary font-medium">Organizations</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-primary leading-tight">
          Explore Organizations
        </h1>
        <p className="text-secondary text-base sm:text-lg max-w-3xl mt-4 font-normal leading-relaxed">
          Discover open-source organizations actively accepting contributors across GSoC, ESoC, LFX Mentorship, Outreachy, and more.
        </p>
      </div>

      {/* Quick filters toolbar */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <OrgSearch />
        <form method="GET" action="/organizations" className="flex flex-wrap gap-2.5 items-center">
          {searchQuery && <input type="hidden" name="q" value={searchQuery} />}
          
          <select
            name="programId"
            defaultValue={programId || 'all'}
            className="bg-page border border-hairline rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="all">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            name="category"
            defaultValue={category || ''}
            className="bg-page border border-hairline rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer max-w-[210px] truncate"
          >
            <option value="">All Domains / Sectors</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4.5 py-2.5 rounded-xl bg-accent text-white text-xs font-mono uppercase tracking-wider font-bold cursor-pointer hover:bg-accent-hover transition-colors shadow-xs"
          >
            Filter
          </button>
          {(programId || searchQuery || category) && (
            <Link href="/organizations" className="text-xs font-mono text-accent inline-flex items-center gap-1 hover:underline ml-1">
              <FilterX size={12} /> Clear all
            </Link>
          )}
        </form>
      </div>

      {/* Active Filter Chips (Ultra-compact) */}
      {(category || programId || searchQuery) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-muted uppercase tracking-wider font-bold mr-1">Active:</span>
          {category && (
            <Link
              href={buildFilterUrl({ programId, q: searchQuery })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
            >
              <span>Domain: {category}</span>
              <X size={12} />
            </Link>
          )}
          {programId && (
            <Link
              href={buildFilterUrl({ category, q: searchQuery })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
            >
              <span>Program: {programs.find((p) => p.id === programId)?.name || programId}</span>
              <X size={12} />
            </Link>
          )}
          {searchQuery && (
            <Link
              href={buildFilterUrl({ programId, category })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors"
            >
              <span>Search: &ldquo;{searchQuery}&rdquo;</span>
              <X size={12} />
            </Link>
          )}
        </div>
      )}

      {/* Marquee */}
      <OrgMarquee organizations={organizations} />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted font-mono">
          {totalPages > 1
            ? `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()} organizations`
            : `${total.toLocaleString()} organizations`}
        </p>
        <Link href="/projects" className="text-sm text-accent font-mono inline-flex items-center gap-1">
          Browse projects <Cpu size={14} />
        </Link>
      </div>

      {organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations found"
          description="Try clearing filters or searching for a different name."
          actionLabel="Clear filters"
          actionHref="/organizations"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
          {organizations.map((org) => (
            <OrgCard
              key={String(org._id)}
              org={org}
              initialSaved={savedOrgs.includes(String(org._id))}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Organizations pages"
          className="mt-8 pt-6 border-t border-hairline/60 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <span className="text-xs text-muted font-mono uppercase tracking-wide">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <Link
                href={pageLink(page - 1)}
                className="w-9 h-9 rounded-xl border border-hairline bg-surface hover:bg-surface-raised flex items-center justify-center text-secondary transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </Link>
            ) : (
              <span className="w-9 h-9 rounded-xl border border-hairline/50 bg-page/50 flex items-center justify-center text-muted/40 cursor-not-allowed">
                <ChevronLeft size={16} />
              </span>
            )}
            {pageWindow(page, totalPages).map((p) => (
              <Link
                key={p}
                href={pageLink(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-mono transition-all ${
                  p === page
                    ? 'bg-accent/10 border-accent/40 text-accent font-bold'
                    : 'border-hairline bg-surface hover:bg-surface-raised text-secondary'
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages ? (
              <Link
                href={pageLink(page + 1)}
                className="w-9 h-9 rounded-xl border border-hairline bg-surface hover:bg-surface-raised flex items-center justify-center text-secondary transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </Link>
            ) : (
              <span className="w-9 h-9 rounded-xl border border-hairline/50 bg-page/50 flex items-center justify-center text-muted/40 cursor-not-allowed">
                <ChevronRight size={16} />
              </span>
            )}
          </div>
        </nav>
      )}

      <div className="mt-12 rounded-2xl border border-hairline bg-surface p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <Compass className="text-accent shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-heading font-semibold text-primary">Looking for a program first?</h2>
            <p className="text-sm text-secondary mt-1">
              Start with GSoC, European Summer of Code, Outreachy, or LFX — then drill into orgs.
            </p>
          </div>
        </div>
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-hairline text-sm font-semibold hover:border-accent/40"
        >
          <Building2 size={14} /> All programs
        </Link>
      </div>
    </main>
  );
}
