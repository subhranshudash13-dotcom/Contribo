import Link from 'next/link';
import { Program } from '../../../types';
import { ProgramCard } from '@/components/ui/ProgramCard';
import { Sparkles, Users, Award, HelpCircle, ArrowRight, Activity, TrendingUp, DollarSign } from 'lucide-react';
import { listPrograms } from '@/lib/repositories/programs';
import { ProgramLogo } from '@/components/ui/ProgramLogos';

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

          {/* Right side: Extraordinary 3D Glassmorphic IDE Workspace & Live Campaign Pipeline Visualizer */}
          <div className="hidden lg:block lg:col-span-5 relative select-none">
            {/* Soft backdrop glows */}
            <div className="absolute inset-0 bg-accent/5 rounded-[32px] blur-[80px] pointer-events-none" />
            
            <svg 
              viewBox="0 0 500 400" 
              className="w-full h-auto text-accent drop-shadow-[0_15px_50px_rgba(0,0,0,0.2)] relative z-10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Visualizer gradients */}
                <linearGradient id="laserGsoc" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#4285F4" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#4285F4" />
                </linearGradient>
                <linearGradient id="laserLfx" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00C0F3" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#00C0F3" />
                </linearGradient>
                <linearGradient id="laserOutreachy" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#E37154" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#E37154" />
                </linearGradient>
                
                {/* Glow Filter */}
                <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Perspectival background grid grid */}
              <ellipse cx="250" cy="330" rx="220" ry="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 9" className="opacity-15 animate-[spin_55s_linear_infinite]" />
              <ellipse cx="250" cy="330" rx="150" ry="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" className="opacity-10 animate-[spin_40s_linear_infinite_reverse]" />

              {/* GLOWING LASER PIPELINE CHANNELS */}
              <g className="opacity-80">
                {/* Path to GSoC (Top-Left) */}
                <path d="M 200 200 C 130 200, 80 160, 80 120" stroke="url(#laserGsoc)" strokeWidth="2.5" strokeLinecap="round" filter="url(#laserGlow)" />
                <path d="M 200 200 C 130 200, 80 160, 80 120" stroke="#FFF" strokeWidth="2" strokeDasharray="8 80" strokeLinecap="round" className="animate-[laserFlow_4s_linear_infinite]" />
                
                {/* Path to LFX (Top-Right) */}
                <path d="M 300 200 C 370 200, 420 160, 420 120" stroke="url(#laserLfx)" strokeWidth="2.5" strokeLinecap="round" filter="url(#laserGlow)" />
                <path d="M 300 200 C 370 200, 420 160, 420 120" stroke="#FFF" strokeWidth="2" strokeDasharray="6 60" strokeLinecap="round" className="animate-[laserFlow_3.2s_linear_infinite]" />

                {/* Path to Outreachy (Bottom-Right) */}
                <path d="M 320 250 C 390 250, 410 270, 410 290" stroke="url(#laserOutreachy)" strokeWidth="2.5" strokeLinecap="round" filter="url(#laserGlow)" />
                <path d="M 320 250 C 390 250, 410 270, 410 290" stroke="#FFF" strokeWidth="2" strokeDasharray="8 70" strokeLinecap="round" className="animate-[laserFlow_3.7s_linear_infinite]" />
              </g>

              {/* CORE GLASSMORPHIC IDE WINDOW PANEL (FLOATING AT CENTER) */}
              <g className="translate-y-[20px]">
                {/* Outer Shadow */}
                <rect x="130" y="130" width="240" height="170" rx="16" fill="rgba(0,0,0,0.4)" />
                {/* Main Glassmorphic Face */}
                <rect x="130" y="130" width="240" height="170" rx="16" fill="#0F172A" fillOpacity="0.8" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" className="backdrop-blur-md" />
                
                {/* Tab Header bar */}
                <path d="M 130 146 H 370" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                {/* Window control dots */}
                <circle cx="148" cy="138" r="3" fill="#FF5F56" />
                <circle cx="156" cy="138" r="3" fill="#FFBD2E" />
                <circle cx="164" cy="138" r="3" fill="#27C93F" />
                {/* Active tab */}
                <path d="M 185 146 V 134 H 250 V 146" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                <text x="195" y="142" fill="rgba(255,255,255,0.4)" fontFamily="monospace" fontSize="7" fontWeight="bold">config.json</text>

                {/* Left Panel: Code editor mock */}
                {/* JSON syntax lines */}
                <line x1="145" y1="162" x2="160" y2="162" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
                <line x1="155" y1="172" x2="220" y2="172" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="155" y1="182" x2="200" y2="182" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
                <line x1="155" y1="192" x2="235" y2="192" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
                <line x1="145" y1="202" x2="155" y2="202" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />

                {/* Blinking Shell prompt */}
                <line x1="145" y1="225" x2="245" y2="225" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <text x="145" y="240" fill="#4285F4" fontFamily="monospace" fontSize="8" fontWeight="bold">$ git push</text>
                <text x="145" y="252" fill="#10B981" fontFamily="monospace" fontSize="7" fontWeight="semibold">✔ PR #524 MERGED</text>
                
                {/* Right Panel: Contributions calendar grid */}
                <line x1="260" y1="146" x2="260" y2="300" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x="270" y="162" fill="rgba(255,255,255,0.3)" fontFamily="monospace" fontSize="6" fontWeight="bold" letterSpacing="0.5">CONTRIBUTIONS</text>
                
                {/* Activity Squares */}
                <g className="translate-x-[270px] translate-y-[172px]">
                  {Array.from({ length: 15 }).map((_, idx) => {
                    const bgColors = ['rgba(255,255,255,0.05)', '#10B981', '#10B981', '#00C0F3', '#4285F4'];
                    const factor = Math.abs(Math.sin(idx * 0.9 + 2));
                    const color = bgColors[Math.floor(factor * 4.9)] || bgColors[0];
                    const x = (idx % 3) * 11;
                    const y = Math.floor(idx / 3) * 11;
                    return (
                      <rect key={idx} x={x} y={y} width="8" height="8" rx="1.5" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
                    );
                  })}
                </g>

                {/* Contribo Rank Stats */}
                <text x="270" y="242" fill="rgba(255,255,255,0.3)" fontFamily="monospace" fontSize="6" fontWeight="bold" letterSpacing="0.5">METRICS</text>
                <text x="270" y="254" fill="#FFF" fontFamily="monospace" fontSize="8" fontWeight="bold">RANK: TOP 3%</text>
                <text x="270" y="264" fill="#FBBF24" fontFamily="monospace" fontSize="7" fontWeight="bold">STIPENDS: VETTED</text>
              </g>

              {/* FLOATING 3D OPPORTUNITY PROGRAM BADGES */}

              {/* Badge 1: GSoC (Top Left, Floating) */}
              <g className="translate-x-[50px] translate-y-[60px] animate-[bounce_4.5s_ease-in-out_infinite_200ms]">
                {/* Outer Glow */}
                <circle cx="30" cy="30" r="28" fill="rgba(66,133,244,0.06)" />
                {/* Glass Badge */}
                <circle cx="30" cy="30" r="22" fill="#0F172A" fillOpacity="0.8" stroke="#4285F4" strokeWidth="1.5" className="backdrop-blur-md drop-shadow-[0_0_8px_rgba(66,133,244,0.35)]" />
                {/* Sun logo */}
                <circle cx="30" cy="30" r="8" fill="#F9AB00" />
                <circle cx="30" cy="30" r="5" fill="#EA4335" />
                {/* Floating label */}
                <rect x="-10" y="58" width="80" height="15" rx="4" fill="#1E293B" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <text x="30" y="68" textAnchor="middle" fill="#FFF" fontFamily="monospace" fontSize="6" fontWeight="bold">GSOC // OPEN</text>
              </g>

              {/* Badge 2: LFX Mentorship (Top Right, Floating) */}
              <g className="translate-x-[390px] translate-y-[60px] animate-[bounce_4s_ease-in-out_infinite_600ms]">
                <circle cx="30" cy="30" r="28" fill="rgba(0,192,243,0.06)" />
                <circle cx="30" cy="30" r="22" fill="#0F172A" fillOpacity="0.8" stroke="#00C0F3" strokeWidth="1.5" className="backdrop-blur-md drop-shadow-[0_0_8px_rgba(0,192,243,0.35)]" />
                {/* Terminal brackets logo */}
                <path d="M 23 26 L 20 30 L 23 34 M 37 26 L 40 30 L 37 34" stroke="#00C0F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="30" cy="30" r="3" fill="#00C0F3" />
                {/* Floating label */}
                <rect x="-10" y="58" width="80" height="15" rx="4" fill="#1E293B" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <text x="30" y="68" textAnchor="middle" fill="#FFF" fontFamily="monospace" fontSize="6" fontWeight="bold">LFX // ACTIVE</text>
              </g>

              {/* Badge 3: Outreachy Fellowship (Bottom Right, Floating) */}
              <g className="translate-x-[380px] translate-y-[260px] animate-[bounce_4.8s_ease-in-out_infinite_400ms]">
                <circle cx="30" cy="30" r="28" fill="rgba(227,113,84,0.06)" />
                <circle cx="30" cy="30" r="22" fill="#0F172A" fillOpacity="0.8" stroke="#E37154" strokeWidth="1.5" className="backdrop-blur-md drop-shadow-[0_0_8px_rgba(227,113,84,0.35)]" />
                {/* Flower petal logo */}
                <circle cx="30" cy="30" r="5" fill="#E37154" />
                <path d="M 25 30 H 35 M 30 25 V 35" stroke="#E37154" strokeWidth="1.2" />
                {/* Floating label */}
                <rect x="-15" y="58" width="90" height="15" rx="4" fill="#1E293B" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <text x="30" y="68" textAnchor="middle" fill="#FFF" fontFamily="monospace" fontSize="6" fontWeight="bold">OUTREACHY // LIVE</text>
              </g>

              {/* CSS Animation dashes keyframe */}
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
