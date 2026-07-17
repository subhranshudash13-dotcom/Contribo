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

          {/* Right side: High-fidelity animated Developer Workspace Dashboard Mockup */}
          <div className="hidden lg:block lg:col-span-5 relative select-none">
            {/* Soft backdrop glow matching program branding */}
            <div className="absolute inset-0 bg-accent/5 rounded-[32px] blur-[80px] pointer-events-none" />
            
            {/* Terminal/Editor Glassmorphic Panel */}
            <div className="relative z-10 w-full rounded-3xl border border-hairline bg-surface/50 backdrop-blur-md shadow-2xl overflow-hidden font-mono text-[11px] text-primary flex flex-col h-[330px]">
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-4 py-3 bg-base border-b border-hairline">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>
                <div className="text-[10px] text-muted font-bold tracking-wider uppercase font-mono">contribo ~ workspace</div>
                <div className="w-12" /> {/* spacer */}
              </div>

              {/* IDE Workspace Split */}
              <div className="flex flex-1 divide-x divide-hairline min-h-0 overflow-hidden">
                {/* Left Side: Code Editor (JSON config) */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col gap-2 bg-surface/20">
                  <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> config.json
                  </div>
                  
                  {/* JSON Syntax Styling */}
                  <div className="space-y-1 text-[10px] leading-relaxed font-semibold">
                    <div>
                      <span className="text-[#F87171]">{'{'}</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-[#38BDF8]">"program"</span>: <span className="text-[#34D399]">"LFX_Mentorship"</span>,
                    </div>
                    <div className="pl-4">
                      <span className="text-[#38BDF8]">"skills"</span>: <span className="text-[#C084FC]">["Golang", "Rust"]</span>,
                    </div>
                    <div className="pl-4">
                      <span className="text-[#38BDF8]">"stipends"</span>: <span className="text-[#FBBF24]">"Verified"</span>,
                    </div>
                    <div className="pl-4">
                      <span className="text-[#38BDF8]">"status"</span>: <span className="text-[#34D399]">"Active_Sprint"</span>
                    </div>
                    <div>
                      <span className="text-[#F87171]">{'}'}</span>
                    </div>
                  </div>

                  {/* Terminal Console Panel */}
                  <div className="mt-auto border-t border-hairline/60 pt-3 flex flex-col gap-1 text-[10px] text-muted">
                    <div className="flex items-center gap-1">
                      <span className="text-accent font-bold">$</span> 
                      <span>git push origin main</span>
                    </div>
                    <div className="text-[#10B981] font-bold flex items-center gap-1">
                      <span>✔</span> 
                      <span>Contribution merged successfully.</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Contribution Grid Calendar */}
                <div className="w-[190px] p-4 flex flex-col gap-3 shrink-0 bg-base/10">
                  <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> contributor stats
                  </div>

                  {/* Heatmap Blocks */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] text-muted font-mono">Contributions Activity</div>
                    <div className="grid grid-cols-6 gap-1 w-fit">
                      {Array.from({ length: 24 }).map((_, idx) => {
                        const bgClasses = [
                          'bg-muted/10 border-hairline/25',
                          'bg-[#10B981]/20 border-[#10B981]/30',
                          'bg-[#10B981]/40 border-[#10B981]/50',
                          'bg-[#10B981]/70 border-[#10B981]/80',
                          'bg-[#10B981] border-[#10B981]'
                        ];
                        const factor = Math.abs(Math.sin(idx * 0.7 + 3));
                        const selectedBg = bgClasses[Math.floor(factor * 4.9)] || bgClasses[0];
                        const isSpecialNode = idx === 9 || idx === 16;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`w-[22px] h-[22px] rounded-md border transition-colors ${selectedBg} ${isSpecialNode ? 'animate-pulse bg-accent border-accent/60 shadow-[0_0_10px_rgba(66,133,244,0.45)]' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Dashboard Metrics */}
                  <div className="mt-auto border-t border-hairline/60 pt-3 space-y-1 text-[9px] text-muted font-mono">
                    <div className="flex justify-between">
                      <span>Commits</span>
                      <span className="font-bold text-primary">148</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PRs Merged</span>
                      <span className="font-bold text-green-500">14</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rank</span>
                      <span className="font-bold text-accent">Top 3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
