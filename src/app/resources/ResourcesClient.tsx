'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  GitBranch, 
  Terminal, 
  Compass, 
  Award, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface ResourceGuide {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  keyPoints: string[];
  realLifeExample: {
    title: string;
    content: React.ReactNode;
  };
  isHighlight?: boolean;
}

const RESOURCES: ResourceGuide[] = [
  {
    id: "proposal-writing",
    title: "How to write proposals",
    category: "Mentorship Application",
    icon: BookOpen,
    isHighlight: true,
    description: "Learn how to formulate and present winning project proposals for GSoC, Outreachy, LFX, and ESoC.",
    keyPoints: [
      "Focus heavily on the technical implementation breakdown, not just marketing speak.",
      "Include realistic, week-by-week timelines with clear deliverable milestones.",
      "Show evidence of preliminary research (e.g. referencing specific functions or files)."
    ],
    realLifeExample: {
      title: "Real Excerpt from an Accepted GSoC Proposal Timeline",
      content: (
        <div className="space-y-3 font-mono text-xs text-secondary bg-surface-raised p-4 rounded-xl border border-hairline">
          <p><strong className="text-accent">Week 1-2:</strong> Set up API routes in `src/app/api/matcher/route.ts`. Implement the MongoDB `$text` search index schema migration. Write initial unit tests using Jest.</p>
          <p><strong className="text-accent">Week 3-4:</strong> Build the `ResultsGrid.tsx` React component. Hook the frontend state to the new API endpoint. Ensure loading skeletons are implemented for UX.</p>
          <p><strong className="text-accent">Week 5 (Midterm):</strong> Polish the UI, resolve any TypeScript strict-mode warnings, and deploy to the staging branch for mentor review.</p>
          <div className="mt-4 p-2 bg-success/10 border border-success/20 rounded text-success text-[11px] font-sans">
            <strong>Why this worked:</strong> It names specific files, frameworks, and milestones rather than just saying &ldquo;I will write code.&rdquo;
          </div>
        </div>
      )
    }
  },
  {
    id: "finding-first-issues",
    title: "Finding Good First Issues",
    category: "Discovery",
    icon: Compass,
    isHighlight: true,
    description: "Struggling to find where to start? Use our curated paths to discover beginner issues.",
    keyPoints: [
      "Use advanced GitHub search filters to narrow down issues.",
      "Look for repositories that actively merge community PRs.",
      "Don't just claim an issue; state exactly how you plan to fix it."
    ],
    realLifeExample: {
      title: "Effective GitHub Search Query",
      content: (
        <div className="space-y-4 text-sm text-secondary">
          <p>Instead of manually browsing, use this exact query in the GitHub global search bar to find issues that are open, beginner-friendly, and not yet assigned or linked to a PR:</p>
          <div className="bg-surface-raised p-3 rounded-lg border border-hairline font-mono text-xs text-brass break-all">
            is:issue is:open label:&quot;good first issue&quot; no:assignee -linked:pr language:typescript
          </div>
          <div className="mt-2 p-3 bg-accent/5 border border-accent/10 rounded-lg">
            <strong className="text-primary block mb-1">Real Interaction Example:</strong>
            <p className="italic text-tertiary">&ldquo;Hi! I see this issue is open. I&apos;d like to fix the contrast bug by updating the `text-gray-900` class to `text-primary` in `Footer.tsx`. May I open a PR for this?&rdquo;</p>
          </div>
        </div>
      )
    }
  },
  {
    id: "git-guide",
    title: "Git Guide",
    category: "Version Control",
    icon: GitBranch,
    description: "Master the git workflows, branches, commits, forks, and rebase conventions used in open source.",
    keyPoints: [
      "Never commit directly to the `main` branch of your fork.",
      "Write descriptive commit messages explaining the 'why', not just the 'what'.",
      "Learn how to squash commits to keep the project history clean."
    ],
    realLifeExample: {
      title: "Real Scenario: Squashing Commits for a Clean PR",
      content: (
        <div className="space-y-3 font-mono text-xs text-secondary bg-surface-raised p-4 rounded-xl border border-hairline">
          <p className="text-tertiary"># You made 3 messy commits while debugging:</p>
          <p>1. <span className="text-error">&ldquo;fix bug&rdquo;</span></p>
          <p>2. <span className="text-error">&ldquo;oops typo&rdquo;</span></p>
          <p>3. <span className="text-error">&ldquo;actually fix it this time&rdquo;</span></p>
          <div className="my-2 border-t border-hairline" />
          <p className="text-tertiary"># A maintainer asks you to squash them. You run:</p>
          <p className="text-brass font-bold">git rebase -i HEAD~3</p>
          <p className="text-tertiary mt-2"># You change the final commit message to:</p>
          <p className="text-success font-bold">&ldquo;fix(auth): resolve null pointer exception in login flow&rdquo;</p>
        </div>
      )
    }
  },
  {
    id: "github-guide",
    title: "GitHub Guide",
    category: "Developer Platform",
    icon: Terminal,
    description: "Find your way around repositories, issues, discussions, projects, and pull requests.",
    keyPoints: [
      "Always fork the repository and clone your fork locally.",
      "Keep your fork synced with the upstream repository.",
      "Use GitHub Draft PRs if you want early feedback on incomplete code."
    ],
    realLifeExample: {
      title: "The Perfect Pull Request Description",
      content: (
        <div className="space-y-3 text-sm text-secondary bg-surface-raised p-4 rounded-xl border border-hairline whitespace-pre-wrap font-sans">
          <strong className="text-primary block border-b border-hairline pb-2 mb-2">Fix Mobile Navigation Overflow (Fixes #204)</strong>
          <p><strong>What changes did you make?</strong><br/>
          Replaced the fixed width `w-64` on the sidebar with a responsive `w-full md:w-64` class to prevent horizontal scrolling on mobile devices.</p>
          <p><strong>How to test:</strong><br/>
          1. Run the app locally on a screen smaller than 768px.<br/>
          2. Open the navigation menu.<br/>
          3. Verify the screen no longer scrolls horizontally.</p>
          <p><strong>Screenshots:</strong><br/>
          *(Attached Before & After images)*</p>
        </div>
      )
    }
  },
  {
    id: "resume-tips",
    title: "Resume Tips",
    category: "Career Support",
    icon: Award,
    description: "Optimize your resume to highlight open-source contributions and grab reviewer attention.",
    keyPoints: [
      "Quantify your impact (e.g., 'Merged 5 PRs', 'Decreased load time by 10%').",
      "Link directly to your merged PRs or GitHub profile.",
      "List open source under 'Experience', not just 'Hobbies'."
    ],
    realLifeExample: {
      title: "Resume Snippet: Before vs After",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
            <h4 className="text-error text-xs font-bold uppercase tracking-wider mb-2">Before (Too Vague)</h4>
            <p className="text-sm text-secondary">
              <strong>Open Source Contributor</strong><br/>
              Contributed to React ecosystem projects. Fixed bugs and added features.
            </p>
          </div>
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <h4 className="text-success text-xs font-bold uppercase tracking-wider mb-2">After (High Impact)</h4>
            <p className="text-sm text-secondary">
              <strong>Open Source Contributor — VLC Media Player</strong><br/>
              • Merged 4 Pull Requests into the core C++ codebase.<br/>
              • Refactored the audio buffering module, resolving a critical memory leak (Issue #4012).<br/>
              • Collaborated with 3 core maintainers over a 2-month period.
            </p>
          </div>
        </div>
      )
    }
  },
  {
    id: "interview-tips",
    title: "Interview Tips",
    category: "Career Support",
    icon: ShieldAlert,
    description: "Nail behavioral screening and technical walkthrough interviews for premium fellowships.",
    keyPoints: [
      "Prepare to walk through code you have previously written.",
      "Admit when you don't know something, but explain how you would find out.",
      "Ask the interviewers thoughtful questions about the community."
    ],
    realLifeExample: {
      title: "Handling the 'Code Walkthrough' Question",
      content: (
        <div className="space-y-4 text-sm text-secondary p-4 bg-surface-raised rounded-xl border border-hairline">
          <p><strong>Interviewer:</strong> &ldquo;In this PR you submitted, why did you choose to use a Hash Map instead of an Array to store the connected users?&rdquo;</p>
          <div className="pl-4 border-l-2 border-accent mt-2">
            <strong className="text-primary">Excellent Response:</strong>
            <p className="mt-1 italic">&ldquo;I initially considered an Array, but realized that checking if a user is online requires an `O(n)` lookup. Since this websocket server handles thousands of concurrent connections, I switched to a Hash Map using the User ID as the key, which reduces the lookup time to `O(1)`. It uses slightly more memory, but the performance trade-off for a real-time system is worth it.&rdquo;</p>
          </div>
          <div className="mt-2 p-2 bg-success/10 border border-success/20 rounded text-success text-[11px] font-sans">
            <strong>Why this worked:</strong> It demonstrates knowledge of Big O notation and explains the architectural trade-offs behind the code.
          </div>
        </div>
      )
    }
  }
];

function ResourceCard({ guide }: { guide: ResourceGuide }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = guide.icon;

  return (
    <div className={`flex flex-col bg-surface border rounded-2xl overflow-hidden transition-all duration-300 ${expanded ? 'border-accent shadow-md' : 'border-hairline shadow-sm hover:border-tertiary'}`}>
      <div 
        className="p-6 cursor-pointer select-none flex-1"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${guide.isHighlight ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface-raised text-primary'}`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary leading-tight">{guide.title}</h3>
              <span className="text-[10px] uppercase tracking-wider text-tertiary font-bold">{guide.category}</span>
            </div>
          </div>
          <button className="p-1 rounded-full hover:bg-surface-raised text-tertiary transition-colors">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        <p className="text-sm text-secondary leading-relaxed mb-6">
          {guide.description}
        </p>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Key Takeaways</h4>
          <ul className="space-y-1.5">
            {guide.keyPoints.map((point, idx) => (
              <li key={idx} className="text-xs text-secondary flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Real-Life Example Dropdown */}
      <div className={`border-t transition-all duration-300 ease-in-out ${expanded ? 'border-hairline bg-surface/50 opacity-100 max-h-[1000px]' : 'border-transparent bg-surface opacity-0 max-h-0 hidden'}`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-brass" />
            <h4 className="font-bold text-primary">{guide.realLifeExample.title}</h4>
          </div>
          {guide.realLifeExample.content}
        </div>
      </div>
    </div>
  );
}

export function ResourcesClient() {
  const highlights = RESOURCES.filter(r => r.isHighlight);
  const others = RESOURCES.filter(r => !r.isHighlight);

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-16 py-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold text-primary tracking-tight">
          Contributor Resources
        </h1>
        <p className="text-lg text-secondary leading-relaxed">
          Level up your open-source journey. Explore our curated guides packed with <strong className="text-primary">real-life examples</strong> from successful past contributors.
        </p>
      </div>

      {/* Resources to level up */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1.5 bg-accent rounded-full" />
          <h2 className="text-2xl font-bold text-primary">Resources to level up</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map(guide => (
            <ResourceCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      {/* All Resources */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1.5 bg-tertiary rounded-full" />
          <h2 className="text-2xl font-bold text-primary">All resources</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {others.map(guide => (
            <ResourceCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

    </div>
  );
}
