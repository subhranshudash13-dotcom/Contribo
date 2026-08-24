import Link from 'next/link';
import { Program } from '../../../types';
import { ProgramCard } from '@/components/ui/ProgramCard';
import { Sparkles } from 'lucide-react';
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 top-0 left-0 h-[600px] w-full pointer-events-none overflow-hidden z-0 opacity-40">
        <div 
          className="absolute inset-0 w-full h-full opacity-[0.04] text-primary"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 50%, transparent 100%)'
          }}
        />
      </div>

      <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto w-full mt-12 space-y-16">
        
        {/* Premium Hero Header Section */}
        <div className="relative flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto py-12 lg:py-16">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-accent/15 blur-[120px] rounded-full pointer-events-none" />

          {/* Headline */}
          <h1 className="relative z-10 text-[34.75px] sm:text-[46.75px] lg:text-[70.75px] font-semibold tracking-tight text-primary leading-[1.1] font-heading drop-shadow-sm">
            Shape the Future of <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-brass">
              Open Source Software
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="relative z-10 text-secondary text-[14.75px] sm:text-[16.75px] lg:text-[18.75px] max-w-2xl mx-auto leading-relaxed font-medium">
            Discover paid open-source campaigns, fellowships, and winter sprints. Secure dedicated mentorship from core maintainers and contribute production code.
          </p>
        </div>

        {/* Directory Section */}
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-hairline/80 pb-2.5">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted font-bold">
              Active Programs ({programs.length})
            </h2>
            <span className="text-xs font-mono text-accent font-bold">2026 Directory</span>
          </div>

          {/* 3-Column Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}
          </div>
          
          {programs.length === 0 && (
            <div className="text-center py-16 text-muted bg-surface rounded-xl border border-hairline/80 font-mono text-xs">
              No programs found in the database.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
