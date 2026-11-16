import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ProgramLogo } from '@/components/ui/ProgramLogos';
import {
  ArrowRight,
  Calendar,
  BookOpen,
  Compass,
  Users,
} from 'lucide-react';
import { Hero } from '@/components/hero/Hero';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { auth } from '@/auth';
import { getUserItemStatus } from '@/lib/repositories/dashboard';
import { getCachedHomeBundle, getCachedPrograms, getCachedFeaturedOrganizations } from '@/lib/data-cache';
import {
  DeferredHeroStats,
  DeferredProposalStudioSection,
  DeferredTrendingProjects,
  DeferredProgramTimeline,
  DeferredPopularOrgs,
  DeferredFaq,
} from '@/components/home/HomeDeferredSections';
import { ContributorTestimonials } from '@/components/home/ContributorTestimonials';
import { ContributorRoadmapBento } from '@/components/home/ContributorRoadmapBento';
import { AddToCalendarDropdown } from '@/components/programs/AddToCalendarDropdown';
import type { Program } from '../../types';

const PROGRAM_IMAGES: Record<string, string> = {
  gsoc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  outreachy:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  lfx: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  esoc: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80';

export async function generateMetadata(): Promise<Metadata> {
  let projectCount = 0;
  let orgCount = 0;

  try {
    const [{ stats }, featuredOrgs] = await Promise.all([
      getCachedHomeBundle(),
      getCachedFeaturedOrganizations(),
    ]);
    if (stats?.projects) projectCount = stats.projects;
    if (featuredOrgs?.total) orgCount = featuredOrgs.total;
  } catch (err) {
    console.error('Error generating homepage metadata:', err);
  }

  const projectSegment =
    projectCount > 0 ? `${projectCount.toLocaleString()}+ Projects` : 'Curated Projects';
  const orgSegment =
    orgCount > 0 ? `${orgCount.toLocaleString()}+ Organizations` : 'Global Foundations';

  const title = `Contribo · Discover ${projectSegment} across ${orgSegment} & Mentorship Programs`;
  const description = `Aggregating open source mentorship programs including GSoC, Outreachy, LFX Mentorship, and NSoC. Explore curated starter issues, track application deadlines, and craft winning proposals.`;

  return {
    title,
    description,
    keywords: [
      'open source mentorship',
      'Google Summer of Code',
      'GSoC 2026',
      'LFX Mentorship',
      'Outreachy',
      'Nexus Spring of Code',
      'NSoC 2026',
      'open source internship',
      'good first issues',
      'proposal templates',
      'software engineering fellowship',
    ],
    authors: [{ name: 'Contribo Community' }],
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: 'https://contribo.dev',
      siteName: 'Contribo',
      type: 'website',
      images: [
        {
          url: 'https://contribo.dev/contribo_dashboard_mockup.png',
          width: 1200,
          height: 630,
          alt: 'Contribo Open Source Mentorship Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://contribo.dev/contribo_dashboard_mockup.png'],
      creator: '@contribodev',
    },
  };
}

export default async function Home() {
  // Parallel fetch: catalog + session + programs + org showcase (cached)
  const [{ stats, trending }, session, allProgramsRaw, featuredOrgs] = await Promise.all([
    getCachedHomeBundle(),
    auth(),
    getCachedPrograms(),
    getCachedFeaturedOrganizations(),
  ]);

  // One organization total for the whole page. estimatedDocumentCount (what the
  // stats band uses) and a real count can disagree; the directory quote below
  // is exact, so every mention of the number derives from it.
  const orgTotal = featuredOrgs.total;

  let savedProjects: string[] = [];
  let trackedProjects: string[] = [];

  if (session?.user?.id && trending.length > 0) {
    try {
      const status = await getUserItemStatus(session.user.id, {
        projectIds: trending.map((p) => p.id),
      });
      savedProjects = status.savedProjectIds;
      trackedProjects = status.trackedProjectIds;
    } catch (err) {
      console.error('Error fetching user status on home page:', err);
    }
  }

  const allPrograms = (allProgramsRaw || []) as unknown as Program[];
  const targetSlugs = ['gsoc', 'outreachy', 'lfx', 'esoc'];
  const featuredPrograms = (allPrograms || [])
    .filter((p) => p && p.slug && targetSlugs.includes(p.slug))
    .sort((a, b) => targetSlugs.indexOf(a.slug) - targetSlugs.indexOf(b.slug));

  const currentMonthIndex = new Date().getMonth();

  const resourceCards = [
    {
      title: 'How to write proposals',
      desc: 'Learn how to formulate and present winning project proposals for GSoC, Outreachy, LFX, and ESoC.',
      href: '/resources#proposal-writing',
    },
    {
      title: 'Git Guide',
      desc: 'Master the git workflows, branches, commits, forks, and rebase conventions used in open source.',
      href: '/resources#git-guide',
    },
    {
      title: 'GitHub Guide',
      desc: 'Find your way around repositories, issues, discussions, projects, and pull requests.',
      href: '/resources#github-guide',
    },
    {
      title: 'Finding Good First Issues',
      desc: 'Struggling to find where to start? Use our curated paths to discover beginner issues.',
      href: '/resources#finding-first-issues',
    },
    {
      title: 'Resume Tips',
      desc: 'Optimize your resume to highlight open-source contributions and grab reviewer attention.',
      href: '/resources#resume-tips',
    },
    {
      title: 'Interview Tips',
      desc: 'Nail behavioral screening and technical walkthrough interviews for premium fellowships.',
      href: '/resources#interview-tips',
    },
  ];

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://contribo.dev/#website',
    url: 'https://contribo.dev',
    name: 'Contribo',
    description:
      'Universal open-source mentorship program aggregator, proposal studio, and contributor matchmaking platform.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://contribo.dev/projects?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://contribo.dev/#organization',
    name: 'Contribo',
    url: 'https://contribo.dev',
    logo: 'https://contribo.dev/icon.png',
    sameAs: ['https://github.com/subhranshudash13-dotcom/Contribo'],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Contribo free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Contribo is 100% free and open-source. We aim to support contributors globally in finding, preparing for, and tracking mentorship programs.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the AI Matcher work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI Matcher analyzes your technical skills, difficulty preferences, and topics of interest, comparing them with thousands of projects in our database to recommend the most suitable opportunities.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are stipends guaranteed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Stipends are paid directly by the organizing foundations (Google, CNCF, etc.) to accepted contributors who successfully complete their project milestones.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I track multiple programs at once?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Your personal dashboard is unified across all programs. You can save projects, log proposal drafts, and track deadlines for GSoC, ESoC, LFX, and Outreachy simultaneously.',
        },
      },
    ],
  };

  return (
    <main className="flex flex-col min-h-screen w-full bg-noise">
      {/* Structured JSON-LD Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Above-the-fold — critical path */}
      <Hero />

      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 pb-20 pt-16 space-y-28">
        {/* CURATED OPPORTUNITIES */}
        <ScrollReveal animation="fade">
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary font-heading leading-tight">
                Elite Mentorship <br />
                <span className="text-muted">Programs</span>
              </h2>
              <p className="text-secondary text-base leading-relaxed font-normal max-w-lg">
                Universal stipend-based and community-driven mentorship programs tracked live on
                Contribo.
              </p>
            </div>

            <div className="shrink-0 pb-2">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-hairline hover:bg-surface-raised text-primary text-sm font-semibold rounded-xl hover:border-accent/40 transition-all shadow-xs"
              >
                All Programs <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {featuredPrograms.map((prog, index) => {
              const cardImage = PROGRAM_IMAGES[prog.slug] || FALLBACK_IMAGE;
              const timelineLabel =
                prog.slug === 'gsoc'
                  ? 'Closed for 2026'
                  : prog.slug === 'outreachy'
                    ? 'Internship Phase'
                    : prog.slug === 'lfx'
                      ? 'Mentorship Live'
                      : 'Batch projects live';
              return (
                <Link
                  key={prog.slug}
                  href={`/programs/${prog.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-hairline overflow-hidden shadow-sm hover:shadow-2xl hover:border-accent/40 transition-all duration-500 min-h-[460px] p-6 text-white"
                >
                  <Image
                    src={cardImage}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 select-none pointer-events-none z-0"
                    priority={index < 2}
                    loading={index < 2 ? undefined : 'lazy'}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />

                  <div className="relative z-20 flex items-center justify-between">
                    <span
                      className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-sm"
                      style={{ color: prog.accentColor }}
                    >
                      <ProgramLogo slug={prog.slug} color className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-md font-bold shadow-sm">
                      {prog.slug === 'gsoc'
                        ? 'Closed'
                        : prog.slug === 'outreachy'
                          ? 'Upcoming'
                          : 'Live'}
                    </span>
                  </div>

                  <div className="relative z-20 space-y-3.5 mt-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <div>
                      <span className="text-[10px] text-white/80 font-mono uppercase tracking-widest">
                        {prog.organizer}
                      </span>
                      <h3 className="font-heading font-bold text-white text-xl sm:text-2xl mt-1 leading-snug group-hover:text-accent transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {prog.name}
                      </h3>
                    </div>

                    <p className="text-xs text-white/90 line-clamp-3 leading-relaxed font-medium">
                      {prog.eligibilitySummary}
                    </p>

                    <div className="border-t border-white/20 pt-3.5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white font-mono">
                        {prog.stipendRange}
                      </span>
                      <span className="text-xs font-mono text-accent flex items-center gap-1 font-bold">
                        Explore{' '}
                        <ArrowRight
                          size={12}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-white/70">{timelineLabel}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        </ScrollReveal>


        {/* LIVE STATS */}
        <DeferredHeroStats stats={{ ...stats, orgs: orgTotal }} />

        {/* HOW IT WORKS */}
        <ScrollReveal animation="slide-up">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-primary leading-tight">
              How Contribo works
            </h2>
            <p className="text-secondary text-base leading-relaxed">
              We compile and structure open-source programs so you can focus on building excellent
              proposals and getting accepted.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Compass size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-base">AI Matching</h3>
                  <p className="text-secondary text-sm leading-relaxed mt-1">
                    Input your skills and preferences to find matching organizations and project
                    suggestions instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-base">
                    Direct Guidance
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed mt-1">
                    Get access to official guidelines, sample templates, and timelines for each
                    internship.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-base">
                    Track Deadlines
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed mt-1">
                    Save your favorite organizations and track proposal progress directly inside
                    your developer workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative rounded-2xl border border-hairline/80 bg-surface/40 p-2 overflow-hidden backdrop-blur-sm shadow-[0_24px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-hairline/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
              <div className="mx-auto text-[10px] font-mono text-muted select-none">
                contribo.dev/dashboard
              </div>
            </div>

            <div className="relative overflow-hidden aspect-[16/10] w-full rounded-b-xl bg-page">
              <Image
                src="/contribo_dashboard_mockup.png"
                alt="Contribo Contributor Dashboard Workspace"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          </div>
        </section>
        </ScrollReveal>

        {/* PROPOSAL STUDIO — deferred */}
        <DeferredProposalStudioSection />

        {/* TRENDING — code-split + near-viewport mount */}
        <DeferredTrendingProjects
          projects={trending}
          savedProjects={savedProjects}
          trackedProjects={trackedProjects}
          projectTotal={stats?.projects}
        />

        {/* YEAR TIMELINE — deferred */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary">
                Program timelines this year
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <AddToCalendarDropdown variant="global" />
              <Link
                href="/programs"
                className="text-sm text-accent font-mono hover:underline inline-flex items-center gap-1"
              >
                All programs <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <DeferredProgramTimeline initialMonthIndex={currentMonthIndex} />
        </section>

        {/* POPULAR ORGS — deferred */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-primary font-heading">
                Popular mentoring organizations
              </h2>
              <p className="text-secondary text-sm sm:text-[15px] leading-relaxed max-w-xl">
                Global foundations and engineering teams actively sponsoring contributors across open-source programs.
              </p>
            </div>
            <Link
              href="/organizations"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs sm:text-sm font-semibold transition-all shrink-0 self-start sm:self-auto"
            >
              {orgTotal > 0 ? `Browse all ${orgTotal.toLocaleString()}` : 'Browse all'}
              <ArrowRight size={14} />
            </Link>
          </div>
          <DeferredPopularOrgs organizations={featuredOrgs.organizations} total={orgTotal} />
        </section>

        {/* ROADMAP — Bento Grid UI */}
        <ScrollReveal animation="slide-up">
          <ContributorRoadmapBento organizationCount={orgTotal} />
        </ScrollReveal>

        {/* RESOURCES — static */}
        <ScrollReveal animation="pop">
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold flex items-center gap-2">
                <BookOpen size={12} /> Guides
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary mt-2">
                Resources to level up
              </h2>
            </div>
            <Link href="/resources" className="text-sm text-accent font-mono hover:underline">
              All resources
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceCards.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-2xl border border-hairline bg-surface p-5 hover:border-accent/40 transition-colors group"
              >
                <h3 className="font-heading font-semibold text-primary group-hover:text-accent transition-colors">
                  {c.title}
                </h3>
                <p className="text-sm text-secondary mt-2 leading-relaxed">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>
        </ScrollReveal>

        {/* TESTIMONIALS — Moving Marquee */}
        <ScrollReveal animation="fade">
          <ContributorTestimonials />
        </ScrollReveal>

        {/* FAQs — deferred */}
        <ScrollReveal animation="slide-up">
        <section className="space-y-8 max-w-4xl mx-auto py-4">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary">
              Frequently Asked Questions
            </h2>
            <p className="text-secondary text-sm sm:text-base">
              Clear answers to help you navigate open-source programs.
            </p>
          </div>

          <DeferredFaq />
        </section>
        </ScrollReveal>
      </div>
    </main>
  );
}
