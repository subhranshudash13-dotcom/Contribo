'use client';

import React, { useState } from 'react';
import {
  GitPullRequest,
  CircleDot,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Zap,
  MessageSquare,
  FileCode,
  Check,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Info,
  Eye,
  CheckCircle
} from 'lucide-react';

type TabView = 'anatomy' | 'issues' | 'value';

type PrElementId = 'title' | 'linking' | 'ci' | 'diff' | 'threads';

interface PrElementInfo {
  id: PrElementId;
  label: string;
  badge: string;
  title: string;
  whyCare: string;
  bestPractice: string;
  pitfall: string;
}

const PR_ELEMENTS: Record<PrElementId, PrElementInfo> = {
  title: {
    id: 'title',
    label: 'Semantic Title',
    badge: 'Conventional Commits',
    title: 'Conventional & Semantic PR Titles',
    whyCare:
      'Maintainers manage dozens of PRs simultaneously. A structured title like feat(scope): message instantly tells the team what layer of the application is affected, what kind of change it is, and feeds automated CHANGELOG and semantic release tooling.',
    bestPractice:
      'Use the format: <type>(<scope>): <imperative summary> (e.g., feat(matcher): add real-time tag filtering). Keep it lowercase, under 72 characters, and describe what the commit does, not what you did.',
    pitfall:
      'Vague titles like "fixed bug", "updated files", "WIP", or "changes for issue" force maintainers to dig through diffs to understand the core intent.',
  },
  linking: {
    id: 'linking',
    label: 'Issue Linking',
    badge: 'Automated Lifecycle',
    title: 'Automatic Issue Resolution (Fixes #123)',
    whyCare:
      'GitHub recognizes closing keywords (Fixes, Closes, Resolves) combined with an issue number. When this PR merges into the default branch, the linked issue is automatically closed and cross-referenced in project roadmaps.',
    bestPractice:
      'Include keywords like "Fixes #89" or "Closes #142" in the PR description body. This links the discussion, lets reviewers inspect original requirements, and saves maintainers from manually cleaning up issue trackers.',
    pitfall:
      'Putting "Fixes #123" only in the PR title or commit message without placing it in the PR description body often fails GitHub\'s automatic resolution trigger.',
  },
  ci: {
    id: 'ci',
    label: 'Automated CI Checks',
    badge: 'Quality Gates',
    title: 'Continuous Integration (CI) Checks',
    whyCare:
      'Automated CI pipelines run unit tests, TypeScript typechecking, code linting, and security audits across multiple OS and runtime environments. Green checks assure maintainers that existing features remain unbroken.',
    bestPractice:
      'Always run `npm run lint` and `npx tsc --noEmit` locally before pushing. If a CI check fails, inspect the runner logs, fix the root cause, and push an incremental commit.',
    pitfall:
      'Asking maintainers to review a PR while CI checks are failing with red ❌ marks. Most maintainers won\'t begin code review until automated gates are green.',
  },
  diff: {
    id: 'diff',
    label: 'Clean Code Diffs',
    badge: 'Single Responsibility',
    title: 'Minimal, High-Signal Code Diffs',
    whyCare:
      'Reviewers focus on logic, boundary conditions, and security. Small, focused diffs without unnecessary whitespace churn or unrelated file edits can be reviewed and approved in minutes.',
    bestPractice:
      'Adhere to single responsibility. Add defensive checks, write self-documenting code, and include accompanying unit tests for any new logic added.',
    pitfall:
      'Including accidental auto-formatting across thousands of unrelated lines, or bundling multiple unrelated bug fixes into a single PR ("diff pollution").',
  },
  threads: {
    id: 'threads',
    label: 'Threaded Comments',
    badge: 'Collaborative Review',
    title: 'Threaded Discussions & Review Feedback',
    whyCare:
      'Code review is a collaborative peer conversation, not an exam. Maintainers use inline comments to point out edge cases, ask questions, or suggest architectural refinements.',
    bestPractice:
      'Acknowledge suggestions positively. When addressing feedback, reply with the commit hash or a brief explanation (e.g., "Updated in 4b2a9e with null checks and added test coverage") so the reviewer knows it is ready for re-review.',
    pitfall:
      'Marking reviewer discussions as "Resolved" without actually pushing the code change or replying to clarify why an alternative approach was taken.',
  },
};

export function PrInteractiveLab() {
  const [activeTab, setActiveTab] = useState<TabView>('anatomy');
  const [selectedPrElement, setSelectedPrElement] = useState<PrElementId>('title');
  const [activeIssueSection, setActiveIssueSection] = useState<'all' | 'title' | 'repro' | 'env' | 'logs'>('all');

  const activeElementInfo = PR_ELEMENTS[selectedPrElement];

  return (
    <section
      id="pr-interactive-lab"
      aria-labelledby="pr-lab-heading"
      className="scroll-mt-32 space-y-8"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-accent/10 text-accent border border-accent/20">
              <Sparkles size={13} aria-hidden="true" />
              Interactive Lab
            </span>
          </div>
          <h2 id="pr-lab-heading" className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            PR &amp; Issue Inspector
          </h2>
          <p className="text-sm sm:text-base text-secondary mt-1.5 max-w-2xl">
            Explore what makes pull requests get approved, how maintainers triage bug reports, and why quality contributions power open source ecosystems.
          </p>
        </div>

        {/* Tab switcher */}
        <div
          role="tablist"
          aria-label="PR and Issue Inspector Views"
          className="flex items-center p-1 rounded-xl bg-surface-raised border border-hairline overflow-x-auto no-scrollbar"
        >
          <button
            type="button"
            role="tab"
            id="tab-anatomy"
            aria-selected={activeTab === 'anatomy'}
            aria-controls="panel-anatomy"
            onClick={() => setActiveTab('anatomy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'anatomy'
                ? 'bg-accent text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <GitPullRequest size={15} aria-hidden="true" />
            Anatomy of a PR
          </button>

          <button
            type="button"
            role="tab"
            id="tab-issues"
            aria-selected={activeTab === 'issues'}
            aria-controls="panel-issues"
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'issues'
                ? 'bg-accent text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <CircleDot size={15} aria-hidden="true" />
            Issue Inspector
          </button>

          <button
            type="button"
            role="tab"
            id="tab-value"
            aria-selected={activeTab === 'value'}
            aria-controls="panel-value"
            onClick={() => setActiveTab('value')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'value'
                ? 'bg-accent text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Zap size={15} aria-hidden="true" />
            Value Breakdown
          </button>
        </div>
      </div>

      {/* VIEW 1: ANATOMY OF A PR */}
      {activeTab === 'anatomy' && (
        <div
          id="panel-anatomy"
          role="tabpanel"
          aria-labelledby="tab-anatomy"
          className="space-y-6"
        >
          {/* Instruction callout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-hairline text-xs text-secondary">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Eye size={16} className="text-accent shrink-0" aria-hidden="true" />
              <span>Interactive Simulator: Click any highlighted section below to inspect maintainer expectations.</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              {(['title', 'linking', 'ci', 'diff', 'threads'] as PrElementId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedPrElement(id)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    selectedPrElement === id
                      ? 'bg-accent/20 border-accent text-accent font-bold'
                      : 'bg-surface-raised border-hairline text-secondary hover:border-tertiary'
                  }`}
                >
                  {PR_ELEMENTS[id].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Mock GitHub PR Container (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 bg-surface border border-hairline rounded-2xl overflow-hidden shadow-sm">
              {/* Mock PR Top Banner */}
              <div className="p-4 sm:p-5 border-b border-hairline bg-surface-raised/40 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30">
                    <GitPullRequest size={13} aria-hidden="true" />
                    Open
                  </span>
                  <span className="text-xs text-secondary font-mono">
                    subhranshudash13:main ← contributor:feat/matcher-skill-filter
                  </span>
                </div>

                {/* Clickable 1: Semantic Title */}
                <button
                  type="button"
                  onClick={() => setSelectedPrElement('title')}
                  aria-pressed={selectedPrElement === 'title'}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedPrElement === 'title'
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                      : 'border-hairline bg-surface hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                      1. Semantic PR Title
                    </span>
                    {selectedPrElement === 'title' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-accent text-white font-mono font-bold">
                        Inspecting
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-primary font-mono leading-snug">
                    feat(matcher): add real-time tag-based skill filtering (#142)
                  </h3>
                </button>
              </div>

              {/* Mock PR Body & Tabs */}
              <div className="p-4 sm:p-6 space-y-5">
                {/* Clickable 2: Automatic Issue Linking */}
                <div
                  onClick={() => setSelectedPrElement('linking')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPrElement('linking');
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrElement === 'linking'}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedPrElement === 'linking'
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                      : 'border-hairline bg-surface-raised hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                      2. Automatic Issue Linking &amp; Description
                    </span>
                    {selectedPrElement === 'linking' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-accent text-white font-mono font-bold">
                        Inspecting
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-secondary space-y-2">
                    <p className="font-semibold text-primary">
                      Closes #89 · Fixes #142
                    </p>
                    <p>
                      Replaces quadratic array scans in the skill matching algorithm with a case-insensitive <code className="text-primary font-mono bg-surface px-1.5 py-0.5 rounded">Set</code> lookup. Prevents UI lag when typing multi-word tags.
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-tertiary">
                      <span>✓ Unit tests included</span>
                      <span>·</span>
                      <span>✓ TypeScript strict verified</span>
                    </div>
                  </div>
                </div>

                {/* Clickable 3: Code Diffs */}
                <div
                  onClick={() => setSelectedPrElement('diff')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPrElement('diff');
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrElement === 'diff'}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedPrElement === 'diff'
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                      : 'border-hairline bg-surface-raised hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <FileCode size={14} className="text-accent" aria-hidden="true" />
                      <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                        3. Code Diff (src/lib/matcher/filter.ts)
                      </span>
                    </div>
                    {selectedPrElement === 'diff' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-accent text-white font-mono font-bold">
                        Inspecting
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-hairline bg-surface p-3 font-mono text-[11px] sm:text-xs leading-relaxed">
                    <div className="text-tertiary">@@ -18,6 +18,14 @@ export function matchSkills(candidate, required) {'{'}</div>
                    <div className="text-error bg-error/10 px-1 rounded">-  return candidate.skills.filter(s =&gt; required.includes(s));</div>
                    <div className="text-success bg-success/10 px-1 rounded">+  if (!candidate?.skills?.length || !required?.length) return [];</div>
                    <div className="text-success bg-success/10 px-1 rounded">+  const requiredSet = new Set(required.map(s =&gt; s.toLowerCase()));</div>
                    <div className="text-success bg-success/10 px-1 rounded">+  return candidate.skills.filter(s =&gt; requiredSet.has(s.toLowerCase()));</div>
                    <div className="text-secondary">{'}'}</div>
                  </div>
                </div>

                {/* Clickable 4: Threaded Review Comments */}
                <div
                  onClick={() => setSelectedPrElement('threads')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPrElement('threads');
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrElement === 'threads'}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedPrElement === 'threads'
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                      : 'border-hairline bg-surface-raised hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-accent" aria-hidden="true" />
                      <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-bold">
                        4. Threaded Review Comments
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-success/15 text-success border border-success/30">
                      <Check size={11} aria-hidden="true" />
                      Resolved
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Maintainer comment */}
                    <div className="p-3 rounded-lg bg-surface border border-hairline space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-tertiary">
                        <span className="font-bold text-primary">subhranshudash13 (Maintainer)</span>
                        <span>2 hours ago</span>
                      </div>
                      <p className="text-secondary">
                        Great catch optimizing with <code className="text-primary font-mono">Set</code>! Does this handle edge cases where tag casing is inconsistent like &ldquo;TypeScript&rdquo; vs &ldquo;typescript&rdquo;?
                      </p>
                    </div>

                    {/* Contributor reply */}
                    <div className="pl-4 border-l-2 border-accent/40 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-tertiary">
                        <span className="font-bold text-accent">contributor (Author)</span>
                        <span>1 hour ago</span>
                      </div>
                      <p className="text-secondary">
                        Good point! Updated in commit <span className="font-mono text-accent font-semibold">4b2a9e</span> with case-insensitive normalization and added 2 unit tests to cover it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clickable 5: Automated CI Test Checks */}
                <div
                  onClick={() => setSelectedPrElement('ci')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPrElement('ci');
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPrElement === 'ci'}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedPrElement === 'ci'
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                      : 'border-hairline bg-surface-raised hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                      <span className="text-xs font-bold text-primary">All checks have passed</span>
                    </div>
                    <span className="text-[11px] font-mono text-tertiary">4 successful checks</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface border border-hairline/60">
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-success" aria-hidden="true" />
                        <span className="text-secondary">build-and-test / node-20</span>
                      </div>
                      <span className="text-tertiary text-[11px]">1m 24s</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface border border-hairline/60">
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-success" aria-hidden="true" />
                        <span className="text-secondary">lint / eslint src/app/resources</span>
                      </div>
                      <span className="text-tertiary text-[11px]">34s</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface border border-hairline/60">
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-success" aria-hidden="true" />
                        <span className="text-secondary">typecheck / tsc --noEmit</span>
                      </div>
                      <span className="text-tertiary text-[11px]">28s</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-2.5 rounded bg-surface border border-hairline/60">
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-success" aria-hidden="true" />
                        <span className="text-secondary">security / CodeQL &amp; audit</span>
                      </div>
                      <span className="text-tertiary text-[11px]">52s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspector Deep Dive Card (4-5 cols sticky) */}
            <aside
              aria-label="PR Element Details"
              className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4"
            >
              <div className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-hairline pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {activeElementInfo.badge}
                    </span>
                    <h3 className="text-lg font-bold text-primary mt-1">
                      {activeElementInfo.title}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    {selectedPrElement === 'title' && <Terminal size={22} />}
                    {selectedPrElement === 'linking' && <CircleDot size={22} />}
                    {selectedPrElement === 'ci' && <CheckCircle2 size={22} />}
                    {selectedPrElement === 'diff' && <FileCode size={22} />}
                    {selectedPrElement === 'threads' && <MessageSquare size={22} />}
                  </div>
                </div>

                {/* Why Maintainers Care */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Info size={14} className="text-accent" aria-hidden="true" />
                    Why Maintainers Care
                  </h4>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    {activeElementInfo.whyCare}
                  </p>
                </div>

                {/* Best Practice */}
                <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
                    <CheckCircle size={14} aria-hidden="true" />
                    Maintainer Golden Rule
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    {activeElementInfo.bestPractice}
                  </p>
                </div>

                {/* Pitfall to avoid */}
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-error flex items-center gap-1.5">
                    <AlertCircle size={14} aria-hidden="true" />
                    Common Pitfall
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    {activeElementInfo.pitfall}
                  </p>
                </div>

                {/* Quick Navigation Footer */}
                <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs">
                  <span className="text-tertiary font-mono">
                    Part {(['title', 'linking', 'diff', 'threads', 'ci'].indexOf(selectedPrElement) + 1)} of 5
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const order: PrElementId[] = ['title', 'linking', 'diff', 'threads', 'ci'];
                        const idx = order.indexOf(selectedPrElement);
                        setSelectedPrElement(order[(idx + 1) % order.length]);
                      }}
                      className="inline-flex items-center gap-1 font-bold text-accent hover:underline"
                    >
                      Next element
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* VIEW 2: ISSUE INSPECTOR */}
      {activeTab === 'issues' && (
        <div
          id="panel-issues"
          role="tabpanel"
          aria-labelledby="tab-issues"
          className="space-y-6"
        >
          {/* Section filter controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-hairline text-xs">
            <span className="text-secondary">
              Filter by report dimension to see how maintainer triage is influenced:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              {[
                { id: 'all', label: 'All Dimensions' },
                { id: 'title', label: '1. Title' },
                { id: 'repro', label: '2. Repro Steps' },
                { id: 'env', label: '3. Environment' },
                { id: 'logs', label: '4. Stack Logs' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIssueSection(item.id as typeof activeIssueSection)}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                    activeIssueSection === item.id
                      ? 'bg-accent text-white border-accent font-bold'
                      : 'bg-surface-raised border-hairline text-secondary hover:text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Effort Issue */}
            <div className="flex flex-col rounded-2xl border border-error/30 bg-surface overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-4 sm:p-5 bg-error/5 border-b border-error/20 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/15 text-error border border-error/30">
                      <XCircle size={13} aria-hidden="true" />
                      Closed as Not Planned
                    </span>
                    <span className="text-xs text-tertiary font-mono">#381</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-primary">
                    Low-Effort Issue (Often Ignored or Closed)
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-error font-semibold block">Triage Outcome</span>
                  <span className="text-xs text-secondary">Closed in 4 hours</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-4 flex-1 text-xs sm:text-sm">
                {/* Title component */}
                {(activeIssueSection === 'all' || activeIssueSection === 'title') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block font-bold">
                      Issue Title
                    </span>
                    <p className="font-bold text-error line-through">bug: app is broken please fix</p>
                    <p className="text-[11px] text-tertiary">
                      Critique: No component name, no error type, and no symptom mentioned.
                    </p>
                  </div>
                )}

                {/* Description & Repro */}
                {(activeIssueSection === 'all' || activeIssueSection === 'repro') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block font-bold">
                      Steps to Reproduce
                    </span>
                    <div className="p-3 bg-surface rounded-lg font-sans text-secondary italic">
                      &ldquo;I went to the matcher page and clicked around and everything stopped working. Fix ASAP.&rdquo;
                    </div>
                    <p className="text-[11px] text-tertiary">
                      Critique: Zero reproducible steps. Maintainers cannot know what inputs, buttons, or state triggered the failure.
                    </p>
                  </div>
                )}

                {/* Environment Info */}
                {(activeIssueSection === 'all' || activeIssueSection === 'env') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block font-bold">
                      Environment Specifications
                    </span>
                    <p className="text-secondary italic">None provided (User left template empty).</p>
                    <p className="text-[11px] text-tertiary">
                      Critique: Could be a Safari WebKit bug, Node version incompatibility, or offline network error.
                    </p>
                  </div>
                )}

                {/* Stack Logs */}
                {(activeIssueSection === 'all' || activeIssueSection === 'logs') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-tertiary block font-bold">
                      Error Logs &amp; Console Output
                    </span>
                    <p className="text-secondary italic">No screenshots or browser console logs attached.</p>
                  </div>
                )}

                {/* Maintainer Response Simulation */}
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 space-y-1 text-xs">
                  <span className="font-bold text-error flex items-center gap-1.5">
                    <AlertCircle size={14} aria-hidden="true" />
                    Maintainer Verdict
                  </span>
                  <p className="text-secondary">
                    &ldquo;Closing due to lack of reproducible information. Feel free to re-open with reproduction steps following our issue template.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* High-Value Bug Report */}
            <div className="flex flex-col rounded-2xl border border-success/30 bg-surface overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-4 sm:p-5 bg-success/5 border-b border-success/20 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      Triaged &amp; Accepted
                    </span>
                    <span className="text-xs text-tertiary font-mono">#382</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-primary">
                    High-Value Bug Report (Triaged in Minutes)
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-success font-semibold block">Triage Outcome</span>
                  <span className="text-xs text-secondary">Triaged in 8 mins</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 space-y-4 flex-1 text-xs sm:text-sm">
                {/* Title component */}
                {(activeIssueSection === 'all' || activeIssueSection === 'title') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent block font-bold">
                      Issue Title
                    </span>
                    <p className="font-bold text-primary font-mono">
                      fix(matcher): TypeError thrown when filtering by tags with URL-encoded characters
                    </p>
                    <p className="text-[11px] text-success">
                      Advantage: Names component, symptom, and triggering condition clearly.
                    </p>
                  </div>
                )}

                {/* Description & Repro */}
                {(activeIssueSection === 'all' || activeIssueSection === 'repro') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent block font-bold">
                      Steps to Reproduce
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-secondary text-xs">
                      <li>Navigate to <code className="text-primary font-mono">/matcher</code> on desktop.</li>
                      <li>In the skill input, type <code className="text-primary font-mono">C++</code> or <code className="text-primary font-mono">C#</code>.</li>
                      <li>Press <kbd className="px-1.5 py-0.5 bg-surface border border-hairline rounded font-mono text-[10px]">Enter</kbd>.</li>
                    </ol>
                    <p className="text-[11px] text-success">
                      Advantage: Anyone can reproduce this in under 30 seconds.
                    </p>
                  </div>
                )}

                {/* Environment Info */}
                {(activeIssueSection === 'all' || activeIssueSection === 'env') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent block font-bold">
                      Environment Specifications
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-secondary">
                      <div>OS: macOS Sonoma 14.5</div>
                      <div>Browser: Chrome 128</div>
                      <div>Branch: upstream/main</div>
                      <div>Commit: 7645cfa</div>
                    </div>
                  </div>
                )}

                {/* Stack Logs */}
                {(activeIssueSection === 'all' || activeIssueSection === 'logs') && (
                  <div className="space-y-1 p-3 rounded-xl bg-surface-raised border border-hairline">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent block font-bold">
                      Console Stack Trace
                    </span>
                    <pre className="overflow-x-auto p-2.5 rounded bg-surface border border-hairline font-mono text-[11px] text-error">
                      Uncaught TypeError: Cannot read properties of undefined (reading &apos;toLowerCase&apos;) at filterSkills (project-utils.ts:42)
                    </pre>
                  </div>
                )}

                {/* Maintainer Response Simulation */}
                <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 space-y-1 text-xs">
                  <span className="font-bold text-success flex items-center gap-1.5">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Maintainer Verdict
                  </span>
                  <p className="text-secondary">
                    &ldquo;Excellent reproduction! I confirmed the bug in `project-utils.ts:42`. Assigned `good first issue` label — would you like to submit the fix PR?&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: VALUE BREAKDOWN */}
      {activeTab === 'value' && (
        <div
          id="panel-value"
          role="tabpanel"
          aria-labelledby="tab-value"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Pillar 1: Harden Security */}
          <div className="flex flex-col bg-surface border border-hairline rounded-2xl p-6 transition-all duration-300 hover:border-accent/40 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent w-fit mb-4">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              Hardens Security &amp; Code Quality
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-4 flex-1">
              Pull requests create a mandatory review checkpoint before untrusted code touches production. Independent eyes catch accidental secret leaks, SQL/NoSQL injections, denial-of-service vulnerabilities, and fragile dependencies.
            </p>
            <div className="space-y-2 pt-4 border-t border-hairline text-xs font-mono">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Secret &amp; CVE scanning via CI</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Prevents unauthorized branch pushes</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Audited cryptographic commits</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Accelerates Feature Delivery */}
          <div className="flex flex-col bg-surface border border-hairline rounded-2xl p-6 transition-all duration-300 hover:border-accent/40 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent w-fit mb-4">
              <Zap size={24} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              Accelerates Feature Velocity
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-4 flex-1">
              By scoping code changes into atomic, digestible pull requests, engineering teams avoid merge conflicts and long-lived stale branches. Feature flags and preview deployments let stakeholders test functional changes before merging.
            </p>
            <div className="space-y-2 pt-4 border-t border-hairline text-xs font-mono">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>PRs under 300 lines merge 4x faster</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Automated regression verification</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Instant staging &amp; preview deployments</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Verifiable Proof-of-Work */}
          <div className="flex flex-col bg-surface border border-hairline rounded-2xl p-6 transition-all duration-300 hover:border-accent/40 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent w-fit mb-4">
              <Terminal size={24} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">
              Verifiable Proof-of-Work
            </h3>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-4 flex-1">
              Every merged pull request creates an immutable, timestamped public record. For mentorship programs like GSoC, Outreachy, and LFX, merged PRs serve as indisputable evidence of code literacy, teamwork, and problem-solving capability.
            </p>
            <div className="space-y-2 pt-4 border-t border-hairline text-xs font-mono">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Gold standard for GSoC evaluations</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Tangible portfolio showcase</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Check size={14} className="text-success" aria-hidden="true" />
                <span>Permanent open source attribution</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
