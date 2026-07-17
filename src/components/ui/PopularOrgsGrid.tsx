'use client';

import React, { useState } from 'react';
import { Building2, X, Sparkles, Code2, ShieldAlert, GitCommit } from 'lucide-react';

interface OrgDetail {
  name: string;
  slug: string;
  logoChar: string;
  description: string;
  programs: string[];
  contributions: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: string[];
}

const POPULAR_ORGS: OrgDetail[] = [
  {
    name: "Apache Software Foundation",
    slug: "apache",
    logoChar: "A",
    description: "Providing software for the public good, housing projects like HTTP Server, Spark, and Kafka.",
    programs: ["GSoC", "LFX Mentorship"],
    contributions: "420+ Merged PRs",
    difficulty: "Intermediate",
    techStack: ["Java", "Scala", "Python", "C++"]
  },
  {
    name: "KDE Community",
    slug: "kde",
    logoChar: "K",
    description: "International technology team creating free and open-source software for desktop and portable computing.",
    programs: ["GSoC", "Outreachy", "Season of KDE"],
    contributions: "280+ Merged PRs",
    difficulty: "Beginner",
    techStack: ["C++", "Qt", "JavaScript", "Python"]
  },
  {
    name: "LLVM Compiler Infrastructure",
    slug: "llvm",
    logoChar: "L",
    description: "A collection of modular and reusable compiler and toolchain technologies.",
    programs: ["GSoC"],
    contributions: "110+ Merged PRs",
    difficulty: "Advanced",
    techStack: ["C++", "Assembly", "TableGen", "Python"]
  },
  {
    name: "Python Software Foundation",
    slug: "python",
    logoChar: "P",
    description: "Promoting, protecting, and advancing the Python programming language and supporting its community.",
    programs: ["GSoC", "Outreachy"],
    contributions: "340+ Merged PRs",
    difficulty: "Intermediate",
    techStack: ["Python", "C", "Rust", "HTML/CSS"]
  },
  {
    name: "NumFOCUS",
    slug: "numfocus",
    logoChar: "N",
    description: "Supporting open-source scientific computing projects like NumPy, pandas, and Jupyter.",
    programs: ["GSoC", "Outreachy"],
    contributions: "190+ Merged PRs",
    difficulty: "Intermediate",
    techStack: ["Python", "C", "C++", "Fortran"]
  },
  {
    name: "Rocket.Chat",
    slug: "rocket-chat",
    logoChar: "R",
    description: "The ultimate open-source communication platform, customizable and highly secure.",
    programs: ["GSoC", "LFX Mentorship"],
    contributions: "150+ Merged PRs",
    difficulty: "Beginner",
    techStack: ["TypeScript", "JavaScript", "React", "Node.js"]
  },
  {
    name: "Jupyter Project",
    slug: "jupyter",
    logoChar: "J",
    description: "Developing open-source software, open-standards, and services for interactive computing.",
    programs: ["GSoC", "Outreachy"],
    contributions: "130+ Merged PRs",
    difficulty: "Intermediate",
    techStack: ["Python", "TypeScript", "React", "Rust"]
  },
  {
    name: "VideoLAN",
    slug: "videolan",
    logoChar: "V",
    description: "Non-profit organization behind VLC media player and other free multimedia engines.",
    programs: ["GSoC"],
    contributions: "95+ Merged PRs",
    difficulty: "Advanced",
    techStack: ["C", "C++", "Objective-C", "Assembly"]
  }
];

export function PopularOrgsGrid() {
  const [selectedOrg, setSelectedOrg] = useState<OrgDetail | null>(null);

  return (
    <div className="space-y-6">
      {/* Grid of Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {POPULAR_ORGS.map((org) => {
          const isSelected = selectedOrg?.slug === org.slug;
          return (
            <button
              key={org.slug}
              onClick={() => setSelectedOrg(isSelected ? null : org)}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col items-center justify-center min-h-[120px] group ${
                isSelected
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-hairline bg-surface hover:border-accent/40 hover:bg-surface-raised/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.01)]'
              }`}
            >
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-mono font-extrabold text-base mb-2 shadow-sm transition-all group-hover:scale-105 ${
                isSelected 
                  ? 'bg-accent text-white border-accent' 
                  : 'bg-base border-hairline text-accent group-hover:bg-accent/10'
              }`}>
                {org.logoChar}
              </div>
              <span className="font-extrabold text-xs text-primary text-center line-clamp-1 group-hover:text-accent transition-colors">{org.name}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted mt-1 font-bold">{org.techStack[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Info Panel when clicked */}
      {selectedOrg && (
        <div className="bg-surface-raised/50 border border-hairline rounded-[24px] p-6 relative animate-[fade_0.2s_ease-out_forwards] shadow-sm overflow-hidden">
          {/* Subtle ambient light dot inside drawer */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/[0.02] rounded-full blur-2xl pointer-events-none -z-10" />
          
          <button
            onClick={() => setSelectedOrg(null)}
            className="absolute top-5 right-5 p-2 text-muted hover:text-primary transition-colors cursor-pointer bg-surface border border-hairline rounded-full shadow-sm hover:shadow-md"
            aria-label="Close details"
          >
            <X size={14} />
          </button>

          <div className="flex flex-col lg:flex-row gap-6 lg:items-start pr-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <h3 className="font-extrabold text-lg text-primary">{selectedOrg.name}</h3>
              </div>
              <p className="text-secondary text-sm leading-relaxed max-w-2xl">{selectedOrg.description}</p>
              
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedOrg.techStack.map((tech) => (
                  <span key={tech} className="bg-surface border border-hairline px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold text-primary shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Compartmentalized Card Deck */}
            <div className="w-full lg:w-72 grid grid-cols-1 gap-3 shrink-0 pt-4 lg:pt-0 lg:pl-6 lg:border-l border-hairline">
              
              {/* Compartment 1: Programs */}
              <div className="bg-surface border border-hairline rounded-xl p-4 shadow-sm">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-accent" /> Programs Available
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOrg.programs.map((prog) => (
                    <span key={prog} className="bg-accent/15 border border-accent/25 text-accent px-2 py-0.5 rounded-md font-mono text-[9px] font-bold">
                      {prog}
                    </span>
                  ))}
                </div>
              </div>

              {/* Compartment 2: Contributions */}
              <div className="bg-surface border border-hairline rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted font-bold mb-1 flex items-center gap-1.5">
                    <GitCommit size={12} className="text-secondary" /> Past Contributions
                  </div>
                  <span className="font-mono text-xs font-bold text-primary">{selectedOrg.contributions}</span>
                </div>
              </div>

              {/* Compartment 3: Difficulty */}
              <div className="bg-surface border border-hairline rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted font-bold mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={12} className="text-muted" /> Difficulty Level
                  </div>
                  <span className="font-sans text-xs font-extrabold text-accent">{selectedOrg.difficulty}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
