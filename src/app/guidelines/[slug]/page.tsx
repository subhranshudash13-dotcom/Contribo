import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Award,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const revalidate = 3600;

export interface GuidelineTopic {
  slug: string;
  title: string;
  shortDescription: string;
  lastUpdated: string;
  badge: string;
  sections: Array<{
    heading: string;
    content: string;
    keyPoints?: string[];
    callout?: {
      type: 'tip' | 'warning' | 'info';
      title: string;
      text: string;
    };
  }>;
  relatedPrograms?: Array<{
    name: string;
    slug: string;
    note: string;
  }>;
}

export const GUIDELINES_DATA: Record<string, GuidelineTopic> = {
  eligibility: {
    slug: 'eligibility',
    title: 'Eligibility Rules for Open Source Mentorships',
    shortDescription: 'Comprehensive criteria, student/non-student policies, age limits, and legal requirements across major mentorship programs.',
    lastUpdated: 'November 2026',
    badge: 'Universal Requirements',
    sections: [
      {
        heading: '1. Age & Legal Identification',
        content: 'Virtually all major open source mentorship programs require participants to be at least 18 years old at the time of application registration. Some exceptions apply (e.g. Google Summer of Code previously admitted 18+, while certain high school initiatives accept 13-17 with parental consent). You must possess valid government-issued photo ID (Passport, National ID card, or Driver License) for identity verification and tax documentation.',
        keyPoints: [
          'Must be 18+ years of age by program start date.',
          'Must be legally eligible to receive payments in your country of residence.',
          'Must pass OFAC compliance checks (residents of sanctioned territories are restricted).',
        ],
      },
      {
        heading: '2. Student vs. Non-Student Eligibility',
        content: 'While historical programs like GSoC were originally restricted to actively enrolled university students, modern open source initiatives now embrace career-switchers, self-taught developers, and non-traditional learners.',
        keyPoints: [
          'Google Summer of Code (GSoC): Open to anyone 18+ who is new or beginner to open source software development (not limited to students).',
          'LFX Mentorship (Linux Foundation): Open to all developers worldwide regardless of academic enrollment.',
          'Outreachy: Explicitly open to anyone who faces systemic bias or underrepresentation in tech; both students and non-students can apply.',
          'Nexus Spring of Code (NSoC): Open to students, fresh graduates, and active open source contributors.',
        ],
        callout: {
          type: 'info',
          title: 'Full-Time Employment Restrictions',
          text: 'If you are employed full-time, ensure your employer permits outside intellectual property and freelance mentorship work. LFX and GSoC expect 30-40 hours/week for large projects or 15-20 hours/week for medium projects.',
        },
      },
      {
        heading: '3. Technical Skill Baselines & Prior Contributions',
        content: 'Most programs do not require you to be a senior engineer, but they do require proof of basic git proficiency, code literacy in the target stack, and community engagement. Making at least 1-2 small pull requests to the target organization before proposal deadline dramatically increases your selection chances.',
        keyPoints: [
          'Familiarity with Git, GitHub/GitLab pull request workflows.',
          'Demonstrated communication skills on project issue trackers or community channels.',
          'Prior micro-contributions (bug fixes, documentation, tests) are heavily weighted by mentors.',
        ],
      },
    ],
    relatedPrograms: [
      { name: 'Google Summer of Code', slug: 'gsoc', note: 'Beginner & intermediate OSS contributors 18+' },
      { name: 'LFX Mentorship', slug: 'lfx', note: 'Systems, cloud native, kernel contributors' },
      { name: 'Outreachy', slug: 'outreachy', note: 'Underrepresented groups in technology' },
      { name: 'Nexus Spring of Code', slug: 'nsoc', note: 'Modern web, tools, and developer platforms' },
    ],
  },

  'proposal-writing': {
    slug: 'proposal-writing',
    title: 'Proposal Writing Guidelines & Scoring Rubric',
    shortDescription: 'Master the 8 essential proposal sections, milestone breakdown strategies, and maintainer evaluation rubrics.',
    lastUpdated: 'November 2026',
    badge: 'Application Strategy',
    sections: [
      {
        heading: '1. The 8 Pillars of an Accepted Proposal',
        content: 'Winning mentorship proposals are technical implementation roadmaps, not motivational essays. Maintainers look for concrete architectural thinking, modular week-by-week timelines, and realistic risk mitigation buffers.',
        keyPoints: [
          'Abstract & Problem Statement: What problem does this solve and why does it matter?',
          'Technical Architecture: Specific libraries, data schemas, API routes, and components to be modified or built.',
          'Weekly Milestones: Concrete deliverables with midterm and final evaluation targets.',
          'Testing Strategy: Unit, integration, and E2E test plan (aim for 85%+ coverage).',
          'Risk & Contingency Plan: What happens if an API changes or an integration is delayed?',
          'Prior Contributions: Links to merged PRs, issues opened, or discussion participation in the org.',
        ],
      },
      {
        heading: '2. Avoiding Common Proposal Rejections',
        content: 'Over 65% of rejected proposals fail due to preventable reasons: overly vague timelines ("Week 1-4: Write code"), zero preliminary community engagement, or proposing out-of-scope architectural rewrites.',
        keyPoints: [
          'Do not invent features that the organization has not requested or validated.',
          'Never submit a proposal without getting early feedback from maintainers 2+ weeks before deadline.',
          'Avoid AI-generated buzzword summaries lacking specific file paths and function names.',
        ],
        callout: {
          type: 'tip',
          title: 'Use Proposal Studio',
          text: 'Contribo includes an interactive Proposal Studio with real-time word counting, maintainer rubric checks, and AI refinement. Draft your proposal directly at /proposal-studio.',
        },
      },
    ],
    relatedPrograms: [
      { name: 'GSoC Proposal Guidelines', slug: 'gsoc', note: 'Standard 175-350 hour project formats' },
      { name: 'Summer of Bitcoin', slug: 'sob', note: 'In-depth cryptographic design focus' },
      { name: 'ESoC (European Summer of Code)', slug: 'esoc', note: 'Open digital sovereignty project requirements' },
    ],
  },

  'code-of-conduct': {
    slug: 'code-of-conduct',
    title: 'Contributor Code of Conduct & Communication Etiquette',
    shortDescription: 'Professional community standards, respecting maintainer time, asynchronous collaboration, and dispute resolution.',
    lastUpdated: 'November 2026',
    badge: 'Community Standards',
    sections: [
      {
        heading: '1. Professional Communication & The 72-Hour Rule',
        content: 'Open source maintainers are frequently volunteers or balancing heavy workloads across multiple timezones. Maintainers appreciate respectful, clear, and actionable messages over vague greetings.',
        keyPoints: [
          'Avoid "Hello" or "Can I contribute?" without context. Always state the specific issue, proposed technical approach, and how you will test it.',
          'Honor the 72-Hour Rule: Allow at least 48 to 72 hours for a maintainer to review your PR or reply before sending a polite follow-up.',
          'Never mention maintainers repeatedly across multiple social channels (Twitter, Discord DMs, LinkedIn) regarding an open PR.',
        ],
      },
      {
        heading: '2. Code Review Etiquette',
        content: 'Code review is an opportunity for technical growth, not a personal critique. Approaching feedback with curiosity and gratitude builds long-term maintainer trust.',
        keyPoints: [
          'Acknowledge each review comment explicitly before requesting re-review.',
          'If you disagree with an architectural suggestion, explain the technical tradeoffs calmly with benchmarks or documentation.',
          'Keep PRs focused and single-purpose; do not sneak in unrelated cosmetic refactors.',
        ],
        callout: {
          type: 'warning',
          title: 'Zero Tolerance for Harassment',
          text: 'Contribo and all affiliated mentorship organizations adhere strictly to the Contributor Covenant. Discriminatory remarks, personal attacks, and trolling will result in immediate disqualification and platform banning.',
        },
      },
    ],
  },

  stipends: {
    slug: 'stipends',
    title: 'Stipends, PPP Adjustments & Payment Schedules',
    shortDescription: 'Understand standard stipend tiers, Purchasing Power Parity (PPP) calculations, tax forms, and disbursement timelines.',
    lastUpdated: 'November 2026',
    badge: 'Financial & Compensation',
    sections: [
      {
        heading: '1. Program Stipend Structures',
        content: 'Stipends vary significantly based on project scope (Medium ~175 hours vs Large ~350 hours) and the organizing foundation.',
        keyPoints: [
          'Google Summer of Code (GSoC): $1,500 – $6,600 USD adjusted by country according to Purchasing Power Parity (PPP).',
          'LFX Mentorship: Flat stipend ranging from $3,000 to $6,600 USD based on location and project scope.',
          'Outreachy: $7,000 USD stipend + $500 USD travel/conference stipend for all accepted interns.',
          'Summer of Bitcoin: Performance stipend disbursed in Bitcoin (BTC) or USD equivalent.',
          'Nexus Spring of Code (NSoC): Performance-based prize stipends and contributor bounties.',
        ],
      },
      {
        heading: '2. Payment Milestones & Evaluations',
        content: 'Stipends are typically released in two installments tied directly to formal mentor evaluation milestones:',
        keyPoints: [
          'Midterm Evaluation (45%–50%): Disbursed upon passing midterm milestone deliverables and mentor code review approval.',
          'Final Evaluation (50%–55%): Disbursed upon successful project completion, comprehensive documentation, and test suite merge.',
        ],
        callout: {
          type: 'info',
          title: 'Tax Forms & Payout Methods',
          text: 'Non-US contributors must submit IRS Form W-8BEN to prevent 30% US withholding tax. Payouts are commonly processed via Payoneer, Wise, direct international SWIFT wire, or direct cryptocurrency wallet.',
        },
      },
    ],
    relatedPrograms: [
      { name: 'GSoC Stipend Table', slug: 'gsoc', note: 'PPP country calculation matrix' },
      { name: 'Outreachy Stipends', slug: 'outreachy', note: '$7,000 USD flat grant details' },
      { name: 'LFX Mentorship Terms', slug: 'lfx', note: 'Standard Linux Foundation stipend disbursement' },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(GUIDELINES_DATA).map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDELINES_DATA[slug];

  if (!guide) {
    return { title: 'Guideline Not Found | Contribo' };
  }

  return {
    title: `${guide.title} | Contribo Guidelines`,
    description: guide.shortDescription,
  };
}

export default async function GuidelineDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDELINES_DATA[slug];

  if (!guide) {
    notFound();
  }

  const otherGuides = Object.values(GUIDELINES_DATA).filter((g) => g.slug !== slug);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Top Breadcrumb Navigation */}
      <div className="mb-8">
        <Link
          href="/guidelines"
          className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1 px-1.5"
        >
          <ArrowLeft size={16} />
          <span>Back to Guidelines Hub</span>
        </Link>
      </div>

      {/* Header Banner */}
      <header className="border-b border-hairline pb-8 mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
            {guide.badge}
          </span>
          <span className="text-xs text-tertiary">
            Last updated: {guide.lastUpdated}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-4">
          {guide.title}
        </h1>
        <p className="text-lg text-secondary max-w-3xl leading-relaxed">
          {guide.shortDescription}
        </p>
      </header>

      {/* Core Guide Content Sections */}
      <div className="space-y-10">
        {guide.sections.map((section, idx) => (
          <section
            key={idx}
            className="bg-surface border border-hairline rounded-2xl p-6 sm:p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-primary mb-4">
              {section.heading}
            </h2>
            <p className="text-base text-secondary leading-relaxed mb-6">
              {section.content}
            </p>

            {section.keyPoints && section.keyPoints.length > 0 && (
              <ul className="space-y-3 mb-6 bg-surface-raised p-4 sm:p-5 rounded-xl border border-hairline/80">
                {section.keyPoints.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-sm text-secondary">
                    <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.callout && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  section.callout.type === 'tip'
                    ? 'bg-success/5 border-success/20 text-success'
                    : section.callout.type === 'warning'
                    ? 'bg-error/5 border-error/20 text-error'
                    : 'bg-accent/5 border-accent/20 text-accent'
                }`}
              >
                {section.callout.type === 'tip' ? (
                  <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                ) : section.callout.type === 'warning' ? (
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle size={20} className="shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm mb-1">{section.callout.title}</h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    {section.callout.text}
                  </p>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Related Programs Section */}
      {guide.relatedPrograms && guide.relatedPrograms.length > 0 && (
        <section className="mt-12 bg-surface-raised border border-hairline rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Award size={20} className="text-accent" />
            <span>Programs with Specific {guide.title.split(' ')[0]} Rules</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.relatedPrograms.map((prog) => (
              <Link
                key={prog.slug}
                href={`/programs/${prog.slug}`}
                className="group p-4 rounded-xl bg-surface border border-hairline hover:border-accent transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-primary group-hover:text-accent transition-colors">
                    {prog.name}
                  </h4>
                  <p className="text-xs text-tertiary mt-0.5">{prog.note}</p>
                </div>
                <ArrowRight size={16} className="text-tertiary group-hover:text-accent transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Links to Other Guidelines */}
      <section className="mt-16 border-t border-hairline pt-10">
        <h3 className="text-lg font-bold text-primary mb-6">
          Explore Other Mentorship Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherGuides.map((other) => (
            <Link
              key={other.slug}
              href={`/guidelines/${other.slug}`}
              className="group p-5 rounded-xl bg-surface border border-hairline hover:border-tertiary hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent mb-2 block">
                  {other.badge}
                </span>
                <h4 className="font-bold text-primary group-hover:text-accent transition-colors text-base mb-2">
                  {other.title}
                </h4>
                <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                  {other.shortDescription}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent group-hover:underline">
                <span>Read guide</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
