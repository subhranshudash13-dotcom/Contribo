'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, GitPullRequest, Award, Compass, Heart, BookOpen, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

interface RoadmapNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
  resources: { title: string; url: string }[];
  icon: any;
  colorClass: string;
}

const ROADMAP_NODES: RoadmapNode[] = [
  {
    id: "beginner",
    title: "1. I am a Beginner",
    subtitle: "Welcome to Open Source",
    description: "Start by understanding what open source software is, why people contribute, and find your areas of interest (web dev, systems, AI, design).",
    skills: ["Choose an editor (VS Code)", "Learn basic Markdown", "Understand open-source licensing"],
    resources: [
      { title: "Introduction to Open Source", url: "https://opensource.guide/how-to-contribute/" },
      { title: "Finding Your Tech Stack", url: "/resources#finding-first-issues" }
    ],
    icon: Compass,
    colorClass: "border-accent text-accent bg-accent/10"
  },
  {
    id: "git",
    title: "2. Learn Git & GitHub",
    subtitle: "Version Control Essentials",
    description: "Git is the absolute foundation of collaboration. Learn how repositories work, how to clone, branch, commit, push, and create pull requests.",
    skills: ["git init / clone / status", "git branch / checkout", "git commit --message", "git push origin", "Resolving merge conflicts"],
    resources: [
      { title: "Interactive Git Sandbox", url: "https://learngitbranching.js.org/" },
      { title: "Contribo Git Cheat Sheet", url: "/resources#git-guide" }
    ],
    icon: GitBranch,
    colorClass: "border-accent text-accent bg-accent/10"
  },
  {
    id: "first-pr",
    title: "3. Make Your First PR",
    subtitle: "Your First Contribution",
    description: "Take the plunge! Start by correcting typos in documentation, fixing broken links, or adding simple unit tests to a project to build confidence.",
    skills: ["Forking a repository", "Setting upstream remote", "Creating a pull request", "Addressing reviewer comments"],
    resources: [
      { title: "First Contributions Repository", url: "https://github.com/firstcontributions/first-contributions" },
      { title: "GitHub Guide", url: "/resources#github-guide" }
    ],
    icon: GitPullRequest,
    colorClass: "border-accent text-accent bg-accent/10"
  },
  {
    id: "hacktoberfest",
    title: "4. Join Hacktoberfest",
    subtitle: "Your First Global Event",
    description: "Every October, DigitalOcean hosts Hacktoberfest. It's the perfect opportunity to make 4 quality pull requests and earn swags and digital badges.",
    skills: ["Identifying labeled issues", "Communicating with project maintainers", "Submitting high-quality code contributions"],
    resources: [
      { title: "Official Hacktoberfest Guidelines", url: "https://hacktoberfest.com" },
      { title: "Guide: Finding Active Repositories", url: "/resources#finding-first-issues" }
    ],
    icon: Award,
    colorClass: "border-accent text-accent bg-accent/10"
  },
  {
    id: "gsoc",
    title: "5. Enter Google Summer of Code",
    subtitle: "Full-Time Paid Mentorship",
    description: "GSoC (along with Outreachy & LFX) offers intensive summer fellowships with stipends. You'll spend 12+ weeks working under expert mentors on production code.",
    skills: ["Writing detailed proposals", "Understanding community bonding", "Regular reporting and milestone delivery"],
    resources: [
      { title: "GSoC Contributor Manual", url: "https://google.github.io/gsocguides/student/" },
      { title: "How to Write a Winning Proposal", url: "/resources#proposal-writing" }
    ],
    icon: BookOpen,
    colorClass: "border-accent text-accent bg-accent/10"
  },
  {
    id: "maintainer",
    title: "6. Become a Maintainer",
    subtitle: "Take Ownership",
    description: "Once you have regular contributions, you will be invited to become a maintainer. You will review PRs, triaging issues, and shape the future of the project.",
    skills: ["Reviewing community PRs", "Managing repository issues", "Mentoring new contributors", "Defining roadmap specifications"],
    icon: Heart,
    resources: [
      { title: "Open Source Maintainer Guide", url: "https://opensource.guide/maintainers/" }
    ],
    colorClass: "border-accent text-accent bg-accent/10"
  }
];

export default function RoadmapsPage() {
  const [activeNode, setActiveNode] = useState<RoadmapNode>(ROADMAP_NODES[0]);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('contribo_roadmap_completed');
    if (saved) {
      try {
        setCompletedNodes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleCompleted = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = completedNodes.includes(id)
      ? completedNodes.filter(x => x !== id)
      : [...completedNodes, id];
    setCompletedNodes(updated);
    localStorage.setItem('contribo_roadmap_completed', JSON.stringify(updated));
  };

  const progressPercent = mounted 
    ? Math.round((completedNodes.length / ROADMAP_NODES.length) * 100)
    : 0;

  function renderIllustration(id: string) {
    switch(id) {
      case 'beginner':
        return (
          <div className="bg-surface-raised border border-hairline/80 rounded-2xl p-5 font-mono text-[11px] text-secondary shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-4 border-b border-hairline/60 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              <span className="text-[10px] text-muted ml-2">welcome.md</span>
            </div>
            <div className="text-accent font-bold mb-1">// Hello, Open Source World!</div>
            <div>const contributor = &#123;</div>
            <div className="pl-4">experience: <span className="text-accent">"Beginner"</span>,</div>
            <div className="pl-4">passionateLevel: <span className="text-[#C67848]">999</span>,</div>
            <div className="pl-4">readyToLearn: <span className="text-[#C67848]">true</span></div>
            <div>&#125;;</div>
          </div>
        );
      case 'git':
        return (
          <div className="bg-surface-raised border border-hairline/80 rounded-2xl p-5 flex flex-col justify-center items-center h-32 relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-8 relative w-full justify-center">
              {/* Branch lines */}
              <div className="absolute top-[16px] left-8 right-8 h-0.5 bg-hairline/85 z-0" />
              <div className="absolute top-[16px] left-1/2 right-12 h-6 border-r border-b border-dashed border-accent/40 rounded-br-xl z-0" style={{ transform: 'translateY(-10px)' }} />
              {/* Main commits */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold font-mono border-2 border-surface shadow-sm">C1</div>
                <span className="text-[9px] font-mono mt-1 text-muted">main</span>
              </div>
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold font-mono border-2 border-surface shadow-sm">C2</div>
              </div>
              {/* Feature commit */}
              <div className="flex flex-col items-center z-10" style={{ transform: 'translateY(16px)' }}>
                <div className="w-8 h-8 rounded-full bg-brass flex items-center justify-center text-white text-xs font-bold font-mono border-2 border-surface shadow-sm">F1</div>
                <span className="text-[9px] font-mono mt-1 text-muted">feature</span>
              </div>
            </div>
          </div>
        );
      case 'first-pr':
        return (
          <div className="bg-surface-raised border border-hairline/80 rounded-2xl p-5 font-mono text-[11px] text-secondary shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between border-b border-hairline/60 pb-2.5 mb-3">
              <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Pull Request #1
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold text-[9px] uppercase tracking-wider">Approved</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>+ 24 additions</span>
                <span className="text-green-500">✓ Passes tests</span>
              </div>
              <div className="flex justify-between">
                <span>- 4 deletions</span>
                <span className="text-muted">Reviewers: 1 approved</span>
              </div>
            </div>
          </div>
        );
      case 'hacktoberfest':
        return (
          <div className="bg-surface-raised border border-hairline/80 rounded-2xl p-5 flex flex-col items-center justify-center h-32 relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-accent/5 to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent animate-pulse shadow-sm">
              <Award size={24} />
            </div>
            <span className="font-mono text-[10px] text-accent font-bold mt-2.5 tracking-widest uppercase">Global Event Connected</span>
          </div>
        );
      case 'gsoc':
        return (
          <div className="bg-surface-raised border border-hairline/80 rounded-2xl p-5 font-mono text-[10px] text-secondary shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-primary border-b border-hairline/60 pb-2 mb-1">
              <span>GSoC Fellowship Tracker</span>
              <span className="text-accent font-bold">$3,300 Max</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-[9px]">✓</span>
              <span>Proposal Accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-[9px]">✓</span>
              <span>Community Bonding</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center text-[9px] animate-pulse">●</span>
              <span className="text-primary font-bold">Coding Period (Active)</span>
            </div>
          </div>
        );
      case 'maintainer':
        return (
          <div className="bg-surface-raised border border-hairline/80 rounded-2xl p-5 font-mono text-[10px] text-secondary shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)] space-y-2">
            <div className="flex justify-between items-center text-xs border-b border-hairline/60 pb-2 mb-1.5">
              <span className="font-bold text-primary">Triage Operations Console</span>
              <span className="text-accent">Access: Maintainer</span>
            </div>
            <div className="flex justify-between items-center bg-surface border border-hairline/65 px-3 py-2 rounded-xl shadow-sm">
              <span>PR #418 Build Passes</span>
              <span className="text-green-500 font-bold uppercase text-[9px]">Merge Approved</span>
            </div>
            <div className="flex justify-between items-center bg-surface border border-hairline/65 px-3 py-2 rounded-xl shadow-sm">
              <span>Issue #203 Untriaged</span>
              <span className="text-red-500 font-bold uppercase text-[9px]">High Priority</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  // Node coordinates for Desktop Horizontal Git Graph SVG
  const nodePositions = [
    { x: 100, y: 130 }, // Node 1: Beginner
    { x: 260, y: 130 }, // Node 2: Git
    { x: 420, y: 130 }, // Node 3: First PR
    { x: 580, y: 60 },  // Node 4: Hacktoberfest (branched up)
    { x: 740, y: 200 }, // Node 5: GSoC (branched down)
    { x: 900, y: 130 }  // Node 6: Maintainer
  ];

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs font-mono text-muted mb-8 uppercase tracking-widest font-bold">
        <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-primary font-bold">Roadmaps</span>
      </nav>

      {/* Intro Header */}
      <div className="mb-10 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-primary leading-tight">
          Contribution Tech Tree
        </h1>
        <p className="text-secondary text-base sm:text-lg mt-4 font-normal leading-relaxed">
          Interactive Git Graph tracking your progression from beginner commits to core repository maintainer. Check off tasks to light up branch pathways.
        </p>
      </div>

      {/* Progress Tracker Banner */}
      {mounted && (
        <div className="bg-surface border border-hairline/80 rounded-3xl p-6 sm:p-8 mb-10 shadow-[0_4px_24px_rgba(0,0,0,0.01)] max-w-[1100px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">Workspace Status</span>
              <h3 className="font-heading font-bold text-xl text-primary mt-0.5">
                {completedNodes.length} of {ROADMAP_NODES.length} Nodes Resolved
              </h3>
            </div>
            <span className="text-lg font-mono font-bold text-accent">{progressPercent}% synced</span>
          </div>
          <div className="w-full h-2 bg-surface-raised border border-hairline rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500 rounded-full" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
      )}

      {/* Interactive Desktop Git Graph View */}
      <div className="hidden lg:block bg-surface border border-hairline/80 rounded-[32px] p-8 mb-10 overflow-x-auto shadow-[0_4px_24px_rgba(0,0,0,0.01)] max-w-[1100px]">
        <span className="block text-[10px] font-mono uppercase tracking-wider text-muted font-bold mb-6">Interactive Branch Map (Click nodes to inspect)</span>
        
        <div className="min-w-[1000px] h-[260px] relative">
          <svg viewBox="0 0 1000 260" className="w-full h-full overflow-visible select-none">
            {/* Background Base Connections */}
            <path d="M 100 130 L 420 130 L 900 130" fill="none" stroke="var(--hairline)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 420 130 Q 500 60, 580 60 Q 660 60, 740 130" fill="none" stroke="var(--hairline)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 420 130 Q 580 200, 740 200 Q 820 200, 900 130" fill="none" stroke="var(--hairline)" strokeWidth="4" strokeLinecap="round" />

            {/* Active Highlighted Branch Connectors */}
            {mounted && completedNodes.includes('git') && (
              <line x1="100" y1="130" x2="260" y2="130" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            )}
            {mounted && completedNodes.includes('first-pr') && (
              <line x1="260" y1="130" x2="420" y2="130" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            )}
            {mounted && completedNodes.includes('hacktoberfest') && (
              <path d="M 420 130 Q 500 60, 580 60" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            )}
            {mounted && completedNodes.includes('gsoc') && (
              <path d="M 420 130 Q 580 200, 740 200" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            )}
            {mounted && completedNodes.includes('maintainer') && (
              <>
                <line x1="420" y1="130" x2="900" y2="130" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 580 60 Q 660 60, 740 130" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 740 200 Q 820 200, 900 130" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            {/* Render commit nodes */}
            {ROADMAP_NODES.map((node, idx) => {
              const pos = nodePositions[idx];
              const isActive = activeNode.id === node.id;
              const isFinished = completedNodes.includes(node.id);
              
              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer group"
                  onClick={() => setActiveNode(node)}
                >
                  {/* Outer active pulse indicator */}
                  {isActive && (
                    <circle 
                      cx={pos.x} 
                      cy={pos.y} 
                      r="22" 
                      fill="none" 
                      stroke="var(--accent)" 
                      strokeWidth="2" 
                      className="animate-ping opacity-25" 
                    />
                  )}

                  {/* Inner node base */}
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="14" 
                    fill={isFinished ? "var(--accent)" : "var(--surface)"} 
                    stroke={isActive ? "var(--accent)" : "var(--hairline)"} 
                    strokeWidth={isActive ? "4" : "2"} 
                    className="transition-all duration-300 group-hover:scale-110 shadow-sm"
                  />

                  {/* Icon/Status Indicator inside node */}
                  {isFinished ? (
                    <path 
                      d={`M ${pos.x - 4} ${pos.y} L ${pos.x - 1} ${pos.y + 3} L ${pos.x + 4} ${pos.y - 3}`} 
                      fill="none" 
                      stroke="#FFFFFF" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  ) : (
                    <circle cx={pos.x} cy={pos.y} r="3" fill={isActive ? "var(--accent)" : "var(--muted)"} />
                  )}

                  {/* Floating labels */}
                  <text 
                    x={pos.x} 
                    y={pos.y - 24} 
                    textAnchor="middle" 
                    className={`font-heading font-bold text-xs ${isActive ? 'fill-accent' : 'fill-primary'} transition-colors`}
                  >
                    {node.title.split('. ')[1]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Main View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Interactive Step List (Mobile Vertical Git Path) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-6 border-b border-hairline/80 pb-2.5 font-bold">Path Milestones</h2>
          
          <div className="relative border-l border-hairline pl-8 ml-5 space-y-6">
            {ROADMAP_NODES.map((node) => {
              const isActive = activeNode.id === node.id;
              const isFinished = completedNodes.includes(node.id);
              const Icon = node.icon;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className={`w-full text-left relative flex items-center gap-4 p-5 rounded-[20px] border transition-all cursor-pointer group ${
                    isActive
                      ? 'border-accent bg-surface-raised ring-1 ring-accent shadow-sm'
                      : 'border-hairline bg-surface hover:bg-surface-raised'
                  }`}
                >
                  {/* Timeline Connector Dot */}
                  <div className={`absolute left-0 -translate-x-[41px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border bg-base z-10 flex items-center justify-center transition-all ${
                    isActive ? 'border-accent scale-110' : 'border-hairline'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-accent animate-pulse' : 'bg-muted/70'}`} />
                  </div>

                  {/* Icon Block */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${node.colorClass}`}>
                    <Icon size={20} />
                  </div>
                  
                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-primary group-hover:text-accent transition-colors leading-tight mb-1 truncate">
                      {node.title}
                    </h3>
                    <p className="text-xs text-secondary font-medium font-mono">{node.subtitle}</p>
                  </div>

                  {/* Completion Interactive Checkbox */}
                  <button
                    onClick={(e) => toggleCompleted(node.id, e)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isFinished 
                        ? 'bg-accent border-accent text-white' 
                        : 'border-hairline hover:border-accent bg-base'
                    }`}
                  >
                    {isFinished && <Check size={14} strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Milestone Content Panel */}
        <div className="lg:col-span-7">
          <div className="bg-surface border border-hairline/80 rounded-[32px] p-6 sm:p-8 relative shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-accent" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-hairline/80 pb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${activeNode.colorClass}`}>
                  <activeNode.icon size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">Node Properties</span>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-primary leading-none mt-1">{activeNode.title}</h2>
                </div>
              </div>

              {/* Persisted Completion Status Badge */}
              <button
                onClick={() => toggleCompleted(activeNode.id)}
                className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wide px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                  completedNodes.includes(activeNode.id)
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'bg-surface-raised text-secondary border border-hairline hover:border-accent hover:text-accent'
                }`}
              >
                <Check size={14} strokeWidth={3} />
                {completedNodes.includes(activeNode.id) ? 'Resolved' : 'Resolve Node'}
              </button>
            </div>

            {/* Micro-Illustration Visual Box */}
            <div className="mb-6">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-muted font-bold mb-3">Schematic Logs</span>
              {renderIllustration(activeNode.id)}
            </div>

            <p className="text-secondary text-sm sm:text-base font-normal leading-relaxed mb-6 border-b border-hairline/80 pb-6">
              {activeNode.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Skills */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5 font-bold">
                  <GitBranch size={13} className="text-accent" /> Skills to Acquire
                </h4>
                <ul className="space-y-2">
                  {activeNode.skills.map((skill, index) => (
                    <li key={index} className="flex gap-2 items-start text-sm">
                      <span className="text-accent font-mono select-none mt-0.5">•</span>
                      <span className="text-secondary font-normal leading-relaxed">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              {activeNode.resources && activeNode.resources.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5 font-bold">
                    <BookOpen size={13} className="text-accent" /> Recommended Material
                  </h4>
                  <div className="space-y-2">
                    {activeNode.resources.map((res, index) => (
                      <a
                        key={index}
                        href={res.url}
                        className="flex items-center justify-between p-3 rounded-xl border border-hairline bg-base hover:bg-surface-raised transition-colors text-xs font-mono group text-primary font-bold shadow-sm"
                      >
                        <span className="truncate pr-2">{res.title}</span>
                        <ChevronRight size={14} className="text-muted group-hover:text-accent transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
