'use client';

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  GitBranch, 
  Terminal, 
  Compass, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Copy, 
  AlertTriangle, 
  ArrowRight, 
  Lightbulb, 
  Clock, 
  CheckSquare, 
  X,
  RefreshCw,
  Info,
  Eye,
  Edit3,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Detailed guide sections mapping to the old hash routes for backwards compatibility
interface DetailedGuide {
  id: string;
  title: string;
  category: string;
  icon: any;
  content: React.ReactNode;
}

const DETAILED_GUIDES: Record<string, DetailedGuide> = {
  "proposal-writing": {
    id: "proposal-writing",
    title: "How to Write a Winning Proposal",
    category: "Mentorship Application",
    icon: BookOpen,
    content: (
      <div className="space-y-6 text-primary">
        <p className="text-sm sm:text-base leading-relaxed text-secondary">
          A proposal is your primary application document for programs like GSoC, Outreachy, and Summer of Bitcoin. It details what project you plan to implement, how you intend to do it, and your timeline.
        </p>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-primary">Core Proposal Structure:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border border-hairline bg-surface-raised">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brass mb-2">1. Technical Specification</h4>
              <p className="text-xs text-secondary leading-relaxed">Describe the architecture, dependencies, libraries, and design choices. Explain exactly HOW the code will be written.</p>
            </div>
            <div className="p-4 rounded border border-hairline bg-surface-raised">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brass mb-2">2. Detailed Timeline</h4>
              <p className="text-xs text-secondary leading-relaxed">Break down the 12 weeks of coding into weekly milestones. Include buffer time for testing, documentation, and reviews.</p>
            </div>
            <div className="p-4 rounded border border-hairline bg-surface-raised">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brass mb-2">3. Contributions & PRs</h4>
              <p className="text-xs text-secondary leading-relaxed">List all contributions you have already made to the repository. This proves you can work with their codebase.</p>
            </div>
            <div className="p-4 rounded border border-hairline bg-surface-raised">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brass mb-2">4. About Me & Bio</h4>
              <p className="text-xs text-secondary leading-relaxed">Highlight your background, university projects, work experience, and explain why you are passionate about this community.</p>
            </div>
          </div>
        </div>
        <div className="bg-brass/10 border border-brass/20 p-4 rounded">
          <h4 className="font-bold text-xs sm:text-sm text-brass mb-2 flex items-center gap-1.5">
            <Sparkles size={16} /> Pro Tip from Mentors
          </h4>
          <p className="text-xs sm:text-sm text-primary leading-relaxed font-medium">
            Never submit a PDF draft proposal on the final day without requesting feedback first. Get your draft in front of the mentors at least two weeks early to receive comments and refine your technical details.
          </p>
        </div>
      </div>
    )
  },
  "git-guide": {
    id: "git-guide",
    title: "Git Collaboration Guide",
    category: "Version Control",
    icon: GitBranch,
    content: (
      <div className="space-y-6 text-primary">
        <p className="text-sm sm:text-base leading-relaxed text-secondary">
          Git is a distributed version control system. Every developer contributing to open source must know basic Git terminal commands.
        </p>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-primary">Essential Git Cheat Sheet:</h3>
          <div className="border border-hairline rounded overflow-hidden bg-surface">
            <div className="grid grid-cols-12 bg-surface-raised font-mono text-[10px] sm:text-xs text-muted uppercase tracking-wider border-b border-hairline py-2.5 px-4 font-bold">
              <span className="col-span-5">Command</span>
              <span className="col-span-7">Description</span>
            </div>
            <div className="divide-y divide-hairline font-mono text-xs sm:text-sm">
              <div className="grid grid-cols-12 py-3 px-4 hover:bg-surface-raised/50">
                <code className="col-span-5 text-brass font-bold break-all">git clone &lt;url&gt;</code>
                <span className="col-span-7 text-secondary">Download a repository to your local system.</span>
              </div>
              <div className="grid grid-cols-12 py-3 px-4 hover:bg-surface-raised/50">
                <code className="col-span-5 text-brass font-bold break-all">git checkout -b &lt;branch&gt;</code>
                <span className="col-span-7 text-secondary">Create a new local branch and switch to it.</span>
              </div>
              <div className="grid grid-cols-12 py-3 px-4 hover:bg-surface-raised/50">
                <code className="col-span-5 text-brass font-bold break-all">git status</code>
                <span className="col-span-7 text-secondary">Check which files have modified unstaged changes.</span>
              </div>
              <div className="grid grid-cols-12 py-3 px-4 hover:bg-surface-raised/50">
                <code className="col-span-5 text-brass font-bold break-all">git add &lt;file&gt;</code>
                <span className="col-span-7 text-secondary">Stage file changes for committing.</span>
              </div>
              <div className="grid grid-cols-12 py-3 px-4 hover:bg-surface-raised/50">
                <code className="col-span-5 text-brass font-bold break-all">git commit -m &quot;msg&quot;</code>
                <span className="col-span-7 text-secondary">Save staged changes as a local commit snapshot.</span>
              </div>
              <div className="grid grid-cols-12 py-3 px-4 hover:bg-surface-raised/50">
                <code className="col-span-5 text-brass font-bold break-all">git push origin &lt;branch&gt;</code>
                <span className="col-span-7 text-secondary">Upload local branch commits to your fork on GitHub.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "github-guide": {
    id: "github-guide",
    title: "GitHub Workflow Guide",
    category: "Developer Platform",
    icon: Terminal,
    content: (
      <div className="space-y-6 text-primary">
        <p className="text-sm sm:text-base leading-relaxed text-secondary">
          GitHub provides cloud hosting for Git repositories. Most open-source projects use GitHub for managing discussions, issues, review cycles, and project releases.
        </p>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-primary">Forking & Pulling Workflow:</h3>
          <ol className="space-y-4 font-sans text-sm sm:text-base">
            <li className="flex gap-3">
              <span className="font-mono text-xs font-bold text-brass w-6 h-6 rounded bg-surface-raised border border-hairline flex items-center justify-center shrink-0">1</span>
              <span className="text-secondary">Click the <strong>Fork</strong> button on the top-right of the target repository to create a copy under your account.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs font-bold text-brass w-6 h-6 rounded bg-surface-raised border border-hairline flex items-center justify-center shrink-0">2</span>
              <span className="text-secondary">Clone your fork locally: <code className="font-mono text-xs bg-surface-raised px-1.5 py-0.5 border border-hairline rounded text-brass break-all">git clone https://github.com/YOUR_USER/repo.git</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs font-bold text-brass w-6 h-6 rounded bg-surface-raised border border-hairline flex items-center justify-center shrink-0">3</span>
              <span className="text-secondary">Configure the upstream remote pointing to the main project: <code className="font-mono text-xs bg-surface-raised px-1.5 py-0.5 border border-hairline rounded text-brass break-all">git remote add upstream https://github.com/ORIGINAL_ORG/repo.git</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs font-bold text-brass w-6 h-6 rounded bg-surface-raised border border-hairline flex items-center justify-center shrink-0">4</span>
              <span className="text-secondary">Sync code before coding: <code className="font-mono text-xs bg-surface-raised px-1.5 py-0.5 border border-hairline rounded text-brass break-all">git pull upstream main</code>.</span>
            </li>
          </ol>
        </div>
      </div>
    )
  },
  "finding-first-issues": {
    id: "finding-first-issues",
    title: "Finding Good First Issues",
    category: "Discovery",
    icon: Compass,
    content: (
      <div className="space-y-6 text-primary">
        <p className="text-sm sm:text-base leading-relaxed text-secondary">
          Finding where to start contributing can be intimidating. Maintainers label issues suited for newcomers as &ldquo;good first issue&rdquo; or &ldquo;beginner friendly&rdquo;.
        </p>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-primary">How to locate beginner issues:</h3>
          <ul className="space-y-4 font-sans text-sm sm:text-base">
            <li className="flex gap-2 items-start">
              <span className="text-brass font-bold">1.</span>
              <span className="text-secondary">
                <strong>Search GitHub Issues Globals:</strong> Go to github.com/issues and search: 
                <code className="block mt-1 font-mono text-xs bg-surface-raised px-2 py-1 border border-hairline rounded text-brass break-all">
                  is:open is:issue label:&quot;good first issue&quot; language:javascript
                </code>
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-brass font-bold">2.</span>
              <span className="text-secondary">
                <strong>Explore Community Forums:</strong> Many groups have a &ldquo;Contributions&rdquo; channel on Discord or Slack specifically listing tasks for new developers.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-brass font-bold">3.</span>
              <span className="text-secondary">
                <strong>Try Contribo Project Search:</strong> Navigate to our 
                <a href="/projects" className="text-brass hover:underline font-bold ml-1 inline-flex items-center gap-0.5">
                  Projects Page <ArrowRight size={12} />
                </a> 
                and filter by &ldquo;Beginner Friendly&rdquo; difficulty.
              </span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  "resume-tips": {
    id: "resume-tips",
    title: "GitHub & Open Source Resume Optimization",
    category: "Career Support",
    icon: Award,
    content: (
      <div className="space-y-6 text-primary">
        <p className="text-sm sm:text-base leading-relaxed text-secondary">
          Applying to MLH Fellowships or Outreachy internships requires submitting a resume. Highlighting open-source work sets you apart from candidates with only academic projects.
        </p>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-primary">Optimization Checklist:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="border border-hairline p-4 rounded bg-surface-raised">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brass mb-2">Do:</h4>
              <ul className="space-y-2 text-xs text-secondary">
                <li>• Link your GitHub profile clearly at the top.</li>
                <li>• Quantify contribution size (e.g. &quot;merged 15 PRs into React Core&quot;).</li>
                <li>• Highlight community engagement and mentor reviews.</li>
              </ul>
            </div>
            <div className="border border-hairline p-4 rounded bg-surface-raised">
              <h4 className="font-bold text-xs uppercase tracking-wider text-error mb-2">Don&apos;t:</h4>
              <ul className="space-y-2 text-xs text-secondary">
                <li>• Hide your GitHub link or list stale portfolio projects.</li>
                <li>• Only mention academic course marks.</li>
                <li>• List tech skills you can&apos;t talk about in detail.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "interview-tips": {
    id: "interview-tips",
    title: "Tackling Technical & Behavioral Reviews",
    category: "Career Support",
    icon: ShieldAlert,
    content: (
      <div className="space-y-6 text-primary">
        <p className="text-sm sm:text-base leading-relaxed text-secondary">
          Fellowships (like MLH) conduct interviews. These focus on reviewing your code submissions rather than traditional dry whiteboard LeetCode challenges.
        </p>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-primary">Review Stages & Preparation:</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-surface-raised rounded border border-hairline text-secondary">
              <strong className="text-brass block mb-1">1. Behavior Screening (10-15 mins):</strong> 
              Be ready to explain why you want to contribute, how you handle blocker items, and your weekly availability.
            </div>
            <div className="p-3 bg-surface-raised rounded border border-hairline text-secondary">
              <strong className="text-brass block mb-1">2. Code Walkthrough (15-20 mins):</strong> 
              You will present a code sample you wrote. You must be able to explain the algorithm, runtime complexity, edge cases, and design trade-offs.
            </div>
          </div>
        </div>
      </div>
    )
  }
};

// Rich, real-world data presets for proposal sections
interface ProgramContentPreset {
  techSpec: string;
  contributions: string;
  timeline: string;
  bio: string;
  instructions: {
    techSpec: string;
    contributions: string;
    timeline: string;
    bio: string;
  };
}

const PROGRAM_PRESETS: Record<'GSoC' | 'Outreachy' | 'LFX', ProgramContentPreset> = {
  GSoC: {
    instructions: {
      techSpec: "Describe the system architecture, file/directory breakdown, database structures (e.g., MongoDB schemas, tables), APIs, third-party libraries, and design choices. Explain exactly HOW your code fits into the codebase.",
      contributions: "List merged commits, open PRs, bug reports, and discussion threads in the target repository. This proves your familiarity with the build system and project code styling.",
      timeline: "Divide the 12-week coding phase into week-by-week milestones. Specify deliverables, test coverage blocks, documentation intervals, and mid-term/final evaluation prep windows.",
      bio: "Highlight your academic background, relevant project portfolios, timezone alignment, weekly availability (e.g., 30-40 hours), and explanation of your passion for the project."
    },
    techSpec: `### Architecture and Class Mappings
We will extend the Contribo match engine in \`src/app/matcher/route.ts\` to process skill filters asynchronously. 

1. **Schema Updates** (\`src/types/database.d.ts\`):
   Add a \`relevanceScore\` field and query index to the \`Project\` schema to speed up custom searching.
2. **API Endpoint**:
   Create \`GET /api/projects/search\` utilizing MongoDB text search capabilities.
3. **Libraries Used**:
   - \`framer-motion\` for transition grids
   - \`lucide-react\` for semantic visual states`,
    
    contributions: `- **PR #112**: Fixed text contrast issue on the landing page footer. (Merged)
- **PR #120**: Added \`ProgramBadge\` UI element mapping styles for Outreachy. (Open - Under Review)
- **Issue #98**: Debugged memory leaks in user profile analytics counter. (Assigned)`,
    
    timeline: `* **Weeks 1-2**: Establish connection endpoints, database indexes, and compile unit tests.
* **Weeks 3-4**: Build backend API routers and skill scoring coefficients logic.
* **Weeks 5-6**: Code frontend results grid and bento layouts. Integrate theme variables.
* **Week 7 (Midterm)**: Polish code, clean typescript lints, prep demonstration sandbox.
* **Weeks 8-9**: Develop error banners and testing fallback states.
* **Weeks 10-11**: Write system specs, usage docs, and integration tests.
* **Week 12**: Complete final code check, squash commits, and submit.`,
    
    bio: `I am a Junior CS Student at Tech University with 2 years of React and Node.js experience. 
* **GitHub**: github.com/johndoe
* **Availability**: 35 hours/week, responsive in UTC-4 timezone.
* **Passion**: Contribo solves the hardest part of open source—finding where to start. I want to build features that I personally would use daily.`
  },
  Outreachy: {
    instructions: {
      techSpec: "Focus on user-centric features, accessibility (WCAG AA standards, alt texts, screen-reader compatibility), UI design tokens, responsive layouts, and simple setup integrations.",
      contributions: "Summarize contribution phase achievements, community forum posts (on Zulip, Slack, mailing lists), documentation additions, and feedback loops with other applicants.",
      timeline: "Provide bi-weekly milestones mapping coding deliverables, weekly coordinator updates, required Outreachy blog posts (3-4 posts), and testing cycles.",
      bio: "Focus on your personal path into tech, experience overcoming barriers, timezone and availability details, and commitment to learning in public."
    },
    techSpec: `### User Interface Accessibility & Usability Plan
We will implement key accessibility improvements for the program dashboard.

1. **A11y Enhancements**:
   - Ensure all icons have explicit \`aria-label\` descriptors.
   - Maintain a minimum \`44px x 44px\` touch target for filters.
2. **Responsive Layouts**:
   - Use dynamic grid reflows (\`grid-cols-1 md:grid-cols-3\`) to avoid overflow horizontal scrolling.
3. **Semantic HTML**:
   - Restructure search blocks using standard \`<form>\` and \`<fieldset>\` tags.`,
    
    contributions: `- **Phase Task #1**: Translated and refactored the installation guide in \`docs/INSTALL.md\`.
- **Phase Task #2**: Fixed keyboard focus ring navigation on search input bars. (Merged)
- **Discussion**: Participated in Zulip channels to help newcomers set up their node environments.`,
    
    timeline: `* **Weeks 1-2 (Milestone 1)**: Set up the translation pipeline and verify keyboard tab routes. Write Blog Post #1.
* **Weeks 3-4 (Milestone 2)**: Design the accessible filters overlay panel. Fix touch target insets.
* **Weeks 5-6 (Milestone 3)**: Hook panel to live API values. Implement search debounce. Write Blog Post #2.
* **Weeks 7-8 (Milestone 4)**: Audit contrast states for dark mode. Solve accessibility warnings.
* **Weeks 9-10 (Milestone 5)**: Write browser end-to-end tests for search flows. Write Blog Post #3.
* **Weeks 11-12 (Milestone 6)**: Final documentation cleanup, merge code, and publish the final blog report.`,
    
    bio: `I am a self-taught frontend developer specializing in accessible UI design.
* **Availability**: 40 hours/week, working in UTC+1 timezone.
* **Goal**: I applied to Outreachy to contribute to meaningful community tools. I believe accessible software is a fundamental right, and I want to help Contribo achieve that standards.`
  },
  LFX: {
    instructions: {
      techSpec: "Outline system-level configurations, automation pipelines, CI/CD routines, test suites, API contracts, benchmarking, and security scanning setups.",
      contributions: "List systems commits, kernel/module patches, scripts, configuration fixes, or documentation specifications made in the target Linux Foundation codebase.",
      timeline: "Structure weekly deliverables focused on testing metrics, benchmarks, validation testing, code reviews, and integration milestones.",
      bio: "Highlight systems engineering skills, knowledge of infrastructure tools (Docker, Kubernetes, GitHub Actions), certifications, and professional goals."
    },
    techSpec: `### Infrastructure & Integration Specification
We will set up automated benchmarking checks inside the repository workflow.

1. **GitHub Actions Workflow**:
   Create \`workflows/benchmark.yml\` running on every push to main to detect performance degradation.
2. **Performance Criteria**:
   - Server-side response time below \`150ms\` under 100 concurrent requests.
3. **Data Integrity**:
   - Lock API routes using validation hooks in \`src/app/api/programs/route.ts\`.`,
    
    contributions: `- **PR #87**: Refactored the GitHub Actions build caching, reducing CI runtime by 4 minutes. (Merged)
- **PR #91**: Wrote shell scripts to bootstrap local mock databases. (Merged)
- **Issue #115**: Fixed typescript compiling warnings in build environment.`,
    
    timeline: `* **Weeks 1-2**: Audit response latency. Create test runner container scripts.
* **Weeks 3-4**: Establish the benchmarking workflow in CI. Build validation rules.
* **Weeks 5-6**: Create database index migrations to resolve lookup bottlenecks.
* **Weeks 7-8**: Write automated load tests using mock requests. Solve leaks.
* **Weeks 9-10**: Develop admin console visualization views for performance scores.
* **Weeks 11-12**: Document benchmark parameters, verify TypeScript build, and compile release bundle.`,
    
    bio: `I am an aspiring DevOps Engineer with experience building CI pipelines and managing databases.
* **Availability**: 35 hours/week, responsive in UTC+5:30.
* **Background**: AWS Certified Cloud Practitioner. Passionate about systems performance and automation.`
  }
};

// Preset milestone planner timelines for Section 3
const TIMELINE_PRESETS = {
  standard: `* **Weeks 1-2**: Environment configuration, initial code scaffold, and unit test setup.
* **Weeks 3-4**: Core API route construction, database model schemas, and backend logic.
* **Weeks 5-6**: Frontend component layouts, theme variables integration, and state hooks.
* **Week 7 (Midterm)**: Integration code cleanup, linter audits, and midterm sandbox check.
* **Weeks 8-9**: Error handling, fallback loaders, and user feedback forms.
* **Weeks 10-11**: E2E browser tests, performance optimization, and user manual documentation.
* **Week 12**: Final code merge, commit squashing, and official release tag submission.`,

  uiHeavy: `* **Weeks 1-2**: Establish Figma design system tokens, Tailwind setup, and base typography scale.
* **Weeks 3-4**: Create reusable layout skeletons, buttons, forms, and custom modal wrappers.
* **Weeks 5-6**: Code complex visual layouts (Bento grids, charts, responsive menus) and micro-animations.
* **Week 7 (Midterm)**: Contrast audits for light/dark modes, keyboard navigation, and tab-focus tests.
* **Weeks 8-9**: Hook state selectors to Mock APIs and design loading skeletons and animations.
* **Weeks 10-11**: Browser cross-compatibility testing (mobile, safari, landscape) and style sheets polish.
* **Week 12**: Final visual reviews with mentors, resolve minor offsets, and submit front-end packages.`,

  apiHeavy: `* **Weeks 1-2**: Document API routes specifications, validation models, and configure Postgres/Mongo Docker container.
* **Weeks 3-4**: Code REST/GraphQL schemas, write CRUD logic, and set up database migrations.
* **Weeks 5-6**: Implement authentication, security headers, rate limiting, and caching layers (Redis).
* **Week 7 (Midterm)**: Perform integration tests, mock requests coverage check, and resolve memory leaks.
* **Weeks 8-9**: Configure background worker queues (bullmq/celery) and email dispatch systems.
* **Weeks 10-11**: Load-testing (k6), log reporting tools setup, and API documentation (Swagger/OpenAPI).
* **Week 12**: Final security validation, CI/CD pipeline setup, deploy to staging, and release.`
};

// Resource icons mappings
const RESOURCE_ICONS: Record<string, any> = {
  "proposal-template": BookOpen,
  "readiness-checklist": CheckSquare,
  "timeline-planner": Clock,
  "mentor-outreach-guide": Compass,
  "pr-starter-guide": GitBranch
};

export default function ResourcesPage() {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [activeJourneyStage, setActiveJourneyStage] = useState('All');

  // Journey tracker stage filters
  const JOURNEY_STAGES = [
    { id: 'discover', title: 'Discover', desc: 'Find programs & issues', icon: Compass, color: 'text-brass border-brass' },
    { id: 'learn', title: 'Learn', desc: 'Master Git & workflows', icon: Terminal, color: 'text-blue-500 border-blue-500' },
    { id: 'draft', title: 'Draft', desc: 'Write specifications', icon: BookOpen, color: 'text-accent border-accent' },
    { id: 'review', title: 'Review', desc: 'Verify & polish files', icon: ShieldAlert, color: 'text-yellow-500 border-yellow-500' },
    { id: 'submit', title: 'Submit', desc: 'Apply officially', icon: Award, color: 'text-emerald-500 border-emerald-500' }
  ];

  // Resources list - rendered in a clean, consistent 3-column visual layout
  const RESOURCES = [
    {
      id: "proposal-template",
      title: "Winning Proposal Template",
      description: "A comprehensive, structurally-sound project proposal outline matching expectations for GSoC, Outreachy, and LFX. Built with professional guidelines.",
      format: "Template",
      program: "GSoC",
      skillLevel: "Intermediate",
      stage: "draft",
      tags: ["technical plan", "timeline", "bio", "proposal", "gsoc"],
      lastUpdated: "Updated 3 days ago",
      ctaText: "Draft Outline Now",
      actionType: "scroll_to_builder",
      guideId: "proposal-writing"
    },
    {
      id: "readiness-checklist",
      title: "Preparation Readiness Checklist",
      description: "Ensure you have met all standard checkpoints (local setup, issue resolution, mentor touchpoint) before submitting your final program files.",
      format: "Checklist",
      program: "General",
      skillLevel: "Beginner",
      stage: "review",
      tags: ["checklist", "readiness", "submission"],
      lastUpdated: "Updated 1 week ago",
      ctaText: "Assess Readiness",
      actionType: "scroll_to_checklist"
    },
    {
      id: "timeline-planner",
      title: "12-Week Milestone Planner",
      description: "Structure your project coding phase into weekly blocks with dedicated test phases, review margins, and documentation buffers.",
      format: "Tool",
      program: "General",
      skillLevel: "Intermediate",
      stage: "draft",
      tags: ["timeline", "planning", "milestones"],
      lastUpdated: "Updated 2 weeks ago",
      ctaText: "Configure Timeline",
      actionType: "scroll_to_builder_timeline"
    },
    {
      id: "mentor-outreach-guide",
      title: "Mentor Outreach Guide",
      description: "Detailed protocols for contacting maintainers early, requesting draft feedback, and asking technical questions with polite, professional templates.",
      format: "Guide",
      program: "General",
      skillLevel: "Beginner",
      stage: "discover",
      tags: ["outreach", "feedback", "communication"],
      lastUpdated: "Updated 5 days ago",
      ctaText: "Read Outreach Guide",
      actionType: "open_guide",
      guideId: "proposal-writing"
    },
    {
      id: "pr-starter-guide",
      title: "PR & Version Control Guide",
      description: "Quick-reference sheet for clone, checkout, branch, commit, rebase, and pull request workflows. Avoid common merge conflicts.",
      format: "Guide",
      program: "General",
      skillLevel: "Beginner",
      stage: "learn",
      tags: ["PRs", "git", "github", "collaboration"],
      lastUpdated: "Updated 1 day ago",
      ctaText: "View Git Commands",
      actionType: "open_guide",
      guideId: "git-guide"
    }
  ];

  // Checklist Items State
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: "Identify target organization & 2 potential projects", stage: "discover", checked: false },
    { id: 2, text: "Join community channel (Slack/Discord/Mailing list)", stage: "discover", checked: false },
    { id: 3, text: "Set up project repository locally and run the test suite", stage: "learn", checked: false },
    { id: 4, text: "Submit a Pull Request solving a 'good first issue' or bug", stage: "learn", checked: false },
    { id: 5, text: "Draft Proposal: Outline technical specifications & architecture", stage: "draft", checked: false },
    { id: 6, text: "Draft Proposal: Formulate detailed 12-week timeline", stage: "draft", checked: false },
    { id: 7, text: "Send proposal draft to mentors for feedback (2+ weeks early)", stage: "review", checked: false },
    { id: 8, text: "Refine proposal draft based on mentor comments", stage: "review", checked: false },
    { id: 9, text: "Verify resume highlights open-source contributions", stage: "review", checked: false },
    { id: 10, text: "Submit final application on official program portal", stage: "submit", checked: false },
  ]);

  // Calculate readiness progress percentage
  const checkedCount = checklistItems.filter(item => item.checked).length;
  const progressPercent = Math.round((checkedCount / checklistItems.length) * 100);

  // Proposal Builder State
  const [selectedTemplateProgram, setSelectedTemplateProgram] = useState<'GSoC' | 'Outreachy' | 'LFX'>('GSoC');
  const [proposalDraft, setProposalDraft] = useState({
    techSpec: '',
    timeline: '',
    contributions: '',
    bio: ''
  });
  
  // Accordion active tab in proposal builder
  const [builderAccordion, setBuilderAccordion] = useState<string | null>('techSpec');

  // Workspace Mode (editor vs preview)
  const [workspaceMode, setWorkspaceMode] = useState<'editor' | 'preview'>('editor');

  // Drawer / Modal Guide State
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);

  // Mentor Advice Rotating State
  const [tipIndex, setTipIndex] = useState(0);
  const MENTOR_ADVICE = [
    {
      quote: "Mentors want to see that you can work independently. Solve a couple of issues early to prove you can navigate the codebase.",
      author: "Carolyn, GSoC Admin & Mentor"
    },
    {
      quote: "Never submit a draft proposal on the final day. Share a link to a Google Doc at least 2 weeks early to get detailed technical feedback.",
      author: "Alex, CNCF Org Admin"
    },
    {
      quote: "A good timeline is detailed down to the week, with clear deliverables and a dedicated block for writing tests and documentation.",
      author: "Siddharth, Summer of Bitcoin Mentor"
    },
    {
      quote: "Don't just list your university projects on your resume. Highlight pull requests, issues opened, and discussions participated in.",
      author: "Elena, Outreachy Coordinator"
    }
  ];

  // Copy notice popup
  const [showCopyNotice, setShowCopyNotice] = useState(false);

  // Hash route matching for legacy navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (DETAILED_GUIDES[hash]) {
          setActiveGuideId(hash);
        } else if (hash === 'proposal-writing') {
          setActiveGuideId('proposal-writing');
        } else {
          const matchedResource = RESOURCES.find(r => r.tags.includes(hash) || r.id === hash);
          if (matchedResource) {
            const el = document.getElementById('resource-list-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update proposal outline fields when program template changes
  useEffect(() => {
    const preset = PROGRAM_PRESETS[selectedTemplateProgram];
    setProposalDraft({
      techSpec: preset.techSpec,
      timeline: preset.timeline,
      contributions: preset.contributions,
      bio: preset.bio
    });
  }, [selectedTemplateProgram]);

  const toggleChecklistItem = (id: number) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const selectJourneyStage = (stageId: string) => {
    setActiveJourneyStage(prev => prev === stageId ? 'All' : stageId);
  };

  // Filtered resources based on search text, dropdown filters, and journey stages
  const filteredResources = RESOURCES.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProgram = selectedProgram === 'All' || 
      resource.program === selectedProgram || 
      (selectedProgram === 'General' && resource.program === 'General');

    const matchesSkill = selectedSkill === 'All' || resource.skillLevel === selectedSkill;
    const matchesFormat = selectedFormat === 'All' || resource.format === selectedFormat;
    const matchesJourney = activeJourneyStage === 'All' || resource.stage === activeJourneyStage;

    return matchesSearch && matchesProgram && matchesSkill && matchesFormat && matchesJourney;
  });

  const getCombinedMarkdown = () => {
    return `# Custom Proposal Draft Outline (${selectedTemplateProgram})
    
## 1. Technical Specification
${proposalDraft.techSpec}

## 2. Contributions & PRs
${proposalDraft.contributions}

## 3. Detailed Timeline
${proposalDraft.timeline}

## 4. About Me & Bio
${proposalDraft.bio}

---
*Generated via Contribo Resources Hub Outline Builder.*`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCombinedMarkdown());
    setShowCopyNotice(true);
    setTimeout(() => setShowCopyNotice(false), 2000);
  };

  const downloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([getCombinedMarkdown()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `proposal-outline-${selectedTemplateProgram.toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const executeAction = (actionType: string, guideId?: string) => {
    if (actionType === 'scroll_to_builder') {
      const el = document.getElementById('proposal-builder-section');
      el?.scrollIntoView({ behavior: 'smooth' });
      setBuilderAccordion('techSpec');
    } else if (actionType === 'scroll_to_builder_timeline') {
      const el = document.getElementById('proposal-builder-section');
      el?.scrollIntoView({ behavior: 'smooth' });
      setBuilderAccordion('timeline');
    } else if (actionType === 'scroll_to_checklist') {
      const el = document.getElementById('checklist-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (actionType === 'open_guide' && guideId) {
      if (DETAILED_GUIDES[guideId]) {
        setActiveGuideId(guideId);
      }
    }
  };

  const loadTimelinePreset = (presetKey: 'standard' | 'uiHeavy' | 'apiHeavy') => {
    setProposalDraft(prev => ({
      ...prev,
      timeline: TIMELINE_PRESETS[presetKey]
    }));
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 w-full max-w-[1440px] mx-auto bg-base min-h-screen text-primary transition-colors animate-[fade_0.2s_ease-out_forwards]">
      
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto my-8 sm:my-14 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brass/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <span className="font-mono text-xs uppercase tracking-widest text-brass font-bold mb-4 block">
          Application Blueprint & Guided Assets
        </span>
        
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary mb-4 leading-tight">
          Application Resources Hub
        </h1>
        
        <p className="text-secondary text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-10 font-medium">
          Prepare your application with practical guides, templates, and checklists built for real mentorship programs. 
          Step through modular phases, draft your outline in our custom IDE, and coordinate review goals early.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => executeAction('scroll_to_builder')}
            className="w-full sm:w-auto shadow-md group"
          >
            Start Proposal Outline
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => executeAction('scroll_to_checklist')}
            className="w-full sm:w-auto hover:bg-surface-raised"
          >
            Check Readiness Progress
          </Button>
        </div>
      </section>

      {/* 2. Journey Stages ("Where are you in the journey?") */}
      <section className="mb-14 bg-surface border border-hairline rounded-2xl p-6 shadow-sm max-w-5xl mx-auto">
        <h2 className="text-xs font-mono uppercase tracking-widest text-secondary text-center mb-8 font-bold flex items-center justify-center gap-1.5">
          <ListTodo size={14} className="text-brass" /> Where are you in the journey?
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
          {JOURNEY_STAGES.map((stage, idx) => {
            const isActive = activeJourneyStage === stage.id;
            const Icon = stage.icon;
            return (
              <button
                key={stage.id}
                onClick={() => selectJourneyStage(stage.id)}
                className={`relative group text-left p-5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-36 ${
                  isActive
                    ? 'border-brass bg-surface-raised ring-2 ring-brass/25 shadow-sm'
                    : 'border-hairline bg-surface hover:bg-surface-raised hover:border-brass/35'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs text-muted font-bold">0{idx + 1}</span>
                    <Icon size={20} className={isActive ? 'text-brass animate-pulse' : 'text-secondary'} />
                  </div>
                  <h3 className="font-bold text-sm text-primary mb-1">{stage.title}</h3>
                  <p className="text-[11px] text-secondary leading-tight">{stage.desc}</p>
                </div>
                
                {/* Visual link dash between buttons on desktop */}
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-hairline z-0 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Journey Progress Bar */}
        <div className="mt-8 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-brass" />
            <span className="text-xs font-bold text-secondary">
              Readiness Checkpoints Completed: <span className="text-brass font-extrabold">{checkedCount} / {checklistItems.length}</span>
            </span>
          </div>
          <div className="w-full sm:flex-1 sm:max-w-md h-3.5 bg-surface-raised rounded-full overflow-hidden border border-hairline p-0.5">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-brass">{progressPercent}% Completed</span>
            {progressPercent === 100 && <CheckCircle2 size={14} className="text-emerald-500" />}
          </div>
        </div>
      </section>

      {/* 3. Recommended Strip */}
      {activeJourneyStage !== 'All' && (
        <div className="max-w-5xl mx-auto mb-10 bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3.5 items-start animate-fadeIn">
          <div className="bg-brass/10 p-2 rounded-lg text-brass">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-brass">
              Recommended Focus for Phase: {activeJourneyStage.toUpperCase()}
            </h4>
            <p className="text-sm text-secondary leading-relaxed mt-1">
              {activeJourneyStage === 'discover' && "Start researching participating programs. Read through codebases, join community chat rooms, and formulate early questions for project maintainers."}
              {activeJourneyStage === 'learn' && "Deep dive into local environment config, version control commands, and pick up active issues tagged 'good first issue' or 'beginner-friendly'."}
              {activeJourneyStage === 'draft' && "Translate target goals into Technical Specs. Leverage the outline builder below to structure week-by-week milestones and contributions."}
              {activeJourneyStage === 'review' && "Circulate your draft proposal link 2 weeks early to mentors. Polish your resume highlights to emphasize open source coding patches."}
              {activeJourneyStage === 'submit' && "Perform a final checklist validation, run the builds, sync up with program portal instructions, and submit your proposal."}
            </p>
          </div>
        </div>
      )}

      {/* 4. Filters & Search Box */}
      <section className="mb-8" id="resource-list-section">
        <div className="bg-surface border border-hairline rounded-xl p-4 max-w-5xl mx-auto shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search guides, templates, workflows (e.g. 'timeline', 'PRs', 'bio', 'technical spec')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface border border-hairline rounded-lg focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass text-primary font-medium bg-white dark:bg-surface"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
              
              {/* Program Filter */}
              <div className="flex items-center gap-1.5 bg-surface-raised border border-hairline rounded-lg px-3 py-2">
                <span className="text-xs text-secondary font-semibold">Program:</span>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="GSoC">GSoC</option>
                  <option value="Outreachy">Outreachy</option>
                  <option value="LFX">LFX</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Skill Filter */}
              <div className="flex items-center gap-1.5 bg-surface-raised border border-hairline rounded-lg px-3 py-2">
                <span className="text-xs text-secondary font-semibold">Skill:</span>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Format Filter */}
              <div className="flex items-center gap-1.5 bg-surface-raised border border-hairline rounded-lg px-3 py-2">
                <span className="text-xs text-secondary font-semibold">Format:</span>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Guide">Guide</option>
                  <option value="Template">Template</option>
                  <option value="Checklist">Checklist</option>
                  <option value="Tool">Tool</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || selectedProgram !== 'All' || selectedSkill !== 'All' || selectedFormat !== 'All' || activeJourneyStage !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedProgram('All');
                    setSelectedSkill('All');
                    setSelectedFormat('All');
                    setActiveJourneyStage('All');
                  }}
                  className="px-3 py-2 text-xs font-bold text-brass hover:text-brass-hover flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> Reset
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 5. Symmetric, Visual Resource Cards Layout */}
      <section className="mb-14 max-w-5xl mx-auto">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-hairline rounded-xl">
            <Info size={32} className="mx-auto text-secondary mb-3" />
            <h3 className="font-bold text-lg mb-1 text-primary">No matching assets found</h3>
            <p className="text-secondary text-sm">Try resetting your filters or search queries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const IconComponent = RESOURCE_ICONS[resource.id] || HelpCircle;
              const isTemplate = resource.format === 'Template';
              const isChecklist = resource.format === 'Checklist';
              const isTool = resource.format === 'Tool';
              const isGuide = resource.format === 'Guide';
              
              // Color schemes for layout consistency
              let borderAccent = 'hover:border-brass/45';
              let themeColorClass = 'text-brass bg-brass/10 border-brass/25';
              let badgeColorClass = 'bg-brass/10 text-brass';
              
              if (isChecklist) {
                borderAccent = 'hover:border-emerald-500/40';
                themeColorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
                badgeColorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
              } else if (isTool) {
                borderAccent = 'hover:border-blue-500/40';
                themeColorClass = 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25';
                badgeColorClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
              } else if (isGuide) {
                borderAccent = 'hover:border-purple-500/40';
                themeColorClass = 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/25';
                badgeColorClass = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
              }

              return (
                <div 
                  key={resource.id} 
                  className={`bg-surface border border-hairline rounded-xl p-6 flex flex-col justify-between shadow-xs transition-all hover:-translate-y-1 hover:shadow-md bg-white dark:bg-surface h-full ${borderAccent}`}
                >
                  <div>
                    {/* Card Top Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-lg border ${themeColorClass} shrink-0`}>
                        <IconComponent size={20} />
                      </div>
                      <span className="text-[10px] font-mono text-secondary flex items-center gap-1 font-semibold">
                        <Clock size={11} /> {resource.lastUpdated}
                      </span>
                    </div>

                    {/* Badge and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColorClass}`}>
                        {resource.format}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-primary mb-2 hover:text-brass transition-colors leading-snug">
                      {resource.title}
                    </h3>
                    
                    <p className="text-xs text-secondary leading-relaxed mb-4">
                      {resource.description}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {resource.tags.map(tag => (
                        <span 
                          key={tag} 
                          onClick={() => setSearchQuery(tag)}
                          className="text-[10px] bg-surface-raised text-secondary hover:text-brass hover:bg-brass/5 px-2.5 py-0.5 rounded-md cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-hairline pt-4 mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                      {resource.program === 'General' ? 'All Programs' : `${resource.program} • ${resource.skillLevel}`}
                    </span>
                    <button
                      onClick={() => executeAction(resource.actionType, resource.guideId)}
                      className="text-xs font-bold text-brass hover:text-brass-hover flex items-center gap-1 group cursor-pointer"
                    >
                      {resource.ctaText} 
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Two-Column Interactive Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        
        {/* Left Column: Interactive Proposal Outline Workspace / Editor */}
        <div id="proposal-builder-section" className="lg:col-span-8 bg-surface border border-hairline rounded-xl shadow-sm relative overflow-hidden bg-white dark:bg-surface">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-brass" />
          
          {/* Mock IDE Bar */}
          <div className="bg-surface-raised border-b border-hairline px-4 py-3 flex flex-wrap justify-between items-center gap-4">
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-xs font-mono font-bold text-secondary ml-2 flex items-center gap-1">
                <Terminal size={12} /> outline_builder.md *
              </span>
            </div>

            {/* Editor Mode Tabs */}
            <div className="flex items-center gap-1 bg-surface border border-hairline p-0.5 rounded-md">
              <button
                onClick={() => setWorkspaceMode('editor')}
                className={`px-3 py-1 text-xs font-bold rounded-sm cursor-pointer flex items-center gap-1 transition-colors ${
                  workspaceMode === 'editor' 
                    ? 'bg-surface-raised text-brass shadow-xs' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <Edit3 size={11} /> Editor
              </button>
              <button
                onClick={() => setWorkspaceMode('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-sm cursor-pointer flex items-center gap-1 transition-colors ${
                  workspaceMode === 'preview' 
                    ? 'bg-surface-raised text-brass shadow-xs' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <Eye size={11} /> Live Preview
              </button>
            </div>

            {/* Template Selector */}
            <div className="flex items-center gap-1.5 bg-surface border border-hairline rounded-md px-2 py-1">
              <span className="text-[10px] text-secondary font-bold">Target:</span>
              <select
                value={selectedTemplateProgram}
                onChange={(e) => setSelectedTemplateProgram(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
              >
                <option value="GSoC">GSoC Template</option>
                <option value="Outreachy">Outreachy Template</option>
                <option value="LFX">LFX Template</option>
              </select>
            </div>

          </div>

          {/* Workspace Body */}
          <div className="p-6 sm:p-8 min-h-[460px]">
            
            {workspaceMode === 'editor' ? (
              <div className="space-y-4">
                
                {/* Guidelines description banner */}
                <div className="p-3.5 bg-brass/5 border border-brass/10 rounded-lg text-xs flex gap-2 items-start mb-4">
                  <Info size={16} className="text-brass shrink-0 mt-0.5" />
                  <p className="text-secondary leading-relaxed font-medium">
                    This builder compiles your inputs into a structured markdown document. Expand the sections below to draft details based on official {selectedTemplateProgram} guidelines.
                  </p>
                </div>

                {/* Section 1: Tech Spec */}
                <div className="border border-hairline rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBuilderAccordion(builderAccordion === 'techSpec' ? null : 'techSpec')}
                    className="w-full flex items-center justify-between p-4 bg-surface-raised hover:bg-surface-raised/85 text-left font-bold text-sm text-primary transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brass">Section 1</span> Technical Specification
                    </span>
                    {builderAccordion === 'techSpec' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {builderAccordion === 'techSpec' && (
                    <div className="p-4 bg-surface border-t border-hairline space-y-3 bg-white dark:bg-surface text-primary">
                      <div className="p-3 bg-surface-raised border border-hairline rounded text-xs text-secondary leading-relaxed font-medium">
                        <strong className="text-primary block mb-1">GSoC / LFX Standards:</strong>
                        {PROGRAM_PRESETS[selectedTemplateProgram].instructions.techSpec}
                      </div>
                      <textarea
                        rows={6}
                        value={proposalDraft.techSpec}
                        onChange={(e) => setProposalDraft(prev => ({ ...prev, techSpec: e.target.value }))}
                        className="w-full p-3 text-xs bg-surface-raised border border-hairline rounded font-mono focus:outline-none focus:border-brass text-primary leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                {/* Section 2: Contributions */}
                <div className="border border-hairline rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBuilderAccordion(builderAccordion === 'contributions' ? null : 'contributions')}
                    className="w-full flex items-center justify-between p-4 bg-surface-raised hover:bg-surface-raised/85 text-left font-bold text-sm text-primary transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brass">Section 2</span> Contributions & Pull Requests
                    </span>
                    {builderAccordion === 'contributions' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {builderAccordion === 'contributions' && (
                    <div className="p-4 bg-surface border-t border-hairline space-y-3 bg-white dark:bg-surface text-primary">
                      <div className="p-3 bg-surface-raised border border-hairline rounded text-xs text-secondary leading-relaxed font-medium">
                        <strong className="text-primary block mb-1">Contribution Records:</strong>
                        {PROGRAM_PRESETS[selectedTemplateProgram].instructions.contributions}
                      </div>
                      <textarea
                        rows={6}
                        value={proposalDraft.contributions}
                        onChange={(e) => setProposalDraft(prev => ({ ...prev, contributions: e.target.value }))}
                        className="w-full p-3 text-xs bg-surface-raised border border-hairline rounded font-mono focus:outline-none focus:border-brass text-primary leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                {/* Section 3: Timeline */}
                <div className="border border-hairline rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBuilderAccordion(builderAccordion === 'timeline' ? null : 'timeline')}
                    className="w-full flex items-center justify-between p-4 bg-surface-raised hover:bg-surface-raised/85 text-left font-bold text-sm text-primary transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brass">Section 3</span> 12-Week Coding Timeline
                    </span>
                    {builderAccordion === 'timeline' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {builderAccordion === 'timeline' && (
                    <div className="p-4 bg-surface border-t border-hairline space-y-4 bg-white dark:bg-surface text-primary">
                      
                      {/* Timeline Preset Assistant */}
                      <div className="bg-surface-raised border border-hairline rounded p-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brass block mb-2">
                          Timeline Assistant Presets
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => loadTimelinePreset('standard')}
                            className="bg-surface hover:bg-surface-raised px-2.5 py-1 rounded text-xs font-semibold border border-hairline text-primary cursor-pointer transition-colors"
                          >
                            Standard Dev
                          </button>
                          <button
                            type="button"
                            onClick={() => loadTimelinePreset('uiHeavy')}
                            className="bg-surface hover:bg-surface-raised px-2.5 py-1 rounded text-xs font-semibold border border-hairline text-primary cursor-pointer transition-colors"
                          >
                            UI-Heavy Layout
                          </button>
                          <button
                            type="button"
                            onClick={() => loadTimelinePreset('apiHeavy')}
                            className="bg-surface hover:bg-surface-raised px-2.5 py-1 rounded text-xs font-semibold border border-hairline text-primary cursor-pointer transition-colors"
                          >
                            API/Backend-Heavy
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-surface-raised border border-hairline rounded text-xs text-secondary leading-relaxed font-medium">
                        <strong className="text-primary block mb-1">Timeline Guidelines:</strong>
                        {PROGRAM_PRESETS[selectedTemplateProgram].instructions.timeline}
                      </div>
                      <textarea
                        rows={6}
                        value={proposalDraft.timeline}
                        onChange={(e) => setProposalDraft(prev => ({ ...prev, timeline: e.target.value }))}
                        className="w-full p-3 text-xs bg-surface-raised border border-hairline rounded font-mono focus:outline-none focus:border-brass text-primary leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                {/* Section 4: Bio */}
                <div className="border border-hairline rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setBuilderAccordion(builderAccordion === 'bio' ? null : 'bio')}
                    className="w-full flex items-center justify-between p-4 bg-surface-raised hover:bg-surface-raised/85 text-left font-bold text-sm text-primary transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brass">Section 4</span> About Me & Bio
                    </span>
                    {builderAccordion === 'bio' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {builderAccordion === 'bio' && (
                    <div className="p-4 bg-surface border-t border-hairline space-y-3 bg-white dark:bg-surface text-primary">
                      <div className="p-3 bg-surface-raised border border-hairline rounded text-xs text-secondary leading-relaxed font-medium">
                        <strong className="text-primary block mb-1">Bio Guidelines:</strong>
                        {PROGRAM_PRESETS[selectedTemplateProgram].instructions.bio}
                      </div>
                      <textarea
                        rows={6}
                        value={proposalDraft.bio}
                        onChange={(e) => setProposalDraft(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full p-3 text-xs bg-surface-raised border border-hairline rounded font-mono focus:outline-none focus:border-brass text-primary leading-relaxed"
                      />
                    </div>
                  )}
                </div>

              </div>
            ) : (
              // Live Preview Tab (Formatted Document Layout)
              <div className="space-y-6 font-sans text-primary select-text max-w-none prose dark:prose-invert">
                <div className="border-b border-hairline pb-4 mb-6">
                  <span className="font-mono text-xs text-brass font-bold uppercase tracking-widest">
                    Live Render Preview
                  </span>
                  <h1 className="text-2xl font-extrabold text-primary mt-1">
                    Project Proposal Outline Template ({selectedTemplateProgram})
                  </h1>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-primary border-b border-hairline/60 pb-1.5 mb-2 flex items-center gap-1.5">
                    <span className="font-mono text-xs text-brass">1.</span> Technical Specification
                  </h2>
                  <div className="bg-surface-raised border border-hairline p-4 rounded text-sm whitespace-pre-wrap leading-relaxed font-mono text-secondary">
                    {proposalDraft.techSpec}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-primary border-b border-hairline/60 pb-1.5 mb-2 flex items-center gap-1.5">
                    <span className="font-mono text-xs text-brass">2.</span> Contributions & PRs
                  </h2>
                  <div className="bg-surface-raised border border-hairline p-4 rounded text-sm whitespace-pre-wrap leading-relaxed font-mono text-secondary">
                    {proposalDraft.contributions}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-primary border-b border-hairline/60 pb-1.5 mb-2 flex items-center gap-1.5">
                    <span className="font-mono text-xs text-brass">3.</span> 12-Week Coding Timeline
                  </h2>
                  <div className="bg-surface-raised border border-hairline p-4 rounded text-sm whitespace-pre-wrap leading-relaxed font-mono text-secondary">
                    {proposalDraft.timeline}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-primary border-b border-hairline/60 pb-1.5 mb-2 flex items-center gap-1.5">
                    <span className="font-mono text-xs text-brass">4.</span> Bio and Qualifications
                  </h2>
                  <div className="bg-surface-raised border border-hairline p-4 rounded text-sm whitespace-pre-wrap leading-relaxed font-mono text-secondary">
                    {proposalDraft.bio}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap gap-3 items-center justify-between border-t border-hairline p-5 bg-surface-raised">
            <span className="text-xs text-secondary font-semibold flex items-center gap-1.5">
              <AlertCircle size={14} className="text-brass shrink-0" />
              Pro Tip: Share drafts with mentors <strong className="text-brass font-bold">2 weeks early</strong> to refine specifications.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="bg-surface hover:bg-surface-raised border border-hairline px-4 py-2.5 rounded-lg text-xs font-bold text-primary inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-white dark:bg-surface"
              >
                <Copy size={13} /> {showCopyNotice ? 'Copied!' : 'Copy Outline'}
              </button>
              <button
                type="button"
                onClick={downloadMarkdown}
                className="bg-accent hover:bg-accent-hover px-4 py-2.5 rounded-lg text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} /> Download Markdown (.md)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Side Rail Insights & Checklist */}
        <div className="lg:col-span-4 space-y-6 w-full text-primary">
          
          {/* Readiness Checklist Card */}
          <div id="checklist-section" className="bg-surface border border-hairline rounded-xl p-5 shadow-sm bg-white dark:bg-surface">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider mb-4 pb-2 border-b border-hairline flex items-center gap-2">
              <CheckSquare size={16} className="text-brass animate-pulse" /> Preparation Readiness
            </h3>
            
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {checklistItems.map(item => (
                <div key={item.id} className="flex gap-2.5 items-start group">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    id={`check-${item.id}`}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-1 cursor-pointer accent-brass w-3.5 h-3.5 rounded border-hairline focus:ring-1 focus:ring-brass"
                  />
                  <label 
                    htmlFor={`check-${item.id}`}
                    className={`text-xs leading-normal cursor-pointer select-none font-sans ${
                      item.checked ? 'text-muted line-through' : 'text-secondary font-medium'
                    }`}
                  >
                    {item.text}
                    <span className="block text-[9px] text-brass uppercase font-mono tracking-wider font-bold mt-1">
                      Phase: {item.stage}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* What Mentors Look For */}
          <div className="bg-surface border border-hairline rounded-xl p-5 shadow-sm bg-white dark:bg-surface text-primary">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider mb-4 pb-2 border-b border-hairline flex items-center gap-2">
              <Lightbulb size={16} className="text-brass" /> What Mentors Look For
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-xs text-secondary leading-relaxed">
                <span className="font-mono font-bold text-brass shrink-0 bg-brass/10 w-5 h-5 rounded-full flex items-center justify-center">1</span>
                <span><strong>Thorough Investigation:</strong> Clearly define APIs, libraries, and design plans. Avoid copy-pasting generic layouts.</span>
              </li>
              <li className="flex gap-3 text-xs text-secondary leading-relaxed">
                <span className="font-mono font-bold text-brass shrink-0 bg-brass/10 w-5 h-5 rounded-full flex items-center justify-center">2</span>
                <span><strong>Demonstrated Skills:</strong> Merged commits or open pull requests prove familiarity with coding and formatting standards.</span>
              </li>
              <li className="flex gap-3 text-xs text-secondary leading-relaxed">
                <span className="font-mono font-bold text-brass shrink-0 bg-brass/10 w-5 h-5 rounded-full flex items-center justify-center">3</span>
                <span><strong>Early Outreach:</strong> Communication 2-3 weeks early shows respect for reviewer timetables and indicates collaboration maturity.</span>
              </li>
            </ul>
          </div>

          {/* Common Mistakes */}
          <div className="bg-surface border border-hairline rounded-xl p-5 shadow-sm bg-white dark:bg-surface text-primary">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider mb-4 pb-2 border-b border-hairline flex items-center gap-2">
              <AlertTriangle size={16} className="text-error" /> Common Mistakes
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded bg-error/5 border border-error/20 text-xs text-secondary leading-relaxed">
                <strong className="text-error block mb-1 font-bold">Last-Minute Submissions</strong>
                Mentors are busy. Submitting on the final day without prior communication or outreach usually results in automatic rejection.
              </div>
              <div className="p-3.5 rounded bg-error/5 border border-error/20 text-xs text-secondary leading-relaxed">
                <strong className="text-error block mb-1 font-bold">Vague Milestone Blocks</strong>
                Saying &quot;Weeks 1-6: code core features&quot; is unacceptable. Write specific components, APIs, files, and testing intervals.
              </div>
            </div>
          </div>

          {/* Mentor Quote Rotator */}
          <div className="bg-surface border border-hairline rounded-xl p-5 shadow-sm relative overflow-hidden bg-white dark:bg-surface text-primary">
            <div className="absolute top-0 right-0 w-12 h-12 bg-brass/5 rounded-bl-full flex items-center justify-end pr-2.5 pb-2.5">
              <Sparkles size={16} className="text-brass animate-pulse" />
            </div>
            
            <h4 className="font-bold text-[10px] text-brass uppercase tracking-wider mb-3">
              Mentor Advice
            </h4>
            
            <p className="text-xs italic text-secondary leading-relaxed mb-4">
              &ldquo;{MENTOR_ADVICE[tipIndex].quote}&rdquo;
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-primary">
                — {MENTOR_ADVICE[tipIndex].author}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setTipIndex(prev => (prev - 1 + MENTOR_ADVICE.length) % MENTOR_ADVICE.length)}
                  className="w-6 h-6 rounded border border-hairline bg-surface hover:bg-surface-raised flex items-center justify-center text-xs font-bold text-secondary cursor-pointer bg-white dark:bg-surface select-none"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={() => setTipIndex(prev => (prev + 1) % MENTOR_ADVICE.length)}
                  className="w-6 h-6 rounded border border-hairline bg-surface hover:bg-surface-raised flex items-center justify-center text-xs font-bold text-secondary cursor-pointer bg-white dark:bg-surface select-none"
                >
                  &rarr;
                </button>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 7. Drawer / Sliding Modal for deep-dive Guides */}
      {activeGuideId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => { setActiveGuideId(null); window.location.hash = ''; }} />
          
          <div className="relative w-full max-w-2xl bg-surface h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto z-10 border-l border-hairline bg-white dark:bg-surface">
            
            <div>
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-hairline pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brass">
                    {DETAILED_GUIDES[activeGuideId]?.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-primary flex items-center gap-2 mt-1">
                    {React.createElement(DETAILED_GUIDES[activeGuideId]?.icon || HelpCircle, { 
                      size: 24, 
                      className: "text-brass shrink-0 animate-pulse" 
                    })}
                    {DETAILED_GUIDES[activeGuideId]?.title}
                  </h2>
                </div>
                <button 
                  type="button"
                  onClick={() => { setActiveGuideId(null); window.location.hash = ''; }}
                  className="p-1 rounded-lg border border-hairline hover:bg-surface-raised text-muted hover:text-primary transition-colors cursor-pointer bg-white dark:bg-surface"
                  aria-label="Close Guide"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="pb-12 text-primary">
                {DETAILED_GUIDES[activeGuideId]?.content}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-hairline pt-4 bg-white dark:bg-surface mt-auto sticky bottom-0 left-0 right-0 flex justify-end">
              <Button 
                variant="outline" 
                size="md" 
                onClick={() => { setActiveGuideId(null); window.location.hash = ''; }}
              >
                Close Reference
              </Button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
