import React from 'react';
import { 
  BookOpen, 
  GitBranch, 
  Terminal, 
  Compass, 
  Award, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';

export interface DetailedGuide {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  content: React.ReactNode;
}

export const DETAILED_GUIDES: Record<string, DetailedGuide> = {
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
                <strong>Try Contribo Project Search:</strong> Navigate to our Projects Page and filter by &ldquo;Beginner Friendly&rdquo; difficulty.
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

export interface ProgramContentPreset {
  techSpec: string;
  contributions: string;
  timeline: string;
  bio: string;
  risks: string;
  instructions: {
    techSpec: string;
    contributions: string;
    timeline: string;
    bio: string;
    risks: string;
  };
}

export const PROGRAM_PRESETS: Record<'GSoC' | 'Outreachy' | 'LFX' | 'General', ProgramContentPreset> = {
  GSoC: {
    instructions: {
      techSpec: "Describe the system architecture, file/directory breakdown, database structures (e.g., MongoDB schemas, tables), APIs, third-party libraries, and design choices. Explain exactly HOW your code fits into the codebase.",
      contributions: "List merged commits, open PRs, bug reports, and discussion threads in the target repository. This proves your familiarity with the build system and project code styling.",
      timeline: "Divide the 12-week coding phase into week-by-week milestones. Specify deliverables, test coverage blocks, documentation intervals, and mid-term/final evaluation prep windows.",
      bio: "Highlight your academic background, relevant project portfolios, timezone alignment, weekly availability (e.g., 30-40 hours), and explanation of your passion for the project.",
      risks: "Identify technical risks (e.g. unknown APIs, blocking dependencies) and provide mitigation strategies or alternatives."
    },
    techSpec: `### Architecture and Class Mappings
We will extend the match engine in \`src/app/matcher/route.ts\` to process skill filters asynchronously. 

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
* **Passion**: Open source tools solve the hardest part of tech—finding where to start. I want to build features that I personally would use daily.`,
    risks: `* **Risk 1**: The new API rate limit might cause throttling for high-volume searches.
  * **Mitigation**: Implement Redis caching for common search queries.
* **Risk 2**: Integration with the third-party UI library might cause bundle size bloat.
  * **Mitigation**: Use dynamic imports and code splitting.`
  },
  Outreachy: {
    instructions: {
      techSpec: "Focus on user-centric features, accessibility (WCAG AA standards, alt texts, screen-reader compatibility), UI design tokens, responsive layouts, and simple setup integrations.",
      contributions: "Summarize contribution phase achievements, community forum posts (on Zulip, Slack, mailing lists), documentation additions, and feedback loops with other applicants.",
      timeline: "Provide bi-weekly milestones mapping coding deliverables, weekly coordinator updates, required Outreachy blog posts (3-4 posts), and testing cycles.",
      bio: "Focus on your personal path into tech, experience overcoming barriers, timezone and availability details, and commitment to learning in public.",
      risks: "Address potential roadblocks in understanding the community workflow or technical barriers, and how you will overcome them."
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
* **Goal**: I applied to Outreachy to contribute to meaningful community tools. I believe accessible software is a fundamental right, and I want to help the community achieve those standards.`,
    risks: `* **Risk 1**: Accessibility audits might reveal deeper structural issues in the HTML.
  * **Mitigation**: I will flag architectural a11y issues early and break them into smaller, manageable tickets rather than rewriting everything at once.`
  },
  LFX: {
    instructions: {
      techSpec: "Outline system-level configurations, automation pipelines, CI/CD routines, test suites, API contracts, benchmarking, and security scanning setups.",
      contributions: "List systems commits, kernel/module patches, scripts, configuration fixes, or documentation specifications made in the target Linux Foundation codebase.",
      timeline: "Structure weekly deliverables focused on testing metrics, benchmarks, validation testing, code reviews, and integration milestones.",
      bio: "Highlight systems engineering skills, knowledge of infrastructure tools (Docker, Kubernetes, GitHub Actions), certifications, and professional goals.",
      risks: "Identify risks related to system dependencies, CI runtimes, or hardware bottlenecks."
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
* **Background**: AWS Certified Cloud Practitioner. Passionate about systems performance and automation.`,
    risks: `* **Risk 1**: CI runners might not have enough resources for realistic benchmarking.
  * **Mitigation**: I will configure a self-hosted runner block if public runner limits are hit, or stub heavy processes.`
  },
  General: {
    instructions: {
      techSpec: "Describe the system architecture, file/directory breakdown, dependencies, and design choices.",
      contributions: "List your contributions to the project to prove your capability.",
      timeline: "Break down the coding phase into weekly milestones, including testing and documentation.",
      bio: "Highlight your background, relevant project portfolios, timezone alignment, and availability.",
      risks: "Identify technical risks and provide mitigation strategies."
    },
    techSpec: `### Architecture Overview
...`,
    contributions: `- **PR #X**: ...`,
    timeline: `* **Week 1**: ...`,
    bio: `I am a developer...`,
    risks: `* **Risk 1**: ...`
  }
};
