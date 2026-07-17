import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Program, Organization } from '../../../../../types';
import { getProgramBySlug } from '@/lib/repositories/programs';
import { listOrganizations } from '@/lib/repositories/organizations';
import { getOrgYearsForProgram, getOrgTechnologiesForProgram } from '@/lib/repositories/filters';
import { ProgramOrgExplorer } from '@/components/ui/ProgramOrgExplorer';
import { ProgramLogo } from '@/components/ui/ProgramLogos';

type Props = {
  params: Promise<{ slug: string }>;
};

const EXPLORER_ENABLED_SLUGS = new Set(['gsoc', 'lfx', 'esoc', 'outreachy', 'sob']);

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return {};

  return {
    title: `Explore ${program.name} Organizations | Contribo`,
    description: `Browse, filter, and search organizations participating in ${program.name} across different years.`,
  };
}

export default async function ProgramOrgsPage({ params }: Props) {
  const { slug } = await params;

  if (!EXPLORER_ENABLED_SLUGS.has(slug)) {
    notFound();
  }

  const program = (await getProgramBySlug(slug)) as Program | null;
  if (!program || !program._id) {
    notFound();
  }

  const accent = program.accentColor || '#4285F4';
  const programIdStr = String(program._id);

  // Fetch explorer data
  const [orgResult, years, technologies] = await Promise.all([
    listOrganizations({
      programId: programIdStr,
      limit: 48,
      skip: 0,
      lean: true,
    }),
    getOrgYearsForProgram({ programId: programIdStr }),
    getOrgTechnologiesForProgram({ programId: programIdStr }),
  ]);

  const explorerOrgs = orgResult.organizations as unknown as Organization[];
  const explorerTotal = orgResult.total;
  const explorerYears = years;

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-[1320px] mx-auto mt-20">
      {/* Back button & Title Section */}
      <div className="mb-8 border-b border-hairline pb-6">
        <Link
          href={`/programs/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold font-mono uppercase tracking-wider text-muted hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-all mb-4"
        >
          <ArrowLeft size={14} /> Back to {program.name} Info
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface border border-hairline flex items-center justify-center p-2 shadow-sm">
            <ProgramLogo slug={slug} width={32} height={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {program.name} Organizations
            </h1>
            <p className="text-secondary text-sm mt-1">
              Filter by year, tech stack, and search to find active organizations.
            </p>
          </div>
        </div>
      </div>

      <ProgramOrgExplorer
        programId={programIdStr}
        programSlug={program.slug}
        programName={program.name}
        accentColor={accent}
        initialOrgs={explorerOrgs}
        initialTotal={explorerTotal}
        availableYears={explorerYears}
        availableTechnologies={technologies}
      />
    </main>
  );
}
