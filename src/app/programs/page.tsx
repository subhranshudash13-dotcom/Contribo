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

          {/* Right side: High-fidelity 3D Isometric Contribution Landscape SVG Illustration */}
          <div className="hidden lg:block lg:col-span-5 relative select-none">
            {/* Ambient colorful backdrop glows */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#4285F4]/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-[60px] pointer-events-none" />
            
            <svg 
              viewBox="0 0 500 400" 
              className="w-full h-auto text-accent drop-shadow-[0_12px_40px_rgba(0,0,0,0.15)] relative z-10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Gradients & Filters */}
                <linearGradient id="ideGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="laserGsoc" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4285F4" />
                </linearGradient>
                <linearGradient id="laserLfx" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00C0F3" />
                </linearGradient>
                <linearGradient id="laserOutreachy" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#E37154" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid backdrop structure */}
              <ellipse cx="250" cy="200" rx="200" ry="120" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 12" className="opacity-20 animate-[spin_60s_linear_infinite]" />

              {/* 3D ISOMETRIC CONNECTOR CHANNELS (LASER BEAMS) */}
              <g className="opacity-90">
                {/* Connector to GSoC */}
                <path d="M 200 270 C 140 250, 140 180, 140 145" stroke="url(#laserGsoc)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 200 270 C 140 250, 140 180, 140 145" stroke="#FFF" strokeWidth="2.5" strokeDasharray="12 120" strokeLinecap="round" className="animate-[laserFlow_4.5s_linear_infinite]" />
                
                {/* Connector to LFX */}
                <path d="M 240 250 C 270 200, 270 160, 270 125" stroke="url(#laserLfx)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 240 250 C 270 200, 270 160, 270 125" stroke="#FFF" strokeWidth="2.5" strokeDasharray="10 100" strokeLinecap="round" className="animate-[laserFlow_3.8s_linear_infinite]" />

                {/* Connector to Outreachy */}
                <path d="M 280 270 C 350 250, 370 200, 380 165" stroke="url(#laserOutreachy)" strokeWidth="3" strokeLinecap="round" />
                <path d="M 280 270 C 350 250, 370 200, 380 165" stroke="#FFF" strokeWidth="2.5" strokeDasharray="8 80" strokeLinecap="round" className="animate-[laserFlow_4.2s_linear_infinite]" />
              </g>

              {/* ISOMETRIC BASE: THE DEVELOPER WORKSPACE PANEL */}
              <g className="translate-y-[20px]">
                {/* Base Shadow layer */}
                <polygon points="100,285 260,205 350,255 190,335" fill="rgba(0,0,0,0.3)" />
                {/* Main 3D Card Face */}
                <polygon points="100,280 260,200 350,250 190,330" fill="url(#ideGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                {/* Accent glow line inside Base Panel */}
                <polygon points="115,282 250,214 325,252 190,319" stroke="url(#laserLfx)" strokeWidth="1" strokeDasharray="10 5" className="opacity-40" />

                {/* Simulated Editor Code Syntax inside perspective face */}
                {/* Tabs */}
                <polygon points="120,265 170,240 190,250 140,275" fill="#1E293B" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                <polygon points="175,237 215,217 235,227 195,247" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                
                {/* Code Lines */}
                <line x1="130" y1="285" x2="190" y2="255" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="140" y1="295" x2="230" y2="250" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="150" y1="305" x2="210" y2="275" stroke="#F9AB00" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="160" y1="315" x2="280" y2="255" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
              </g>

              {/* FLOATING ISOMETRIC PROGRAM OPPORTUNITIES CARDS */}
              
              {/* Card 1: GSoC (Top Left) */}
              <g className="translate-x-[70px] translate-y-[60px] animate-[bounce_4.8s_ease-in-out_infinite_200ms]">
                {/* Card Shadow */}
                <polygon points="30,85 110,45 150,65 70,105" fill="rgba(0,0,0,0.25)" />
                {/* Card Face */}
                <polygon points="30,80 110,40 150,60 70,100" fill="#0F172A" stroke="#4285F4" strokeWidth="1.8" className="drop-shadow-[0_0_12px_rgba(66,133,244,0.3)]" />
                {/* Program representation: Sun Badge */}
                <circle cx="90" cy="70" r="14" fill="#EA4335" className="opacity-20 animate-ping" />
                <circle cx="90" cy="70" r="10" fill="#F9AB00" />
                <path d="M 85 70 H 95 M 90 65 V 75" stroke="#FFF" strokeWidth="2" />
                {/* Inline text */}
                <path d="M 50 88 L 75 75" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 55 93 L 70 85" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Card 2: LFX Mentorship (Top Center) */}
              <g className="translate-x-[210px] translate-y-[35px] animate-[bounce_4.2s_ease-in-out_infinite_700ms]">
                {/* Card Shadow */}
                <polygon points="30,85 110,45 150,65 70,105" fill="rgba(0,0,0,0.25)" />
                {/* Card Face */}
                <polygon points="30,80 110,40 150,60 70,100" fill="#0F172A" stroke="#00C0F3" strokeWidth="1.8" className="drop-shadow-[0_0_12px_rgba(0,192,243,0.3)]" />
                {/* Program representation: Terminal brackets */}
                <g className="translate-x-[90px] translate-y-[70px]">
                  <circle cx="0" cy="0" r="12" fill="#00C0F3" className="opacity-15 animate-pulse" />
                  <path d="M-6 -4 L-9 0 L-6 4 M6 -4 L9 0 L6 4" stroke="#00C0F3" strokeWidth="2" strokeLinecap="round" />
                </g>
                <path d="M 50 88 L 75 75" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 55 93 L 80 81" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Card 3: Outreachy (Center Right) */}
              <g className="translate-x-[320px] translate-y-[85px] animate-[bounce_4.5s_ease-in-out_infinite_400ms]">
                {/* Card Shadow */}
                <polygon points="30,85 110,45 150,65 70,105" fill="rgba(0,0,0,0.25)" />
                {/* Card Face */}
                <polygon points="30,80 110,40 150,60 70,100" fill="#0F172A" stroke="#E37154" strokeWidth="1.8" className="drop-shadow-[0_0_12px_rgba(227,113,84,0.3)]" />
                {/* Program representation: Starburst flower */}
                <g className="translate-x-[90px] translate-y-[70px]">
                  <circle cx="0" cy="0" r="10" fill="#E37154" className="animate-ping opacity-25" />
                  <circle cx="0" cy="0" r="6" fill="#E37154" />
                  <path d="M-9 0 H9 M0 -9 V9" stroke="#E37154" strokeWidth="1.5" />
                </g>
                <path d="M 50 88 L 75 75" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 55 93 L 70 85" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Floating UI Badges */}
              {/* Badge A: Git Merge Successful */}
              <g className="translate-x-[260px] translate-y-[280px] animate-[bounce_3.9s_ease-in-out_infinite_100ms]">
                <rect x="0" y="0" width="105" height="26" rx="13" fill="#1E293B" stroke="#10B981" strokeWidth="1.5" className="drop-shadow-[0_4px_10px_rgba(16,185,129,0.2)]" />
                {/* Checkmark circle */}
                <circle cx="15" cy="13" r="7" fill="#10B981" />
                <path d="M12 13 L14 15 L18 11" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Text label */}
                <text x="28" y="17" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold">PR #594 MERGED</text>
              </g>

              {/* Badge B: Stipends Released */}
              <g className="translate-x-[60px] translate-y-[210px] animate-[bounce_5.2s_ease-in-out_infinite_300ms]">
                <rect x="0" y="0" width="100" height="26" rx="13" fill="#1E293B" stroke="#FBBF24" strokeWidth="1.5" className="drop-shadow-[0_4px_10px_rgba(251,191,36,0.2)]" />
                <circle cx="15" cy="13" r="7" fill="#FBBF24" />
                <path d="M13 9.5 V16.5 M11 11 H19 M12.5 14 H17" stroke="#000" strokeWidth="1.2" />
                <text x="28" y="17" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold">STIPEND: €6,000</text>
              </g>
              
              {/* Extra details: Floating stars and grid intersections */}
              <g className="opacity-45" fill="currentColor">
                <circle cx="280" cy="80" r="1.5" className="animate-ping text-accent" />
                <circle cx="160" cy="190" r="2.5" className="text-brass" />
                <circle cx="390" cy="240" r="1.5" className="text-green-500 animate-pulse" />
              </g>

              {/* Custom CSS Animation definitions inside SVG */}
              <style>{`
                @keyframes laserFlow {
                  to {
                    stroke-dashoffset: -260;
                  }
                }
              `}</style>
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
