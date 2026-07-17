import Link from 'next/link';
import { Program } from '../../../types';
import { ProgramCard } from '@/components/ui/ProgramCard';
import { Sparkles, Users, Award, HelpCircle, ArrowRight, Activity, TrendingUp, DollarSign } from 'lucide-react';
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
      {/* Decorative grid background with radial mask */}
      <div className="absolute inset-0 top-0 left-0 h-[800px] w-full pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.03] text-primary"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 50%, transparent 100%)'
          }}
        />
        {/* Radial highlight in Contribo accent color */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[120px] opacity-[0.12] dark:opacity-[0.06] bg-accent pointer-events-none" />
      </div>

      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20">
        {/* Hero Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles size={12} className="animate-pulse" />
              Open Source Sprints
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary leading-[1.08] mb-3">
              Shape the Future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-brass">
                Open Source Software
              </span>
            </h1>
            <p className="text-secondary text-base sm:text-lg max-w-2xl leading-relaxed font-medium">
              Discover paid open-source campaigns, fellowships, and winter sprints. Secure dedicated mentorship from core maintainers and contribute production code to global platforms.
            </p>

            {/* Quick Metrics Cards */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-3 bg-surface border border-hairline rounded-2xl px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
                <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider font-bold">Programs</div>
                  <div className="text-sm font-bold text-primary">{programs.length} Active</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-surface border border-hairline rounded-2xl px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
                <div className="w-9 h-9 rounded-xl bg-brass/10 text-brass flex items-center justify-center font-bold">
                  <DollarSign size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider font-bold">Stipend Caps</div>
                  <div className="text-sm font-bold text-primary">Up to €7,000</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-surface border border-hairline rounded-2xl px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center font-bold">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-muted font-mono uppercase tracking-wider font-bold">Vetting</div>
                  <div className="text-sm font-bold text-primary">100% Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: High-fidelity animated SVG Illustration */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="absolute inset-0 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <svg 
              viewBox="0 0 400 320" 
              className="w-full h-auto text-accent drop-shadow-xl select-none relative z-10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Spinning orbits */}
              <circle cx="200" cy="160" r="100" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 6" className="opacity-40 animate-[spin_45s_linear_infinite]" />
              <circle cx="200" cy="160" r="140" stroke="currentColor" strokeWidth="0.6" strokeDasharray="10 10" className="opacity-25 animate-[spin_70s_linear_infinite_reverse]" />
              
              {/* Connection lines */}
              <g className="opacity-70">
                <line x1="200" y1="160" x2="110" y2="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="200" y1="160" x2="290" y2="90" stroke="currentColor" strokeWidth="1.5" />
                <line x1="200" y1="160" x2="120" y2="240" stroke="currentColor" strokeWidth="1.5" />
                <line x1="200" y1="160" x2="280" y2="230" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              </g>

              {/* Central Hub */}
              <g className="translate-x-[200px] translate-y-[160px]">
                <circle cx="0" cy="0" r="32" fill="url(#heroHubGrad)" stroke="currentColor" strokeWidth="2.5" className="shadow-[0_0_30px_rgba(66,133,244,0.4)]" />
                <path d="M-8 -6 L8 -6 M-8 0 L8 0 M-8 6 L4 6" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Interactive Nodes */}
              <g className="animate-[pulse_5s_ease-in-out_infinite]">
                {/* Node 1: GSoC-like Sun */}
                <circle cx="110" cy="80" r="20" fill="var(--color-bg, #0f172a)" stroke="currentColor" strokeWidth="2" />
                <circle cx="110" cy="80" r="7" fill="currentColor" className="animate-ping opacity-75" />
                <circle cx="110" cy="80" r="7" fill="currentColor" />
                
                {/* Node 2: Bitcoin-like coin */}
                <circle cx="290" cy="90" r="22" fill="var(--color-bg, #0f172a)" stroke="#F7931A" strokeWidth="2" />
                <path d="M286 84h8v12h-8z" fill="#F7931A" />
                
                {/* Node 3: LFX bracket */}
                <circle cx="120" cy="240" r="22" fill="var(--color-bg, #0f172a)" stroke="#00C0F3" strokeWidth="2" />
                <path d="M116 234h4v12h-4z" fill="#00C0F3" />
                
                {/* Node 4: Outreachy petal */}
                <circle cx="280" cy="230" r="18" fill="var(--color-bg, #0f172a)" stroke="#E37154" strokeWidth="2" />
                <circle cx="280" cy="230" r="6" fill="#E37154" />
              </g>
              
              <defs>
                <radialGradient id="heroHubGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) rotate(90) scale(32)">
                  <stop stopColor="#4285F4" />
                  <stop offset="1" stopColor="#3182ce" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Explainer Section: What is an Open Source Program? */}
        <div className="bg-surface border border-hairline/80 rounded-[32px] p-8 sm:p-10 mb-16 shadow-[0_4px_30px_rgba(0,0,0,0.015)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/[0.04] to-transparent rounded-bl-[40px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">What is an Open Source Program?</h2>
              <p className="text-xs text-muted font-mono mt-0.5 uppercase tracking-wider">A fast breakdown for first-time contributors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Vetted Stipends */}
            <div className="space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <circle cx="6" cy="15" r="1.5" className="animate-pulse" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-primary">Vetted Stipends</h3>
              <p className="text-secondary text-sm leading-relaxed font-medium">
                These campaigns are fully backed by industry leaders (like Google, DigitalOcean, and CNCF) who pay financial stipends ranging from $1,500 to $7,000 for structured contributions.
              </p>
            </div>

            {/* Card 2: Direct Mentorship */}
            <div className="space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-primary">Direct Mentorship</h3>
              <p className="text-secondary text-sm leading-relaxed font-medium">
                Instead of coding alone, you are matched with core maintainers of global codebases who review your pull requests, host check-in meetings, and guide your engineering roadmap.
              </p>
            </div>

            {/* Card 3: Professional Path */}
            <div className="space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center transition-all duration-200 group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" className="animate-pulse" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-primary">Professional Path</h3>
              <p className="text-secondary text-sm leading-relaxed font-medium">
                Contributing to recognized foundations establishes your Git commit log on world-class projects, validating your skills to top-tier technical recruiters worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Section */}
        <div className="mb-8 flex items-center justify-between border-b border-hairline/80 pb-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted font-bold">
            Active Programs ({programs.length})
          </h2>
          <span className="text-xs font-mono text-accent font-bold">Ready to apply</span>
        </div>

        {/* 3-Column Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>
        
        {programs.length === 0 && (
          <div className="text-center py-20 text-muted bg-surface rounded-[24px] border border-hairline/80 font-mono text-sm">
            No programs found in the database.
          </div>
        )}
      </main>
    </div>
  );
}
