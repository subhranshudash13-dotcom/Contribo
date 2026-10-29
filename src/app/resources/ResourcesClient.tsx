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
  Zap,
  GitFork,
  MessageSquareQuote,
  GitPullRequest,
  GitMerge,
  Globe,
  Bug,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { OpenSourceGlossary } from './components/OpenSourceGlossary';
import { ContributorToolkit } from './components/ContributorToolkit';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface ResourceGuide {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  difficulty: Difficulty;
  readTime: string;
  keyPoints: string[];
  realLifeExample: {
    title: string;
    content: React.ReactNode;
  };
  isHighlight?: boolean;
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: 'text-success bg-success/10 border-success/20',
  Intermediate: 'text-accent bg-accent/10 border-accent/20',
  Advanced: 'text-error bg-error/10 border-error/20',
};

function DiffBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-hairline bg-surface-raised p-4 font-mono text-xs leading-relaxed">
      {code.split('\n').map((line, i) => (
        <div
          key={i}
          className={
            line.startsWith('+') ? 'text-success' : line.startsWith('-') ? 'text-error' : 'text-secondary'
          }
        >
          {line || ' '}
        </div>
      ))}
    </pre>
  );
}

const RESOURCES: ResourceGuide[] = [
  {
    id: "proposal-writing",
    title: "How to write proposals",
    category: "Mentorship Application",
    difficulty: "Intermediate",
    readTime: "5 min read",
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
    difficulty: "Beginner",
    readTime: "3 min read",
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
    difficulty: "Intermediate",
    readTime: "4 min read",
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
    difficulty: "Beginner",
    readTime: "4 min read",
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
    difficulty: "Beginner",
    readTime: "3 min read",
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
    difficulty: "Advanced",
    readTime: "5 min read",
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
  },
    {
    id: "what-is-open-source",
    title: "What is Open Source & Why Does It Matter?",
    category: "Foundations",
    difficulty: "Beginner",
    readTime: "4 min read",
    icon: Globe,
    isHighlight: true,
    description: "Understand the difference between building solo tutorial clones and collaborating on real production software used by thousands of people.",
    keyPoints: [
      "Open source means the code is public, so anyone can read it, use it, and propose improvements.",
      "Real projects have users, tests, CI, and maintainers, so your code must hold up outside your laptop.",
      "Every merged contribution is public proof of your skills that you can link on a resume."
    ],
    realLifeExample: {
      title: "Real Scenario: Tutorial Clone vs. Real Contribution",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
            <h4 className="text-error text-xs font-bold uppercase tracking-wider mb-2">Solo Tutorial Clone</h4>
            <p className="text-sm text-secondary">
              You follow a video and build a todo app.<br/>
              • No one reviews your code.<br/>
              • Nothing breaks, because nobody uses it.<br/>
              • You never learn why decisions were made.
            </p>
          </div>
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <h4 className="text-success text-xs font-bold uppercase tracking-wider mb-2">Real Collaboration</h4>
            <p className="text-sm text-secondary">
              You fix a bug in a repo used by thousands.<br/>
              • A maintainer questions your approach.<br/>
              • CI runs tests on every change you push.<br/>
              • You learn code style, communication, and shipping.
            </p>
          </div>
        </div>
      )
    }
  },
  {
    id: "demystifying-pull-requests",
    title: "Demystifying Pull Requests",
    category: "Collaboration",
    difficulty: "Beginner",
    readTime: "5 min read",
    icon: GitPullRequest,
    isHighlight: true,
    description: "Learn why it is called a pull request and how every PR adds real engineering and business value to a project.",
    keyPoints: [
      "You are asking the maintainer to pull your changes into their repository, which is why it is a pull request.",
      "Review catches bugs before users see them, and CI proves the change works.",
      "A PR leaves a permanent record of what changed and why, which helps future developers."
    ],
    realLifeExample: {
      title: "Real Scenario: A Small PR with Real Value",
      content: (
        <div className="space-y-4 text-sm text-secondary">
          <p>This tiny change stops the app from showing &ldquo;Invalid Date&rdquo; to users:</p>
          <DiffBlock
            code={`@@ -1,3 +1,5 @@
 export function formatDate(input: string) {
-  return new Date(input).toLocaleDateString();
+  const date = new Date(input);
+  if (Number.isNaN(date.getTime())) return 'Unknown date';
+  return date.toLocaleDateString();
 }`}
          />
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-[11px]">
            <strong>Engineering value:</strong> a bug is fixed and a reviewer double-checked it.<br/>
            <strong>Business value:</strong> fewer broken pages, fewer support complaints, happier users.
          </div>
        </div>
      )
    }
  },
  {
    id: "issues-and-bug-reports",
    title: "Mastering Issues & Bug Reports",
    category: "Collaboration",
    difficulty: "Beginner",
    readTime: "4 min read",
    icon: Bug,
    description: "Most project momentum starts in the issue tracker, before any code is written. Learn to write issues that get fixed.",
    keyPoints: [
      "Search existing issues first so you do not file a duplicate.",
      "Give steps to reproduce, expected result, actual result, and your environment.",
      "A clear issue lets maintainers decide, assign, and plan work without a back-and-forth."
    ],
    realLifeExample: {
      title: "Real Scenario: Bad vs. Good Bug Report",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
            <h4 className="text-error text-xs font-bold uppercase tracking-wider mb-2">Bad Report</h4>
            <p className="text-sm text-secondary">
              <strong>Title:</strong> Login broken<br/>
              <strong>Body:</strong> It does not work. Please fix.
            </p>
          </div>
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <h4 className="text-success text-xs font-bold uppercase tracking-wider mb-2">Good Report</h4>
            <div className="text-xs text-secondary font-mono whitespace-pre-wrap">
              {`Title: Login returns 500 when email contains "+"

Steps:
1. Open /login
2. Enter a+test@mail.com
3. Click Sign in

Expected: user is logged in
Actual: 500 error
Env: Chrome 130, Windows 11`}
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: "code-review-etiquette",
    title: "Code Review Etiquette",
    category: "Collaboration",
    difficulty: "Intermediate",
    readTime: "5 min read",
    icon: MessageSquareQuote,
    description: "Learn how to read maintainer feedback and survive a Request Changes review without taking it personally.",
    keyPoints: [
      "Request Changes is a normal step in review, not a rejection of you.",
      "Reply to every comment, even if it is only a short confirmation after the fix.",
      "Ask a clarifying question if feedback is unclear, and push fixes as new commits."
    ],
    realLifeExample: {
      title: "Real Scenario: Responding to Request Changes",
      content: (
        <div className="space-y-4 text-sm text-secondary p-4 bg-surface-raised rounded-xl border border-hairline">
          <p><strong>Maintainer:</strong> &ldquo;This fetches users inside a loop, which makes one request per user. Could we batch it? Please also add a test.&rdquo;</p>
          <div className="pl-4 border-l-2 border-error">
            <strong className="text-error">Weak reply:</strong>
            <p className="mt-1 italic">&ldquo;It works on my machine.&rdquo;</p>
          </div>
          <div className="pl-4 border-l-2 border-accent">
            <strong className="text-primary">Strong reply:</strong>
            <p className="mt-1 italic">&ldquo;Good catch, thanks! I batched the calls and added a test. Please let me know if the naming works.&rdquo;</p>
          </div>
          <DiffBlock
            code={`-  for (const id of ids) {
-    users.push(await getUser(id));
-  }
+  const users = await getUsersByIds(ids);`}
          />
        </div>
      )
    }
  },
  {
    id: "security-and-licensing",
    title: "Security Hygiene & Licensing",
    category: "Best Practices",
    difficulty: "Intermediate",
    readTime: "6 min read",
    icon: ShieldCheck,
    description: "Know the difference between permissive and copyleft licenses, and keep secrets like .env credentials out of your commits.",
    keyPoints: [
      "MIT is permissive: reuse is easy, and you keep the copyright notice.",
      "GPL is copyleft: distributed derivative work must stay open under the same license.",
      "Never commit .env files. If a secret leaks, rotate it immediately, because deleting the file is not enough."
    ],
    realLifeExample: {
      title: "Real Scenario: Keeping Secrets Out of Git",
      content: (
        <div className="space-y-4 text-sm text-secondary">
          <p>Ignore real secrets and commit only a safe template:</p>
          <DiffBlock
            code={`# .gitignore
+.env
+.env.local
 node_modules/

# .env.example (safe to commit)
+DATABASE_URL=
+JWT_SECRET=`}
          />
          <p>If you already committed a secret: rotate the key first, then run <code className="font-mono text-xs">git rm --cached .env</code> and push a new commit.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-surface-raised border border-hairline rounded-lg">
              <strong className="text-primary block mb-1">MIT (permissive)</strong>
              Use, modify, and redistribute freely, even in closed-source products.
            </div>
            <div className="p-3 bg-surface-raised border border-hairline rounded-lg">
              <strong className="text-primary block mb-1">GPL (copyleft)</strong>
              Distributed modifications must also be released as GPL with source code.
            </div>
          </div>
        </div>
      )
    }
  }
];

interface LifecycleStep {
  step: string;
  title: string;
  description: string;
  tags: string[];
  icon: React.ElementType;
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    step: '01',
    title: 'Lurk & Explore',
    description: 'Inspecting commit velocity, reviewing recent PR activity, and reading CONTRIBUTING.md to understand the workflow and community expectations.',
    tags: ['Commit Velocity', 'CONTRIBUTING.md', 'Issue Triage'],
    icon: Compass,
  },
  {
    step: '02',
    title: 'Fork & Setup',
    description: 'Forking repo, setting upstream remote, installing dependencies, and running test suites locally to ensure a stable baseline.',
    tags: ['Fork Repo', 'git remote add upstream', 'Local Setup'],
    icon: GitFork,
  },
  {
    step: '03',
    title: 'Reproduce & Discuss',
    description: 'Confirming the bug or proposing approach on the issue discussion before writing code. Wait for official assignment before starting.',
    tags: ['Reproduce Bug', 'Discuss Approach', 'Wait for Assignment'],
    icon: MessageSquareQuote,
  },
  {
    step: '04',
    title: 'Branch & Implement',
    description: 'Creating a feature branch from main and writing atomic code with tests, adhering strictly to codebase conventions and standards.',
    tags: ['Feature Branch', 'Atomic Commits', 'Type Safety'],
    icon: GitBranch,
  },
  {
    step: '05',
    title: 'Open PR & Pass CI',
    description: 'Submitting structured description referencing the issue, providing reproduction proof, and watching CI turns green.',
    tags: ['Structured PR', 'Fixes #issue', 'Pass CI'],
    icon: GitPullRequest,
  },
  {
    step: '06',
    title: 'Review & Merge',
    description: 'Iterating constructively on maintainer review feedback, rebasing or squashing commits, and celebrating the merged milestone.',
    tags: ['Address Feedback', 'Rebase / Squash', 'Merged Milestone 🎉'],
    icon: GitMerge,
  },
];

function ResourceCard({ guide }: { guide: ResourceGuide }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = guide.icon;
  const panelId = `scenario-${guide.id}`;

  return (
    <div className={`flex flex-col bg-surface border rounded-2xl overflow-hidden transition-all duration-300 motion-reduce:transition-none ${expanded ? 'border-accent shadow-md' : 'border-hairline shadow-sm hover:border-tertiary'}`}>
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
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={expanded ? `Hide scenario for ${guide.title}` : `Show scenario for ${guide.title}`}
            className="p-1 rounded-full hover:bg-surface-raised text-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Difficulty + read time */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${DIFFICULTY_STYLES[guide.difficulty]}`}>
            {guide.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-tertiary bg-surface-raised border border-hairline/60 px-2 py-1 rounded-md">
            <Clock size={12} aria-hidden="true" />
            {guide.readTime}
          </span>
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

      {/* Real-world scenario (smooth expand/collapse) */}
      <div
        id={panelId}
        role="region"
        aria-hidden={!expanded}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className={`border-t ${expanded ? 'border-hairline bg-surface/50' : 'border-transparent'}`}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-brass" />
                <h4 className="font-bold text-primary">{guide.realLifeExample.title}</h4>
              </div>
              {guide.realLifeExample.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sections on this page that can be jumped to. Add an entry here (and an
// id on the section) when a new section such as the PR Lab, lifecycle,
// toolkit or glossary lands, so no pill ever points at a missing section.
const QUICK_LINKS = [
  { id: 'lifecycle', label: 'Lifecycle' },
  { id: 'guides', label: 'Guides' },
  { id: 'all-resources', label: 'All resources' },
  { id: 'toolkit', label: 'Action Toolkit' },
  { id: 'glossary', label: 'Glossary' },
];

function QuickJump() {
  const jump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav
      aria-label="Jump to a section"
      className="sticky top-20 z-30 mx-auto w-fit max-w-full rounded-full border border-hairline bg-surface/85 p-1.5 shadow-sm backdrop-blur-md"
    >
      <ul className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {QUICK_LINKS.map(l => (
          <li key={l.id} className="shrink-0">
            <a
              href={`#${l.id}`}
              onClick={e => jump(e, l.id)}
              className="block rounded-full px-4 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-surface-raised hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
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

      {/* Contributor Lifecycle */}
      <section id="lifecycle" className="scroll-mt-40">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1.5 bg-accent rounded-full" />
              <h2 className="text-2xl font-bold text-primary">Contributor Lifecycle</h2>
            </div>
            <p className="text-sm text-secondary max-w-2xl">
              The 6-step path every open-source contributor takes from zero to a merged PR.
            </p>
          </div>
          <span className="text-xs font-mono text-tertiary uppercase tracking-wider self-start sm:self-end">
            Roadmap · 6 Steps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LIFECYCLE_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="group relative flex flex-col bg-surface border border-hairline rounded-2xl p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Header: Step Number Pill & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md">
                    STEP {step.step}
                  </span>
                  <div className="p-2.5 rounded-xl bg-surface-raised border border-hairline text-primary group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                    <Icon size={20} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-secondary leading-relaxed mb-4 flex-1">
                  {step.description}
                </p>

                {/* Action Tags */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-hairline/60 mt-auto">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-tertiary bg-surface-raised px-2 py-0.5 rounded border border-hairline/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <QuickJump />

      {/* Resources to level up */}
      <section id="guides" className="scroll-mt-40">
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
      <section id="all-resources" className="scroll-mt-40">
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

      <section id="toolkit" className="scroll-mt-40">
        <ContributorToolkit />
      </section>

      <OpenSourceGlossary />

    </div>
  );
}
