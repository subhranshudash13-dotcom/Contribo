import Link from 'next/link';
import { PopularOrgsGrid } from '@/components/ui/PopularOrgsGrid';
import { ProgramLogo } from '@/components/ui/ProgramLogos';
import { ArrowRight, Sparkles, Building2, Code2, Calendar, BookOpen, Compass, Award, GitFork, TrendingUp, Users, GitPullRequest, UserCheck } from 'lucide-react';
import { Hero } from '@/components/hero/Hero';
import { HeroStats } from '@/components/hero/HeroStats';
import { TrendingProjects } from '@/components/home/TrendingProjects';
import { auth } from '@/auth';
import { getUserItemStatus } from '@/lib/repositories/dashboard';
import { ProgramTimelineChart } from '@/components/home/ProgramTimelineChart';
import { getCachedHomeBundle } from '@/lib/data-cache';
import { listPrograms } from '@/lib/repositories/programs';
import { ProgramCard } from '@/components/ui/ProgramCard';
import { FaqAccordion } from '@/components/home/FaqAccordion';
import type { Program } from '../../types';

export default async function Home() {
  // Cached catalog data (stats + trending) — avoids heavy DB work on every request
  const { stats, trending } = await getCachedHomeBundle();

  const session = await auth();
  let savedProjects: string[] = [];
  let trackedProjects: string[] = [];

  // Only resolve status for visible project ids (not entire saved/applications collections)
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

  const allPrograms = (await listPrograms()) as unknown as Program[];
  const targetSlugs = ['gsoc', 'outreachy', 'lfx', 'esoc'];
  const featuredPrograms = allPrograms
    .filter((p) => targetSlugs.includes(p.slug))
    .sort((a, b) => targetSlugs.indexOf(a.slug) - targetSlugs.indexOf(b.slug));

  const roadmaps = [
    { step: "1", title: "I am a Beginner", desc: "Learn code basics and find interests.", stage: "Foundation", color: "border-slate", icon: Compass },
    { step: "2", title: "Learn Git", desc: "Learn commits, branches, and merges.", stage: "Foundation", color: "border-slate", icon: GitFork },
    { step: "3", title: "First PR", desc: "Contribute documentation or simple typos.", stage: "Contribution", color: "border-brass", icon: GitPullRequest },
    { step: "4", title: "Hacktoberfest", desc: "Join your first global open-source event.", stage: "Contribution", color: "border-brass", icon: Sparkles },
    { step: "5", title: "GSoC / ESoC", desc: "Engage in full-time summer mentorship.", stage: "Impact", color: "border-merge", icon: Calendar },
    { step: "6", title: "Become Maintainer", desc: "Take ownership of projects and mentor others.", stage: "Impact", color: "border-merge", icon: UserCheck }
  ];

  const currentMonthIndex = new Date().getMonth();

  const resourceCards = [
    { title: "How to write proposals", desc: "Learn how to formulate and present winning project proposals for GSoC, Outreachy, LFX, and ESoC.", href: "/resources#proposal-writing" },
    { title: "Git Guide", desc: "Master the git workflows, branches, commits, forks, and rebase conventions used in open source.", href: "/resources#git-guide" },
    { title: "GitHub Guide", desc: "Find your way around repositories, issues, discussions, projects, and pull requests.", href: "/resources#github-guide" },
    { title: "Finding Good First Issues", desc: "Struggling to find where to start? Use our curated paths to discover beginner issues.", href: "/resources#finding-first-issues" },
    { title: "Resume Tips", desc: "Optimize your resume to highlight open-source contributions and grab reviewer attention.", href: "/resources#resume-tips" },
    { title: "Interview Tips", desc: "Nail behavioral screening and technical walkthrough interviews for premium fellowships.", href: "/resources#interview-tips" }
  ];

  return (
    <main className="flex flex-col min-h-screen w-full bg-noise">
      <Hero />

      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 pb-20 pt-16 space-y-28">
        
        {/* CURATED OPPORTUNITIES SECTION */}
        <section className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold bg-accent/10 px-3 py-1.5 rounded-full border border-accent/25 inline-flex items-center shadow-sm">
                <Sparkles size={12} className="mr-1.5" /> Curated Opportunities
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary font-heading leading-tight">
                Elite Mentorship <br/><span className="text-muted">Programs</span>
              </h2>
              <p className="text-secondary text-base leading-relaxed font-normal max-w-lg">
                Universal stipend-based and community-driven mentorship programs tracked live on Contribo.
              </p>
            </div>
            
            <div className="shrink-0 pb-2">
              <Link 
                href="/programs" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-base font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                All Programs <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {featuredPrograms.map((prog) => {
              const programImages: Record<string, string> = {
                gsoc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
                outreachy: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
                lfx: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
                esoc: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
              };
              const cardImage = programImages[prog.slug] || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80';
              const timelineLabel = prog.slug === 'gsoc' ? 'Closed for 2026' : prog.slug === 'outreachy' ? 'Internship Phase' : prog.slug === 'lfx' ? 'Mentorship Live' : 'Batch projects live';
              return (
                <Link
                  key={prog.slug}
                  href={`/programs/${prog.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-hairline overflow-hidden shadow-sm hover:shadow-2xl hover:border-accent/40 transition-all duration-500 min-h-[460px] p-6 text-white"
                >
                  {/* Background Image covering full box */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none pointer-events-none z-0"
                    loading="lazy"
                  />
                  
                  {/* Soft bottom-up gradient overlay for text readability only, leaving upper image 100% visible and bright */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />

                  {/* Top content row */}
                  <div className="relative z-20 flex items-center justify-between">
                    <span
                      className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-sm"
                      style={{ color: prog.accentColor }}
                    >
                      <ProgramLogo slug={prog.slug} color className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-md font-bold shadow-sm">
                      {prog.slug === 'gsoc' ? 'Closed' : prog.slug === 'outreachy' ? 'Upcoming' : 'Live'}
                    </span>
                  </div>

                  {/* Bottom content block */}
                  <div className="relative z-20 space-y-3.5 mt-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <div>
                      <span className="text-[10px] text-white/80 font-mono uppercase tracking-widest">{prog.organizer}</span>
                      <h3 className="font-heading font-bold text-white text-xl sm:text-2xl mt-1 leading-snug group-hover:text-accent transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {prog.name}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-white/90 line-clamp-3 leading-relaxed font-medium">
                      {prog.eligibilitySummary}
                    </p>

                    <div className="border-t border-white/20 pt-3.5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white font-mono">{prog.stipendRange}</span>
                      <span className="text-xs font-mono text-accent flex items-center gap-1 font-bold">
                        Explore <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-white/70">{timelineLabel}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* LIVE STATS */}
        <section>
          <HeroStats stats={stats} />
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6">
          <div className="lg:col-span-5 space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold bg-accent/10 px-3 py-1.5 rounded-full border border-accent/25 inline-flex items-center shadow-sm">
              <Compass size={12} className="mr-1.5" /> Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-primary leading-tight">
              How Contribo works
            </h2>
            <p className="text-secondary text-base leading-relaxed">
              We compile and structure open-source programs so you can focus on building excellent proposals and getting accepted.
            </p>
            
            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-base">AI Matching</h3>
                  <p className="text-secondary text-sm leading-relaxed mt-1">
                    Input your skills and preferences to find matching organizations and project suggestions instantly.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-base">Direct Guidance</h3>
                  <p className="text-secondary text-sm leading-relaxed mt-1">
                    Get access to official guidelines, sample templates, and timelines for each internship.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-1">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-primary text-base">Track Deadlines</h3>
                  <p className="text-secondary text-sm leading-relaxed mt-1">
                    Save your favorite organizations and track proposal progress directly inside your developer workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 relative rounded-2xl border border-hairline/80 bg-surface/40 p-2 overflow-hidden backdrop-blur-sm shadow-[0_24px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.2)]">
            {/* Top window chrome */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-hairline/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
              <div className="mx-auto text-[10px] font-mono text-muted select-none">contribo.dev/dashboard</div>
            </div>
            
            {/* Screenshot image */}
            <div className="relative overflow-hidden aspect-[16/10] w-full rounded-b-xl bg-base">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/contribo_dashboard_mockup.png"
                alt="Contribo Contributor Dashboard Workspace"
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* TRENDING — wired to /api/trending via server cache (getTrendingProjects) */}
        <TrendingProjects
          projects={trending}
          savedProjects={savedProjects}
          trackedProjects={trackedProjects}
        />

        {/* YEAR TIMELINE */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold">Calendar</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary mt-2">
                Program timelines this year
              </h2>
            </div>
            <Link href="/programs" className="text-sm text-accent font-mono hover:underline inline-flex items-center gap-1">
              All programs <ArrowRight size={14} />
            </Link>
          </div>
          <ProgramTimelineChart initialMonthIndex={currentMonthIndex} />
        </section>

        {/* POPULAR ORGS */}
        <section className="space-y-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold flex items-center gap-2">
                <Building2 size={12} /> Organizations
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary mt-2">
                Popular mentoring orgs
              </h2>
            </div>
            <Link href="/organizations" className="text-sm text-accent font-mono hover:underline inline-flex items-center gap-1">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>
          <PopularOrgsGrid />
        </section>

        {/* ROADMAP */}
        <section className="space-y-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold flex items-center gap-2">
              <Compass size={12} /> Path
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary mt-2">
              Contributor roadmap
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmaps.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.step}
                  className={`rounded-2xl border border-hairline bg-surface p-5 border-l-4 ${r.color}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs text-muted">0{r.step}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className="text-accent" />
                        <h3 className="font-heading font-semibold text-primary">{r.title}</h3>
                      </div>
                      <p className="text-sm text-secondary">{r.desc}</p>
                      <span className="inline-block mt-2 text-[10px] font-mono uppercase tracking-wider text-muted">
                        {r.stage}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RESOURCES */}
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

        {/* TESTIMONIALS SECTION */}
        <section className="space-y-8 py-4">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold bg-accent/10 px-3 py-1.5 rounded-full border border-accent/25 inline-flex items-center shadow-sm">
              Success Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary">
              Accepted Contributors
            </h2>
            <p className="text-secondary text-sm sm:text-base leading-relaxed">
              Read how developers used Contribo to land their dream open-source internships.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-hairline rounded-2xl p-6 space-y-4 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between">
              <p className="text-secondary text-sm leading-relaxed italic">
                "Finding GSoC projects used to be overwhelming. Contribo's AI Matcher instantly pointed me to organizations that matched my exact skill set. I got accepted on my first try!"
              </p>
              <div className="flex items-center gap-3 border-t border-hairline/60 pt-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                  AM
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm text-primary">Aarav Mehta</h4>
                  <p className="text-[10px] text-muted font-mono">GSoC '25 @ CNCF</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-hairline rounded-2xl p-6 space-y-4 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between">
              <p className="text-secondary text-sm leading-relaxed italic">
                "The timeline visualization helped me balance my university exams with the Outreachy application phase. The guide on writing proposal drafts was a lifesaver."
              </p>
              <div className="flex items-center gap-3 border-t border-hairline/60 pt-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                  ED
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm text-primary">Elena Dimitrova</h4>
                  <p className="text-[10px] text-muted font-mono">Outreachy '25 @ Gnome</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-hairline rounded-2xl p-6 space-y-4 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between">
              <p className="text-secondary text-sm leading-relaxed italic">
                "Tracking multiple proposals on different program websites was a headache. With Contribo's unified dashboard, I had all my tasks and deadlines synced in one place."
              </p>
              <div className="flex items-center gap-3 border-t border-hairline/60 pt-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                  KL
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm text-primary">Kenji Lin</h4>
                  <p className="text-[10px] text-muted font-mono">LFX '26 @ Linux Foundation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs SECTION */}
        <section className="space-y-8 max-w-4xl mx-auto py-4">
          <div className="text-center space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold bg-accent/10 px-3 py-1.5 rounded-full border border-accent/25 inline-flex items-center shadow-sm">
              Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-primary">
              Frequently Asked Questions
            </h2>
            <p className="text-secondary text-sm sm:text-base">
              Clear answers to help you navigate open-source programs.
            </p>
          </div>
          
          <FaqAccordion />
        </section>
      </div>
    </main>
  );
}
