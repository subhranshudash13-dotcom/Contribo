'use client';

import React from 'react';

export function SchematicHero() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6 relative flex justify-center h-56 md:h-72 select-none">
      <svg viewBox="0 0 800 260" className="w-full h-full text-hairline" fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Main Convergence Trunk (Contribo Universal Platform) */}
        <path d="M400,260 L400,160" className="stroke-brass animate-[dash_1.5s_ease-out_forwards]" strokeDasharray="500" strokeDashoffset="500" strokeWidth="2.5" />
        
        {/* Branch 1: GSoC (Left Outer) */}
        <path d="M120,40 L120,90 C120,150 400,120 400,160" className="stroke-slate animate-[dash_2s_ease-out_forwards]" strokeDasharray="800" strokeDashoffset="800" />
        
        {/* Branch 2: Outreachy (Left Inner) */}
        <path d="M230,40 L230,90 C230,140 400,130 400,160" className="stroke-slate animate-[dash_1.8s_ease-out_forwards]" strokeDasharray="800" strokeDashoffset="800" />
        
        {/* Branch 3: LFX Mentorship (Center Left) */}
        <path d="M340,40 L340,110 C340,140 400,140 400,160" className="stroke-slate animate-[dash_1.6s_ease-out_forwards]" strokeDasharray="800" strokeDashoffset="800" />
        
        {/* Branch 4: Summer of Bitcoin (Center Right) */}
        <path d="M460,40 L460,110 C460,140 400,140 400,160" className="stroke-slate animate-[dash_1.6s_ease-out_forwards]" strokeDasharray="800" strokeDashoffset="800" />
        
        {/* Branch 5: MLH Fellowship (Right Inner) */}
        <path d="M570,40 L570,90 C570,140 400,130 400,160" className="stroke-slate animate-[dash_1.8s_ease-out_forwards]" strokeDasharray="800" strokeDashoffset="800" />
        
        {/* Branch 6: Hacktoberfest (Right Outer) */}
        <path d="M680,40 L680,90 C680,150 400,120 400,160" className="stroke-slate animate-[dash_2s_ease-out_forwards]" strokeDasharray="800" strokeDashoffset="800" />

        {/* Outer Program Source Nodes */}
        <circle cx="120" cy="40" r="4.5" className="fill-base stroke-brass animate-[fade_2s_ease-in_forwards]" strokeWidth="2" />
        <circle cx="230" cy="40" r="4.5" className="fill-base stroke-brass animate-[fade_2s_ease-in_forwards]" strokeWidth="2" />
        <circle cx="340" cy="40" r="4.5" className="fill-base stroke-brass animate-[fade_2s_ease-in_forwards]" strokeWidth="2" />
        <circle cx="460" cy="40" r="4.5" className="fill-base stroke-brass animate-[fade_2s_ease-in_forwards]" strokeWidth="2" />
        <circle cx="570" cy="40" r="4.5" className="fill-base stroke-brass animate-[fade_2s_ease-in_forwards]" strokeWidth="2" />
        <circle cx="680" cy="40" r="4.5" className="fill-base stroke-brass animate-[fade_2s_ease-in_forwards]" strokeWidth="2" />
        
        {/* Convergence Hub Node (Contribo Central Matcher) */}
        <circle cx="400" cy="160" r="7" className="fill-brass stroke-brass animate-[fade_2.5s_ease-in_forwards] animate-pulse" />
        
        {/* Program labels set in utility monospace */}
        <text x="120" y="22" textAnchor="middle" className="fill-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold animate-[fade_2s_ease-in_forwards]">GSoC</text>
        <text x="230" y="22" textAnchor="middle" className="fill-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold animate-[fade_2s_ease-in_forwards]">Outreachy</text>
        <text x="340" y="22" textAnchor="middle" className="fill-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold animate-[fade_2s_ease-in_forwards]">LFX</text>
        <text x="460" y="22" textAnchor="middle" className="fill-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold animate-[fade_2s_ease-in_forwards]">Bitcoin</text>
        <text x="570" y="22" textAnchor="middle" className="fill-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold animate-[fade_2s_ease-in_forwards]">MLH</text>
        <text x="680" y="22" textAnchor="middle" className="fill-muted font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold animate-[fade_2s_ease-in_forwards]">Hacktober</text>

        {/* Central Converged Label */}
        <text x="400" y="195" textAnchor="middle" className="fill-primary font-mono text-[11px] uppercase tracking-[0.25em] font-bold animate-[fade_2s_ease-in_forwards]">Universal Engine</text>
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}
