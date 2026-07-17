import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Program } from '../../../../types';
import { EligibilityTag } from '@/components/ui/EligibilityTag';
import { StipendChip } from '@/components/ui/StipendChip';
import {
  Calendar,
  Award,
  BookOpen,
  ArrowUpRight,
  BarChart3,
  ListChecks,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Users,
  Target,
  Lightbulb,
  CheckCircle2,
  Compass,
  Construction,
  Bell,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { ProgramLogo } from '@/components/ui/ProgramLogos';
import { getProgramBySlug } from '@/lib/repositories/programs';
import { getProgramGuide } from '@/lib/program-guides';

/** Programs that get the full org explorer treatment */
const EXPLORER_ENABLED_SLUGS = new Set(['gsoc', 'lfx', 'esoc', 'outreachy', 'sob']);

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const program = (await getProgramBySlug(slug)) as Program | null;

  if (!program) {
    return {
      title: 'Program Not Found | Contribo',
    };
  }

  const guide = getProgramGuide(slug);
  return {
    title: `${program.name} | Contribo`,
    description: guide.tagline || program.eligibilitySummary,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = (await getProgramBySlug(slug)) as Program | null;

  if (!program) {
    notFound();
  }

  const guide = getProgramGuide(program.slug);
  const accent = program.accentColor || '#4285F4';
  const explorerEnabled = EXPLORER_ENABLED_SLUGS.has(program.slug);

  return (
    <main
      className="py-12 px-4 sm:px-6 lg:px-8 w-full max-w-[1320px] mx-auto mt-20"
      style={{ '--program-accent': accent } as React.CSSProperties}
    >
      {/* Banner & Header */}
      <div className="mb-8 lg:mb-10 relative overflow-hidden rounded-[32px] border border-hairline/80 bg-surface p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <div
          className="absolute right-[-100px] top-[-100px] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-20 dark:opacity-10"
          style={{ backgroundColor: 'var(--program-accent)' }}
        />

        <Link
          href="/programs"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-secondary hover:text-primary mb-6 transition-colors font-bold"
        >
          <ArrowLeft size={12} /> Back to Programs
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-base border border-hairline/80 p-3 shadow-md shrink-0">
              <ProgramLogo
                slug={program.slug}
                color={true}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-secondary font-mono uppercase tracking-wider font-bold">
                  Organized by {program.organizer}
                </span>
                {program.difficulty && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold bg-base border border-hairline text-muted">
                    {program.difficulty}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary leading-[1.1] mb-3">
                {program.name}
              </h1>
              <p className="text-secondary text-base sm:text-lg max-w-2xl leading-relaxed">
                {guide.tagline}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <EligibilityTag text="Open Source" />
                {program.eligibilitySummary && (
                  <EligibilityTag
                    text={
                      program.eligibilitySummary.length > 48
                        ? `${program.eligibilitySummary.slice(0, 48)}…`
                        : program.eligibilitySummary
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {program.officialWebsite && (
            <a
              href={program.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-hairline/80 bg-surface hover:bg-surface-raised font-bold text-sm text-primary rounded-2xl transition-all shadow-sm w-fit cursor-pointer"
            >
              Official Website <ExternalLink size={14} className="text-secondary" />
            </a>
          )}
        </div>
      </div>

      {/* Organization Explorer CTA or Coming Soon */}
      {explorerEnabled ? (
        <section className="mb-8 lg:mb-10">
          <div className="rounded-[28px] border border-hairline bg-surface p-8 sm:p-10 text-left relative overflow-hidden transition-all duration-200 hover:border-accent/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div
              className="absolute top-0 left-0 w-full h-[3px]"
              style={{ backgroundColor: accent }}
            />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
                      color: accent,
                    }}
                  >
                    <Building2 size={18} />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-widest text-muted font-bold">
                    Organization Directory
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Explore {program.name} Organizations
                </h2>
                <p className="text-secondary text-sm sm:text-base leading-relaxed">
                  Browse and filter organizations participating in {program.name}. Select years to find active orgs, or use the search to find specific ones.
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/programs/${program.slug}/organizations`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Explore Organizations
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/matcher"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-brass/35 text-brass hover:bg-brass/5 font-bold text-sm transition-colors"
                >
                  <Sparkles size={16} />
                  AI Project Matcher
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-8 lg:mb-10">
          <div className="rounded-[28px] border border-hairline bg-surface p-8 sm:p-10 text-center relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-[3px]"
              style={{ backgroundColor: accent }}
            />
            <Construction size={36} className="mx-auto mb-4 text-muted" />
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
              Organization Explorer — Coming Soon
            </h2>
            <p className="text-secondary text-sm max-w-lg mx-auto mb-5 leading-relaxed">
              We&apos;re building a filterable directory of {program.name} organizations
              with year-wise browsing, search, and AI-powered project matching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/organizations?programId=${program._id?.toString()}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-hairline bg-surface-raised hover:bg-hairline/40 text-primary font-bold text-sm transition-colors"
              >
                Browse all {program.name} orgs
              </Link>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-brass/20 text-brass text-xs font-bold">
                <Bell size={14} />
                Notify me when ready
              </span>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left main content */}
        <div className="lg:col-span-2 space-y-8 lg:space-y-10">
          {/* How it works — primary educational block */}
          <section className="bg-surface border border-hairline/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-[3px]"
              style={{ backgroundColor: 'var(--program-accent)' }}
            />
            <div className="flex items-start gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
                  borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
                  color: accent,
                }}
              >
                <Compass size={20} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary">
                  How {program.name} works
                </h2>
                <p className="text-sm text-muted mt-1">
                  A plain-language guide so you know what to expect before applying.
                </p>
              </div>
            </div>

            <p className="text-secondary text-[15px] sm:text-base leading-relaxed mb-8 max-w-3xl">
              {guide.overview}
            </p>

            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
              <ListChecks size={14} style={{ color: accent }} />
              The path
            </h3>
            <ol className="space-y-3 mb-8">
              {guide.howItWorks.map((step, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 sm:gap-4 items-start rounded-2xl border border-hairline bg-base/40 px-4 py-3.5"
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-secondary text-sm sm:text-[15px] leading-relaxed font-medium">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-hairline bg-base/30 p-5">
                <h3 className="font-bold text-primary text-sm mb-3 flex items-center gap-2">
                  <Users size={16} style={{ color: accent }} />
                  Who it&apos;s for
                </h3>
                <ul className="space-y-2">
                  {guide.whoItsFor.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-secondary leading-relaxed">
                      <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-merge" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-hairline bg-base/30 p-5">
                <h3 className="font-bold text-primary text-sm mb-3 flex items-center gap-2">
                  <Target size={16} style={{ color: accent }} />
                  What you walk away with
                </h3>
                <ul className="space-y-2">
                  {guide.outcomes.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-secondary leading-relaxed">
                      <Sparkles size={14} className="shrink-0 mt-0.5 text-brass" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {guide.tips.length > 0 && (
              <div className="mt-6 rounded-2xl border border-brass/20 bg-brass/5 p-5">
                <h3 className="font-bold text-primary text-sm mb-3 flex items-center gap-2">
                  <Lightbulb size={16} className="text-brass" />
                  Tips from Contribo
                </h3>
                <ul className="space-y-2">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-secondary leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Official eligibility summary */}
          {program.eligibilitySummary && (
            <section className="bg-surface border border-hairline/80 rounded-[28px] p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-primary mb-3">Eligibility (official summary)</h2>
              <p className="text-secondary text-sm sm:text-base leading-relaxed">
                {program.eligibilitySummary}
              </p>
              <p className="text-xs text-muted mt-3 font-mono">
                Always confirm full rules on the official website before applying.
              </p>
            </section>
          )}

          {/* Timeline */}
          <section className="bg-surface border border-hairline/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-[3px]"
              style={{ backgroundColor: 'var(--program-accent)' }}
            />
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
              <Calendar size={20} className="text-accent" /> Program Timeline
            </h2>
            {program.timeline && program.timeline.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-hairline ml-3 sm:ml-4 space-y-8 py-2">
                {program.timeline.map((item, idx) => {
                  const eventDate = new Date(item.date);
                  const isPast = eventDate < new Date();
                  const now = new Date();
                  const nextFuture = program.timeline!.findIndex((t) => new Date(t.date) >= now);
                  const isCurrent = nextFuture === -1 ? idx === program.timeline!.length - 1 : idx === nextFuture;

                  return (
                    <div key={idx} className="relative group">
                      <span
                        className={`absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full border-4 border-surface z-10 flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-accent border-accent/20 ring-4 ring-accent/15'
                            : isPast
                              ? 'bg-accent/40 border-surface'
                              : 'bg-surface-raised border-hairline/60'
                        }`}
                      >
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>

                      <div>
                        <h4
                          className={`font-bold text-base sm:text-lg leading-tight transition-colors ${
                            isCurrent ? 'text-accent' : 'text-primary'
                          }`}
                        >
                          {item.event}
                        </h4>
                        <span className="font-mono text-xs font-bold text-secondary mt-1 block uppercase tracking-wider">
                          {eventDate.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted font-mono text-sm py-4 text-center">
                Timeline not yet verified for this cycle.
              </p>
            )}
          </section>

          {/* Application Steps */}
          {program.applicationSteps && program.applicationSteps.length > 0 && (
            <section className="bg-surface border border-hairline/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-[3px]"
                style={{ backgroundColor: 'var(--program-accent)' }}
              />
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
                <ListChecks size={20} className="text-accent" /> Official application steps
              </h2>
              <ol className="space-y-4">
                {program.applicationSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-xl bg-surface-raised border border-hairline flex items-center justify-center font-mono text-xs font-bold text-accent shrink-0 mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <p className="text-secondary text-[14px] sm:text-base font-semibold leading-relaxed mt-0.5">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Past Statistics */}
          {program.pastStats && program.pastStats.length > 0 && (
            <section className="bg-surface border border-hairline/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-[3px]"
                style={{ backgroundColor: 'var(--program-accent)' }}
              />
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
                <BarChart3 size={20} className="text-accent" /> Past Statistics
              </h2>
              <div className="border border-hairline rounded-2xl overflow-hidden bg-base/10 shadow-inner overflow-x-auto">
                <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse min-w-[480px]">
                  <thead>
                    <tr className="border-b border-hairline bg-surface-raised/40 text-muted uppercase text-[10px] sm:text-xs tracking-wider">
                      <th className="py-4 px-6 font-bold">Year</th>
                      <th className="py-4 px-6 font-bold">Accepted Contributors</th>
                      <th className="py-4 px-6 font-bold">Organizations</th>
                      <th className="py-4 px-6 font-bold">Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {program.pastStats.map((stat, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-hairline/40 last:border-0 hover:bg-surface-raised/20 transition-colors"
                      >
                        <td className="py-4 px-6 text-primary font-bold">{stat.year}</td>
                        <td className="py-4 px-6 text-accent font-bold">
                          {stat.contributors.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-secondary font-semibold">
                          {stat.orgs || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-secondary font-semibold">
                          {stat.projects || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Resources */}
          {program.resources && program.resources.length > 0 && (
            <section className="bg-surface border border-hairline/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full h-[3px]"
                style={{ backgroundColor: 'var(--program-accent)' }}
              />
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
                <BookOpen size={20} className="text-accent" /> Resources & Guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {program.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target={res.url.startsWith('http') ? '_blank' : undefined}
                    rel={res.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-between p-5 bg-surface border border-hairline rounded-2xl hover:bg-surface-raised/40 transition-colors group shadow-sm"
                  >
                    <span className="font-semibold text-sm text-primary group-hover:text-accent transition-colors">
                      {res.title}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-muted group-hover:text-accent transition-colors"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-hairline/80 rounded-[28px] p-6 sm:p-8 shadow-sm lg:sticky lg:top-28 relative overflow-hidden">
            <h3 className="font-bold text-lg font-mono uppercase tracking-wider mb-6 text-primary border-b border-hairline pb-4 flex items-center gap-2">
              <Award size={18} className="text-accent" /> Program Meta
            </h3>
            <ul className="space-y-6">
              <li>
                <div className="text-xs text-muted font-mono uppercase tracking-wider mb-2 font-bold">
                  Stipend Range
                </div>
                <StipendChip amount={program.stipendRange} />
              </li>
              <li>
                <div className="text-xs text-muted font-mono uppercase tracking-wider mb-2 font-bold">
                  Duration
                </div>
                <div className="font-semibold text-[15px] sm:text-base text-primary font-mono bg-base/50 px-3 py-1.5 border border-hairline rounded-xl w-fit">
                  {program.durationWeeks} Weeks
                </div>
              </li>
              <li>
                <div className="text-xs text-muted font-mono uppercase tracking-wider mb-2 font-bold">
                  Program Tier
                </div>
                <div className="font-semibold text-base flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center text-sm font-mono font-bold">
                    {program.tier}
                  </span>
                  <span className="text-xs font-semibold text-secondary">
                    {program.tier === 1
                      ? 'Tier 1 (High Stipend)'
                      : program.tier === 2
                        ? 'Tier 2 (Medium Stipend)'
                        : 'Tier 3 (No Stipend / Recognition)'}
                  </span>
                </div>
              </li>
              {program.difficulty && (
                <li>
                  <div className="text-xs text-muted font-mono uppercase tracking-wider mb-2 font-bold">
                    Difficulty
                  </div>
                  <div className="font-semibold text-[15px] sm:text-base text-primary bg-base/50 px-3 py-1.5 border border-hairline rounded-xl w-fit">
                    {program.difficulty}
                  </div>
                </li>
              )}
            </ul>

            <div className="h-px w-full bg-hairline my-6" />

            <div className="flex flex-col gap-3">
              <Link
                href={`/organizations?programId=${program._id?.toString()}`}
                className="bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-bold transition-all text-center w-full shadow-sm text-sm cursor-pointer"
              >
                View Organizations
              </Link>
              <Link
                href={`/projects?programId=${program._id?.toString()}`}
                className="border border-hairline bg-surface-raised hover:bg-hairline/40 text-primary py-3.5 rounded-xl font-bold transition-colors text-center w-full shadow-sm text-sm"
              >
                Browse Projects
              </Link>
              <Link
                href="/matcher"
                className="border border-brass/30 text-brass hover:bg-brass/10 py-3.5 rounded-xl font-bold transition-colors text-center w-full text-sm inline-flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Find matching projects
              </Link>
            </div>

            <p className="mt-5 text-[11px] text-muted leading-relaxed font-mono">
              Use Save &amp; Track on project cards to manage this program from your dashboard.
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}
