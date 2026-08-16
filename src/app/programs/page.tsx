import Link from 'next/link';
import { Program } from '../../../types';
import { ProgramCard } from '@/components/ui/ProgramCard';
import { Sparkles, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { listPrograms } from '@/lib/repositories/programs';
import { ProgramsHeroVisualizer } from '@/components/programs/ProgramsHeroVisualizer';
import { OpenSourceExplainer } from '@/components/programs/OpenSourceExplainer';

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

      <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto w-full mt-12 space-y-12">
        {/* Compact Hero Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-[11px] font-mono font-bold tracking-wide uppercase">
              <Sparkles size={11} />
              Open Source Sprints
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-primary leading-tight">
              Shape the Future of <br className="hidden sm:block" />
              <span className="text-accent">
                Open Source Software
              </span>
            </h1>
            
            <p className="text-secondary text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              Discover paid open-source campaigns, fellowships, and winter sprints. Secure dedicated mentorship from core maintainers and contribute production code.
            </p>

            {/* Compact Metric Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-xs">
              <div className="flex items-center gap-2 bg-surface border border-hairline rounded-lg px-3 py-1.5 shadow-xs">
                <TrendingUp size={13} className="text-accent" />
                <span className="text-muted text-[11px]">Programs:</span>
                <span className="font-bold text-primary">{programs.length} Active</span>
              </div>

              <div className="flex items-center gap-2 bg-surface border border-hairline rounded-lg px-3 py-1.5 shadow-xs">
                <DollarSign size={13} className="text-brass" />
                <span className="text-muted text-[11px]">Stipends:</span>
                <span className="font-bold text-primary">Up to €7,000</span>
              </div>

              <div className="flex items-center gap-2 bg-surface border border-hairline rounded-lg px-3 py-1.5 shadow-xs">
                <Activity size={13} className="text-emerald-500" />
                <span className="text-muted text-[11px]">Vetting:</span>
                <span className="font-bold text-primary">100% Verified</span>
              </div>
            </div>
          </div>

          {/* Right side: Compact Interactive Telemetry Matrix */}
          <div className="lg:col-span-5">
            <ProgramsHeroVisualizer />
          </div>
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

        {/* Explainer Section: What is an Open Source Program? */}
        <OpenSourceExplainer showCta={false} />
      </main>
    </div>
  );
}
