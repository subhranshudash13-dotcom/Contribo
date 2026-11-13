import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  DollarSign,
  UserCheck,
  ArrowRight,
  Compass,
} from 'lucide-react';

export const metadata = {
  title: 'Guidelines Hub | Contribo',
  description: 'Official rules, eligibility, proposal structure, stipends, and code of conduct across open source programs.',
};

const GUIDELINES_CATEGORIES = [
  {
    title: 'Eligibility Rules',
    slug: 'eligibility',
    description: 'General guidelines on who can participate in various open source programs, age restrictions, and student status.',
    icon: UserCheck,
    badge: 'Universal Rules',
  },
  {
    title: 'Proposal Writing',
    slug: 'proposal-writing',
    description: 'Tips and templates for crafting a winning project proposal, section breakdown, and rubric scoring.',
    icon: FileText,
    badge: 'Proposal Strategy',
  },
  {
    title: 'Code of Conduct',
    slug: 'code-of-conduct',
    description: 'Community standards, the 72-hour rule, communication etiquette, and expectations for all contributors.',
    icon: ShieldCheck,
    badge: 'Community Standards',
  },
  {
    title: 'Stipends & Payments',
    slug: 'stipends',
    description: 'How stipends work, Purchasing Power Parity (PPP), tax implications, and typical milestone payout schedules.',
    icon: DollarSign,
    badge: 'Compensation',
  },
];

export default function GuidelinesHub() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="text-center mb-12 sm:mb-16">
        <span className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 mb-3 inline-block">
          Contributor Handbook
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-4">
          Guidelines Hub
        </h1>
        <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about navigating open source mentorship programs, writing proposals, adhering to community standards, and understanding stipend disbursements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {GUIDELINES_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              href={`/guidelines/${category.slug}`}
              key={category.slug}
              className="group flex flex-col justify-between bg-surface border border-hairline hover:border-accent p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-surface-raised text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
                    {category.badge}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                  {category.title}
                </h2>
                <p className="text-sm text-secondary leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:underline">
                <span>Read detailed guide</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Program-specific CTA Banner */}
      <div className="mt-16 bg-surface-raised rounded-2xl p-8 border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-accent font-bold text-sm mb-2">
            <Compass size={18} />
            <span>Need program-specific rules?</span>
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">
            Explore Dedicated Program Handbooks
          </h3>
          <p className="text-sm text-secondary leading-relaxed">
            Every mentorship program has its own specific eligibility and timeline. Be sure to check the individual program pages for official rules.
          </p>
        </div>
        <Link
          href="/programs"
          className="shrink-0 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md shadow-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Browse Programs
        </Link>
      </div>
    </main>
  );
}
