'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  GitPullRequest,
  ArrowRight,
} from 'lucide-react';

export interface OrgDetail {
  name: string;
  slug: string;
  category: string;
  logoUrl: string;
  description: string;
  programs: string[];
  contributions: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: string[];
  accentColor?: string;
}

const ROW_1_ORGS: OrgDetail[] = [
  {
    name: 'Apache Software Foundation',
    slug: 'apache',
    category: 'Cloud & Big Data',
    logoUrl: 'https://cdn.simpleicons.org/apache',
    description: 'Spark, Kafka, Flink, and foundational cloud infrastructure.',
    programs: ['GSoC', 'LFX'],
    contributions: '420+ Projects',
    difficulty: 'Intermediate',
    techStack: ['Java', 'Scala', 'Python'],
    accentColor: '#D22128',
  },
  {
    name: 'CNCF (Linux Foundation)',
    slug: 'cncf',
    category: 'Container Orchestration',
    logoUrl: 'https://cdn.simpleicons.org/cncf',
    description: 'Kubernetes, Envoy, Prometheus, and cloud native systems.',
    programs: ['LFX', 'GSoC'],
    contributions: '350+ Projects',
    difficulty: 'Advanced',
    techStack: ['Go', 'Rust', 'Kubernetes'],
    accentColor: '#4285F4',
  },
  {
    name: 'Python Software Foundation',
    slug: 'python',
    category: 'Languages & Core',
    logoUrl: 'https://cdn.simpleicons.org/python',
    description: 'CPython compiler, pip, asyncio, and standard libraries.',
    programs: ['GSoC', 'Outreachy'],
    contributions: '340+ Projects',
    difficulty: 'Intermediate',
    techStack: ['Python', 'C', 'Rust'],
    accentColor: '#3776AB',
  },
  {
    name: 'NumFOCUS Scientific',
    slug: 'numfocus',
    category: 'AI & Data Science',
    logoUrl: 'https://cdn.simpleicons.org/numfocus',
    description: 'NumPy, pandas, SciPy, Jupyter, and PyData computing.',
    programs: ['GSoC', 'Outreachy'],
    contributions: '210+ Projects',
    difficulty: 'Intermediate',
    techStack: ['Python', 'C++', 'Fortran'],
    accentColor: '#E26D5C',
  },
  {
    name: 'KDE Community',
    slug: 'kde',
    category: 'Desktop & Creative',
    logoUrl: 'https://cdn.simpleicons.org/kde',
    description: 'Plasma desktop, Krita digital painting, and KDE Frameworks.',
    programs: ['GSoC', 'Outreachy'],
    contributions: '280+ Projects',
    difficulty: 'Beginner',
    techStack: ['C++', 'Qt', 'QML'],
    accentColor: '#1D99F3',
  },
  {
    name: 'Mozilla Devs',
    slug: 'mozilla',
    category: 'Web Standards & Privacy',
    logoUrl: 'https://cdn.simpleicons.org/mozilla',
    description: 'Firefox engine, WebAssembly, Servo, and privacy tooling.',
    programs: ['GSoC', 'Outreachy'],
    contributions: '180+ Projects',
    difficulty: 'Intermediate',
    techStack: ['Rust', 'C++', 'JavaScript'],
    accentColor: '#FF7139',
  },
  {
    name: 'Google Open Source',
    slug: 'google',
    category: 'AI & Mobile',
    logoUrl: 'https://cdn.simpleicons.org/google',
    description: 'TensorFlow, Flutter, Dart, Bazel, and Chromium ecosystem.',
    programs: ['GSoC'],
    contributions: '400+ Projects',
    difficulty: 'Intermediate',
    techStack: ['C++', 'Python', 'Dart'],
    accentColor: '#EA4335',
  },
  {
    name: 'Red Hat Open Source',
    slug: 'redhat',
    category: 'Enterprise Linux',
    logoUrl: 'https://cdn.simpleicons.org/redhat',
    description: 'Fedora, Quarkus, Podman, and enterprise Linux core.',
    programs: ['GSoC', 'LFX'],
    contributions: '190+ Projects',
    difficulty: 'Advanced',
    techStack: ['Go', 'C', 'Java'],
    accentColor: '#EE0000',
  },
];

const ROW_2_ORGS: OrgDetail[] = [
  {
    name: 'LLVM Compiler Project',
    slug: 'llvm',
    category: 'Compilers & Toolchains',
    logoUrl: 'https://cdn.simpleicons.org/llvm',
    description: 'Clang, MLIR, LLDB, and modern code generation engines.',
    programs: ['GSoC'],
    contributions: '110+ Projects',
    difficulty: 'Advanced',
    techStack: ['C++', 'TableGen', 'Assembly'],
    accentColor: '#6B7280',
  },
  {
    name: 'Jupyter Interactive',
    slug: 'jupyter',
    category: 'Scientific Notebooks',
    logoUrl: 'https://cdn.simpleicons.org/jupyter',
    description: 'JupyterLab, interactive kernels, and data science standards.',
    programs: ['GSoC', 'Outreachy'],
    contributions: '130+ Projects',
    difficulty: 'Intermediate',
    techStack: ['TypeScript', 'Python', 'React'],
    accentColor: '#F37626',
  },
  {
    name: 'VideoLAN (VLC)',
    slug: 'videolan',
    category: 'Multimedia & Codecs',
    logoUrl: 'https://cdn.simpleicons.org/vlc',
    description: 'VLC media player, libvlc, and open multimedia decoding.',
    programs: ['GSoC'],
    contributions: '95+ Projects',
    difficulty: 'Advanced',
    techStack: ['C', 'C++', 'OpenGL'],
    accentColor: '#FF8800',
  },
  {
    name: 'Rocket.Chat Engine',
    slug: 'rocket-chat',
    category: 'Comms & Messaging',
    logoUrl: 'https://cdn.simpleicons.org/rocketchat',
    description: 'Real-time collaboration, bots, and omni-channel messaging.',
    programs: ['GSoC', 'LFX'],
    contributions: '150+ Projects',
    difficulty: 'Beginner',
    techStack: ['TypeScript', 'React', 'Node.js'],
    accentColor: '#F5455C',
  },
  {
    name: 'GNOME Foundation',
    slug: 'gnome',
    category: 'Desktop Environment',
    logoUrl: 'https://cdn.simpleicons.org/gnome',
    description: 'GTK4, GNOME Shell, libadwaita, and Linux desktop tools.',
    programs: ['GSoC', 'Outreachy'],
    contributions: '160+ Projects',
    difficulty: 'Beginner',
    techStack: ['C', 'Rust', 'GTK4'],
    accentColor: '#4A90D9',
  },
  {
    name: 'The Tor Project',
    slug: 'tor-project',
    category: 'Privacy & Security',
    logoUrl: 'https://cdn.simpleicons.org/torbrowser',
    description: 'Onion routing, censorship circumvention, and Tor Browser.',
    programs: ['GSoC', 'Outreachy'],
    contributions: '105+ Projects',
    difficulty: 'Advanced',
    techStack: ['Rust', 'C', 'Python'],
    accentColor: '#7D4698',
  },
  {
    name: 'Meta Open Source',
    slug: 'meta',
    category: 'AI & Web Platforms',
    logoUrl: 'https://cdn.simpleicons.org/meta',
    description: 'PyTorch, React, LLaMA toolchains, and Relay.',
    programs: ['MLH', 'GSoC'],
    contributions: '260+ Projects',
    difficulty: 'Advanced',
    techStack: ['Python', 'C++', 'Rust'],
    accentColor: '#0081FB',
  },
  {
    name: 'Docker Community',
    slug: 'docker',
    category: 'DevOps & Containers',
    logoUrl: 'https://cdn.simpleicons.org/docker',
    description: 'Moby, BuildKit, Compose, and developer container tools.',
    programs: ['LFX', 'GSoC'],
    contributions: '140+ Projects',
    difficulty: 'Intermediate',
    techStack: ['Go', 'TypeScript', 'Docker'],
    accentColor: '#2496ED',
  },
];

function difficultyBadge(d: 'Beginner' | 'Intermediate' | 'Advanced') {
  if (d === 'Beginner') {
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  }
  if (d === 'Advanced') {
    return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
  }
  return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
}

function OrgMarqueeCard({ org }: { org: OrgDetail }) {
  const orgUrl = `/organizations/${org.slug}`;

  return (
    <Link
      href={orgUrl}
      className="group relative flex flex-col justify-between w-[285px] sm:w-[315px] h-[160px] p-4 rounded-2xl border border-hairline bg-surface/90 hover:bg-surface transition-all duration-200 hover:border-brass/50 hover:shadow-md dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] shrink-0 overflow-hidden select-none cursor-pointer"
    >
      {/* Top Brand Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: org.accentColor || 'var(--brass)' }}
      />

      <div>
        {/* Top Header: Logo + Name + Difficulty */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-page border border-hairline flex items-center justify-center p-2 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={org.logoUrl}
              alt={`${org.name} logo`}
              className="w-full h-full object-contain filter dark:brightness-110"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = `<span class="font-bold text-xs text-primary">${org.name.charAt(0)}</span>`;
                }
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-semibold text-sm text-primary group-hover:text-brass transition-colors truncate">
              {org.name}
            </h4>
            <p className="text-[11px] font-mono text-muted truncate">
              {org.category}
            </p>
          </div>

          <span
            className={`shrink-0 px-1.5 py-0.5 rounded border text-[9px] font-mono font-semibold uppercase tracking-wider ${difficultyBadge(
              org.difficulty
            )}`}
          >
            {org.difficulty}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-secondary text-[11px] sm:text-xs leading-relaxed line-clamp-1 mt-2.5">
          {org.description}
        </p>
      </div>

      {/* Bottom Footer: Program & Tech Pills + Arrow */}
      <div className="flex items-center justify-between pt-2 border-t border-hairline/60 gap-2">
        <div className="flex items-center gap-1 overflow-hidden">
          {org.programs.slice(0, 2).map((prog) => (
            <span
              key={prog}
              className="px-1.5 py-0.5 rounded bg-page border border-hairline text-[9px] font-mono font-medium text-secondary shrink-0"
            >
              {prog}
            </span>
          ))}
          {org.techStack.slice(0, 2).map((tech) => (
            <span
              key={tech}
              className="px-1.5 py-0.5 rounded bg-surface border border-hairline text-[9px] font-mono text-muted shrink-0"
            >
              {tech}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold text-muted group-hover:text-brass transition-colors shrink-0">
          <GitPullRequest size={11} className="text-secondary" />
          <span className="text-[10px]">{org.contributions.split(' ')[0]}</span>
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform ml-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function PopularOrgsGrid() {
  // Seamless loop by duplicating rows
  const row1 = [...ROW_1_ORGS, ...ROW_1_ORGS];
  const row2 = [...ROW_2_ORGS, ...ROW_2_ORGS];

  return (
    <div className="w-full space-y-4 relative overflow-hidden py-2">
      {/* Track 1: Moving Smoothly Left to Right */}
      <div className="overflow-hidden w-full">
        <div className="animate-marquee-left pause-on-hover flex gap-3.5 sm:gap-4 items-center">
          {row1.map((org, index) => (
            <OrgMarqueeCard key={`row1-${org.slug}-${index}`} org={org} />
          ))}
        </div>
      </div>

      {/* Track 2: Moving Smoothly Left to Right with Offset Speed */}
      <div className="overflow-hidden w-full">
        <div className="animate-marquee-right pause-on-hover flex gap-3.5 sm:gap-4 items-center">
          {row2.map((org, index) => (
            <OrgMarqueeCard key={`row2-${org.slug}-${index}`} org={org} />
          ))}
        </div>
      </div>

      {/* Bottom Directory Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-hairline bg-surface/60 backdrop-blur-sm mt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brass/10 border border-brass/20 flex items-center justify-center text-brass shrink-0">
            <Building2 size={16} />
          </div>
          <p className="text-xs sm:text-sm text-secondary">
            Hover any organization card to pause • <span className="font-semibold text-primary">1,250+ active mentoring orgs</span> indexed.
          </p>
        </div>

        <Link
          href="/organizations"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs shrink-0"
        >
          Browse All (1.2k+)
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
