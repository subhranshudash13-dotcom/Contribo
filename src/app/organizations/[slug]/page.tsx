import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { Organization, Project, Program } from '../../../../types';
import { getOrganizationBySlug, getSimilarOrganizations } from '@/lib/repositories/organizations';
import { getProgramById } from '@/lib/repositories/programs';
import { listProjects } from '@/lib/repositories/projects';
import { getUserItemStatus } from '@/lib/repositories/dashboard';
import { OrgDetailPageClient } from '@/components/organizations/OrgDetailPageClient';

const SLUG_REDIRECTS: Record<string, string> = {
  apache: '/organizations/apache-software-foundation',
  python: '/organizations/python-software-foundation',
  llvm: '/organizations/llvm-compiler-infrastructure',
  'rocket-chat': '/organizations/rocketchat',
  'tor-project': '/organizations/the-tor-project',
  tor: '/organizations/the-tor-project',
  meta: '/organizations/meta-open-source',
  redhat: '/organizations/redhat-mlh',
  google: '/organizations/google-deepmind',
  blender: '/organizations/blender-foundation',
  owasp: '/organizations/owasp-foundation',
  postgres: '/organizations/postgresql',
  jupyter: '/organizations?search=jupyter',
  docker: '/organizations?search=docker',
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const redirectTarget = SLUG_REDIRECTS[slug.toLowerCase()];
  const lookupSlug = redirectTarget?.startsWith('/organizations/')
    ? redirectTarget.replace('/organizations/', '')
    : slug;

  const org = (await getOrganizationBySlug(lookupSlug)) as unknown as Organization | null;

  if (!org) {
    return {
      title: 'Organization Not Found | Contribo',
    };
  }

  const techSnippet = org.technologies?.slice(0, 4).join(', ') || '';
  const desc = org.description
    ? `${org.description.slice(0, 150)}... Technologies: ${techSnippet}`
    : `Explore open-source projects, mentorship tracks, and contribution history for ${org.name} on Contribo.`;

  return {
    title: `${org.name} - Open Source Mentorship & Projects | Contribo`,
    description: desc,
    openGraph: {
      title: `${org.name} - Open Source Projects & Mentorship`,
      description: desc,
      type: 'website',
      images: org.logoUrl ? [{ url: org.logoUrl, alt: `${org.name} logo` }] : undefined,
    },
  };
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { slug } = await params;
  const redirectTarget = SLUG_REDIRECTS[slug.toLowerCase()];
  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const org = (await getOrganizationBySlug(slug, null, { includeProjectCount: true })) as Organization | null;

  if (!org) {
    notFound();
  }

  // Fetch Program, Projects, Similar Organizations, and Session in parallel
  const programPromise = org.programId
    ? getProgramById(String(org.programId))
    : Promise.resolve(null);

  const projectsPromise = listProjects({
    orgSlug: org.slug,
    limit: 200,
    skip: 0,
    lean: true,
  });

  const similarOrgsPromise = getSimilarOrganizations(org, 4);
  const sessionPromise = auth();

  const [rawProgram, projectsResult, similarOrgs, session] = await Promise.all([
    programPromise,
    projectsPromise,
    similarOrgsPromise,
    sessionPromise,
  ]);

  const program = rawProgram as unknown as Program | null;
  const projects = (projectsResult.projects || []) as unknown as Project[];

  // User save status
  let isSaved = false;
  if (session?.user?.id && org._id) {
    try {
      const status = await getUserItemStatus(session.user.id, {
        organizationIds: [String(org._id)],
      });
      isSaved = status.savedOrganizationIds.includes(String(org._id));
    } catch {
      // Non-fatal user status check
    }
  }

  // Structured JSON-LD schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.websiteUrl || undefined,
    logo: org.logoUrl || undefined,
    description: org.description,
    knowsAbout: org.technologies || [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs font-mono text-muted mb-8 uppercase tracking-widest font-medium overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-primary transition-colors">
            Platform
          </Link>
          <ChevronRight size={14} className="mx-2 shrink-0" />
          <Link href="/organizations" className="hover:text-primary transition-colors">
            Organizations
          </Link>
          <ChevronRight size={14} className="mx-2 shrink-0" />
          <span className="text-primary font-bold truncate max-w-[200px] sm:max-w-none">
            {org.name}
          </span>
        </nav>

        {/* Client Interactive Detail View */}
        <OrgDetailPageClient
          org={org}
          program={program}
          projects={projects}
          similarOrgs={similarOrgs}
          initialSaved={isSaved}
        />
      </main>
    </>
  );
}
