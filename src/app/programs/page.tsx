import Link from 'next/link';
import { Program } from '../../../types';
import { ProgramCard } from '@/components/ui/ProgramCard';
import { Sparkles, Users, Award, HelpCircle } from 'lucide-react';
import { listPrograms } from '@/lib/repositories/programs';

export const metadata = {
  title: 'Programs | Contribo',
};

async function getPrograms(): Promise<Program[]> {
  const programs = await listPrograms();
  return programs as unknown as Program[];
}

export default async function ProgramsDirectory() {
  const programs = await getPrograms();

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-primary leading-tight">
          Open Source Programs
        </h1>
        <p className="text-secondary text-base sm:text-lg max-w-3xl mt-4 font-normal leading-relaxed">
          Discover paid open-source programs, fellowships, and internships. Secure full-time mentorship and contribute directly to production-grade codebases.
        </p>
      </div>

      {/* Explainer Section: What is an Open Source Program? */}
      <div className="bg-surface border border-hairline/80 rounded-[32px] p-8 sm:p-10 mb-16 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-[32px] pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <HelpCircle size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-primary">What is an Open Source Program?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="space-y-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Award size={16} />
            </div>
            <h3 className="font-heading font-bold text-base text-primary">Vetted Stipends</h3>
            <p className="text-secondary text-sm font-normal leading-relaxed">
              These campaigns are fully backed by industry leaders (like Google, DigitalOcean, and CNCF) who pay financial stipends ranging from $1,500 to $6,000 for structured contributions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="space-y-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Users size={16} />
            </div>
            <h3 className="font-heading font-bold text-base text-primary">Direct Mentorship</h3>
            <p className="text-secondary text-sm font-normal leading-relaxed">
              Instead of coding alone, you are matched with core maintainers of global codebases who review your pull requests, host check-in meetings, and guide your engineering roadmap.
            </p>
          </div>

          {/* Card 3 */}
          <div className="space-y-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Sparkles size={16} />
            </div>
            <h3 className="font-heading font-bold text-base text-primary">Professional Path</h3>
            <p className="text-secondary text-sm font-normal leading-relaxed">
              Contributing to recognized foundations establishes your Git commit log on world-class projects, validating your skills to top-tier technical recruiters worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="mb-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted font-bold border-b border-hairline/80 pb-2.5">
          Active Programs ({programs.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {programs.map((program) => (
          <ProgramCard key={program.slug} program={program} />
        ))}
      </div>
      
      {programs.length === 0 && (
        <div className="text-center py-20 text-muted bg-surface-raised rounded-[24px] border border-hairline/80 font-mono text-sm">
          No programs found.
        </div>
      )}
    </main>
  );
}
