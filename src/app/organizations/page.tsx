import Link from 'next/link';
import { Organization } from '../../../types';
import { OrgCard } from '@/components/ui/OrgCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrgSearch } from '@/components/ui/OrgSearch';
import { FilterX, Building2, ChevronRight, Compass, Cpu } from 'lucide-react';
import { listOrganizations } from '@/lib/repositories/organizations';
import { auth } from '@/auth';
import { getUserItemStatus } from '@/lib/repositories/dashboard';
import { getCachedFilterFacets, getCachedPrograms } from '@/lib/data-cache';

export const metadata = {
  title: 'Organizations | Contribo',
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getOrganizationsPage(programId?: string, search?: string) {
  const [{ organizations, total }, programs, facets] = await Promise.all([
    listOrganizations({
      programId,
      search,
      limit: 48,
      skip: 0,
      lean: true,
    }),
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
    categories: (facets.orgCategories || []).slice(0, 12),
  };
}

export default async function OrganizationsDirectory({ searchParams }: Props) {
  const params = await searchParams;
  const programId = typeof params.programId === 'string' ? params.programId : undefined;
  const searchQuery = typeof params.q === 'string' ? params.q : undefined;

  const { organizations, total, programs, categories } = await getOrganizationsPage(
    programId,
    searchQuery
  );

  const session = await auth();
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

  const marqueeLogos = [
    { name: "Apache Software", logoUrl: "https://cdn.simpleicons.org/apache" },
    { name: "Linux Foundation", logoUrl: "https://cdn.simpleicons.org/linuxfoundation" },
    { name: "Python PSF", logoUrl: "https://cdn.simpleicons.org/python" },
    { name: "Google Open Source", logoUrl: "https://cdn.simpleicons.org/google" },
    { name: "CNCF Cloud", logoUrl: "https://cdn.simpleicons.org/cncf" },
    { name: "Mozilla Devs", logoUrl: "https://cdn.simpleicons.org/mozilla" },
    { name: "Red Hat Open", logoUrl: "https://cdn.simpleicons.org/redhat" },
    { name: "Kubernetes Ops", logoUrl: "https://cdn.simpleicons.org/kubernetes" }
  ];
  const doubleLogos = [...marqueeLogos, ...marqueeLogos];

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

      {/* Quick filters from meta facets */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <OrgSearch />
        <form method="GET" action="/organizations" className="flex flex-wrap gap-2 items-center">
          {searchQuery && <input type="hidden" name="q" value={searchQuery} />}
          <select
            name="programId"
            defaultValue={programId || 'all'}
            className="bg-base border border-hairline rounded-xl px-3 py-2 text-sm text-primary"
            onChange={(e) => {
              // progressive enhancement: native form submit via button
            }}
          >
            <option value="all">All programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-mono uppercase tracking-wider font-bold"
          >
            Filter
          </button>
          {(programId || searchQuery) && (
            <Link href="/organizations" className="text-xs font-mono text-accent inline-flex items-center gap-1">
              <FilterX size={12} /> Clear
            </Link>
          )}
        </form>
      </div>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg border border-hairline bg-surface text-muted"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Marquee */}
      <div className="mb-10 overflow-hidden border border-hairline rounded-2xl bg-surface/50 py-4">
        <div className="flex gap-10 animate-[marquee_40s_linear_infinite] whitespace-nowrap px-4">
          {doubleLogos.map((logo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${logo.name}-${i}`}
              src={logo.logoUrl}
              alt={logo.name}
              className="h-7 w-auto opacity-60 grayscale"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted font-mono">
          {total.toLocaleString()} organizations
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {organizations.map((org) => (
            <OrgCard
              key={String(org._id)}
              org={org}
              initialSaved={savedOrgs.includes(String(org._id))}
            />
          ))}
        </div>
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
