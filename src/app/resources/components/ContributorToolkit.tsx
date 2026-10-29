'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Copy,
  Check,
  GitPullRequest,
  MessageSquareQuote,
  Terminal,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  GitCommit,
  GitBranch,
  Layers,
} from 'lucide-react';
import {
  COMMIT_TYPES,
  GIT_CHEATSHEET,
  formatConventionalCommit,
  generatePrDescription,
  generateIssueClaim,
} from '@/lib/contributor-toolkit.mjs';

function useCopy(timeout = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, id: string = 'default') => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.left = '-999999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        setCopiedId(id);
        setTimeout(() => {
          setCopiedId((current) => (current === id ? null : current));
        }, timeout);
        return true;
      } catch {
        return false;
      }
    },
    [timeout]
  );

  return { copiedId, copy };
}

const PROGRAM_OPTIONS = [
  'General',
  'NSoC 2026',
  'GSoC (Google Summer of Code)',
  'LFX Mentorship',
  'Outreachy',
  'Hacktoberfest',
];

export function ContributorToolkit() {
  const [activeTab, setActiveTab] = useState<'pr' | 'claim' | 'git'>('pr');
  const { copiedId, copy } = useCopy(2000);

  // Tab 1: PR Generator State
  const [prType, setPrType] = useState('feat');
  const [prScope, setPrScope] = useState('');
  const [prIssue, setPrIssue] = useState('');
  const [prTitle, setPrTitle] = useState('');
  const [prSummary, setPrSummary] = useState('');
  const [prTestSteps, setPrTestSteps] = useState('');
  const [prIsBreaking, setPrIsBreaking] = useState(false);
  const [prBreakingDetails, setPrBreakingDetails] = useState('');
  const [prChecklist, setPrChecklist] = useState({
    codeStyle: true,
    selfReview: true,
    commented: false,
    noWarnings: true,
    testsAdded: true,
  });

  // Tab 2: Issue Claim State
  const [claimIssue, setClaimIssue] = useState('');
  const [claimProgram, setClaimProgram] = useState('NSoC 2026');
  const [claimMaintainer, setClaimMaintainer] = useState('');
  const [claimRepro, setClaimRepro] = useState('');
  const [claimSolution, setClaimSolution] = useState('');
  const [claimTimeline, setClaimTimeline] = useState('');

  // Tab 3: Commit Builder State
  const [commitType, setCommitType] = useState('feat');
  const [commitScope, setCommitScope] = useState('');
  const [commitDesc, setCommitDesc] = useState('');
  const [commitIsBreaking, setCommitIsBreaking] = useState(false);

  // Generated Markdown outputs
  const generatedPrMarkdown = useMemo(() => {
    return generatePrDescription({
      type: prType,
      scope: prScope,
      issueNumber: prIssue,
      title: prTitle,
      summary: prSummary,
      testSteps: prTestSteps,
      isBreaking: prIsBreaking,
      breakingDetails: prBreakingDetails,
      checklist: prChecklist,
    });
  }, [
    prType,
    prScope,
    prIssue,
    prTitle,
    prSummary,
    prTestSteps,
    prIsBreaking,
    prBreakingDetails,
    prChecklist,
  ]);

  const generatedClaimMarkdown = useMemo(() => {
    return generateIssueClaim({
      issueNumber: claimIssue,
      reproduction: claimRepro,
      proposedSolution: claimSolution,
      timeline: claimTimeline,
      program: claimProgram,
      maintainerHandle: claimMaintainer,
    });
  }, [
    claimIssue,
    claimRepro,
    claimSolution,
    claimTimeline,
    claimProgram,
    claimMaintainer,
  ]);

  const generatedCommit = useMemo(() => {
    return formatConventionalCommit({
      type: commitType,
      scope: commitScope,
      description: commitDesc || 'brief description of your change',
      isBreaking: commitIsBreaking,
    });
  }, [commitType, commitScope, commitDesc, commitIsBreaking]);

  // Example Loader Handlers
  const loadPrExample = () => {
    setPrType('feat');
    setPrScope('resources');
    setPrIssue('99');
    setPrTitle('Build Contributor Action Toolkit with PR Description Generator');
    setPrSummary(
      'Adds a dedicated Contributor Action Toolkit featuring:\n- GitHub PR Description Generator with commit type, issue linking, and markdown preview.\n- Issue Claim Crafter for polite, high-converting claim comments.\n- Conventional Commits and Git Cheatsheet with 1-click clipboard copying.'
    );
    setPrTestSteps(
      '1. Ran `npm test` - all 102 tests pass.\n2. Ran `npm run lint` - 0 warnings / 0 errors.\n3. Verified responsiveness and copy buttons in both light and dark themes.'
    );
    setPrIsBreaking(false);
    setPrBreakingDetails('');
    setPrChecklist({
      codeStyle: true,
      selfReview: true,
      commented: true,
      noWarnings: true,
      testsAdded: true,
    });
  };

  const resetPrForm = () => {
    setPrType('feat');
    setPrScope('');
    setPrIssue('');
    setPrTitle('');
    setPrSummary('');
    setPrTestSteps('');
    setPrIsBreaking(false);
    setPrBreakingDetails('');
    setPrChecklist({
      codeStyle: true,
      selfReview: true,
      commented: false,
      noWarnings: true,
      testsAdded: true,
    });
  };

  const loadClaimBugExample = () => {
    setClaimIssue('100');
    setClaimProgram('NSoC 2026');
    setClaimMaintainer('subhranshudash13-dotcom');
    setClaimRepro(
      'I inspected the component and confirmed that dark-mode contrast is below WCAG AAA on high-DPI displays. Running `npm run lint` also flagged an unhandled state in the fallback handler.'
    );
    setClaimSolution(
      '1. Update the CSS class definitions to use semantic `text-primary` and `border-hairline`.\n2. Add test coverage in `tests/` verifying all contrast and fallback branches.\n3. Verify across both light and dark themes.'
    );
    setClaimTimeline(
      'I have 2+ years of TypeScript and Next.js experience and can have a well-documented PR ready for review within 24-48 hours.'
    );
  };

  const loadClaimFeatureExample = () => {
    setClaimIssue('99');
    setClaimProgram('NSoC 2026');
    setClaimMaintainer('subhranshudash13-dotcom');
    setClaimRepro(
      'First-time contributors often struggle with commenting effectively on issues (frequently posting "Assign me" without context or plan) and formatting PRs properly.'
    );
    setClaimSolution(
      '1. Create `src/app/resources/components/ContributorToolkit.tsx` with PR Generator, Issue Claim Crafter, and Git Cheatsheet.\n2. Implement 1-click clipboard copying with visual feedback.\n3. Integrate into `ResourcesClient.tsx` and write unit tests.'
    );
    setClaimTimeline(
      'I am participating in NSoC 2026 and have hands-on experience building interactive React/Tailwind UI tools. I will submit a clean PR within 2 days.'
    );
  };

  return (
    <section aria-labelledby="toolkit-heading">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-1.5 bg-accent rounded-full" />
        <h2 id="toolkit-heading" className="text-2xl font-bold text-primary">
          Contributor Action Toolkit
        </h2>
      </div>
      <p className="text-sm text-secondary mb-8 max-w-2xl">
        Practical generators to help you communicate like a senior open-source contributor. Craft clean PR descriptions, write high-converting issue claims, and copy essential Git commands in one click.
      </p>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Toolkit tools"
        className="flex flex-wrap gap-2 p-1.5 bg-surface border border-hairline rounded-2xl mb-8 max-w-fit"
      >
        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'pr'}
          onClick={() => setActiveTab('pr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'pr'
              ? 'bg-accent text-white shadow-sm'
              : 'text-secondary hover:text-primary hover:bg-surface-raised'
          }`}
        >
          <GitPullRequest size={16} />
          <span>PR Description Generator</span>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'claim'}
          onClick={() => setActiveTab('claim')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'claim'
              ? 'bg-accent text-white shadow-sm'
              : 'text-secondary hover:text-primary hover:bg-surface-raised'
          }`}
        >
          <MessageSquareQuote size={16} />
          <span>Issue Claim Crafter</span>
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTab === 'git'}
          onClick={() => setActiveTab('git')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'git'
              ? 'bg-accent text-white shadow-sm'
              : 'text-secondary hover:text-primary hover:bg-surface-raised'
          }`}
        >
          <Terminal size={16} />
          <span>Git & Commits Cheatsheet</span>
        </button>
      </div>

      {/* TAB 1: PR Description Generator */}
      {activeTab === 'pr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Side */}
          <div className="lg:col-span-6 bg-surface border border-hairline rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles size={16} className="text-accent" />
                <span>PR Configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPrExample}
                  className="text-xs font-semibold text-accent hover:underline px-2 py-1 rounded"
                >
                  Load Example
                </button>
                <button
                  type="button"
                  onClick={resetPrForm}
                  className="text-xs text-secondary hover:text-primary p-1 rounded hover:bg-surface-raised transition-colors"
                  title="Reset form"
                  aria-label="Reset form"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Commit Type */}
            <div>
              <label htmlFor="pr-type" className="block text-xs font-bold text-primary mb-2">
                Change Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" id="pr-type">
                {COMMIT_TYPES.map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setPrType(t.type)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border text-left transition-colors flex items-center justify-between ${
                      prType === t.type
                        ? 'bg-accent/15 border-accent text-accent font-bold'
                        : 'bg-surface-raised border-hairline text-secondary hover:border-tertiary'
                    }`}
                  >
                    <span>{t.type}</span>
                    <span className="text-[10px] opacity-75">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope & Issue Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pr-scope" className="block text-xs font-bold text-primary mb-1.5">
                  Scope <span className="font-normal text-tertiary">(optional)</span>
                </label>
                <input
                  id="pr-scope"
                  type="text"
                  value={prScope}
                  onChange={(e) => setPrScope(e.target.value)}
                  placeholder="e.g. resources, auth, ui"
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label htmlFor="pr-issue" className="block text-xs font-bold text-primary mb-1.5">
                  Linked Issue Number
                </label>
                <input
                  id="pr-issue"
                  type="text"
                  value={prIssue}
                  onChange={(e) => setPrIssue(e.target.value)}
                  placeholder="e.g. 99 or #99"
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Title / Summary */}
            <div>
              <label htmlFor="pr-title" className="block text-xs font-bold text-primary mb-1.5">
                PR Title / Commit Headline
              </label>
              <input
                id="pr-title"
                type="text"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                placeholder="e.g. Build Contributor Action Toolkit with PR Description Generator"
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>

            {/* Summary / Description */}
            <div>
              <label htmlFor="pr-summary" className="block text-xs font-bold text-primary mb-1.5">
                Summary of Changes
              </label>
              <textarea
                id="pr-summary"
                rows={3}
                value={prSummary}
                onChange={(e) => setPrSummary(e.target.value)}
                placeholder="Explain what this PR introduces and why..."
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent resize-y"
              />
            </div>

            {/* Test Steps */}
            <div>
              <label htmlFor="pr-test-steps" className="block text-xs font-bold text-primary mb-1.5">
                How Has This Been Tested?
              </label>
              <textarea
                id="pr-test-steps"
                rows={2}
                value={prTestSteps}
                onChange={(e) => setPrTestSteps(e.target.value)}
                placeholder="Commands run (e.g. npm test, npm run lint), environments, manual checks..."
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent resize-y"
              />
            </div>

            {/* Breaking Change Toggle */}
            <div className="pt-2 border-t border-hairline">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prIsBreaking}
                  onChange={(e) => setPrIsBreaking(e.target.checked)}
                  className="rounded border-hairline text-accent focus:ring-accent w-4 h-4"
                />
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <AlertTriangle size={14} className={prIsBreaking ? 'text-error' : 'text-tertiary'} />
                  Contains Breaking Changes
                </span>
              </label>

              {prIsBreaking && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={prBreakingDetails}
                    onChange={(e) => setPrBreakingDetails(e.target.value)}
                    placeholder="Describe what breaks and any migration steps..."
                    className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-error/40 text-xs text-primary focus:outline-none focus:border-error"
                  />
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="pt-2 border-t border-hairline">
              <span className="block text-xs font-bold text-primary mb-2">
                Pre-flight Checklist Items
              </span>
              <div className="space-y-1.5">
                {[
                  { key: 'codeStyle', label: 'Code conforms to project formatting and conventions' },
                  { key: 'selfReview', label: 'Performed self-review of all modified lines' },
                  { key: 'commented', label: 'Added comments for complex or non-obvious logic' },
                  { key: 'noWarnings', label: 'Zero new linter or compiler warnings' },
                  { key: 'testsAdded', label: 'Added/updated unit tests verifying changes' },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={prChecklist[item.key as keyof typeof prChecklist]}
                      onChange={(e) =>
                        setPrChecklist({
                          ...prChecklist,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="rounded border-hairline text-accent focus:ring-accent mt-0.5 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] sm:text-xs text-secondary leading-tight">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Preview Side */}
          <div className="lg:col-span-6 bg-surface border border-hairline rounded-2xl p-5 sm:p-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-md">
                  LIVE PREVIEW
                </span>
                <span className="text-xs text-tertiary">Real-time Markdown</span>
              </div>

              <button
                type="button"
                onClick={() => copy(generatedPrMarkdown, 'pr-markdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  copiedId === 'pr-markdown'
                    ? 'bg-success text-white'
                    : 'bg-accent text-white hover:bg-accent-hover'
                }`}
                aria-label="Copy PR description markdown to clipboard"
              >
                {copiedId === 'pr-markdown' ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy PR Description</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="overflow-x-auto rounded-xl border border-hairline bg-surface-raised p-4 font-mono text-xs leading-relaxed text-secondary max-h-[560px] whitespace-pre-wrap select-all">
                {generatedPrMarkdown}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-tertiary pt-3 border-t border-hairline">
              <span>Ready to paste directly into GitHub Pull Request text area.</span>
              <span className="font-mono">{generatedPrMarkdown.length} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Issue Claim Crafter */}
      {activeTab === 'claim' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Side */}
          <div className="lg:col-span-6 bg-surface border border-hairline rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-hairline">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <MessageSquareQuote size={16} className="text-brass" />
                <span>Issue Claim Inputs</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadClaimBugExample}
                  className="text-xs font-semibold text-brass hover:underline px-2 py-0.5 rounded"
                >
                  Bug Fix Preset
                </button>
                <button
                  type="button"
                  onClick={loadClaimFeatureExample}
                  className="text-xs font-semibold text-accent hover:underline px-2 py-0.5 rounded"
                >
                  Feature Preset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="claim-issue" className="block text-xs font-bold text-primary mb-1.5">
                  Issue Number
                </label>
                <input
                  id="claim-issue"
                  type="text"
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  placeholder="e.g. 99"
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label htmlFor="claim-program" className="block text-xs font-bold text-primary mb-1.5">
                  Mentorship Program
                </label>
                <select
                  id="claim-program"
                  value={claimProgram}
                  onChange={(e) => setClaimProgram(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                >
                  {PROGRAM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="claim-maintainer" className="block text-xs font-bold text-primary mb-1.5">
                  Maintainer @Handle <span className="font-normal text-tertiary">(opt)</span>
                </label>
                <input
                  id="claim-maintainer"
                  type="text"
                  value={claimMaintainer}
                  onChange={(e) => setClaimMaintainer(e.target.value)}
                  placeholder="e.g. subhranshudash13"
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Reproduction & Verification */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="claim-repro" className="text-xs font-bold text-primary">
                  1. Reproduction & Verification Evidence
                </label>
                <span className="text-[11px] text-tertiary">Prove you looked at the code</span>
              </div>
              <textarea
                id="claim-repro"
                rows={3}
                value={claimRepro}
                onChange={(e) => setClaimRepro(e.target.value)}
                placeholder="State how you verified the issue, relevant files, or reproduction steps..."
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent resize-y"
              />
            </div>

            {/* Proposed Solution */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="claim-solution" className="text-xs font-bold text-primary">
                  2. Proposed Solution & Technical Approach
                </label>
                <span className="text-[11px] text-tertiary">Step-by-step plan</span>
              </div>
              <textarea
                id="claim-solution"
                rows={4}
                value={claimSolution}
                onChange={(e) => setClaimSolution(e.target.value)}
                placeholder="1. Modify the file...\n2. Add helper function...\n3. Add unit tests and verify."
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent resize-y"
              />
            </div>

            {/* Timeline & Experience */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="claim-timeline" className="text-xs font-bold text-primary">
                  3. Timeline & Relevant Experience
                </label>
                <span className="text-[11px] text-tertiary">Sets clear expectations</span>
              </div>
              <input
                id="claim-timeline"
                type="text"
                value={claimTimeline}
                onChange={(e) => setClaimTimeline(e.target.value)}
                placeholder="e.g. I have experience with TypeScript & React, can submit PR within 2 days."
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="p-3 bg-accent/5 border border-accent/15 rounded-xl text-xs text-secondary leading-relaxed">
              <strong className="text-primary block mb-0.5">Maintainer Tip:</strong>
              Maintainers are 10x more likely to assign an issue when you provide an actionable implementation outline rather than a generic &ldquo;Please assign me&rdquo;.
            </div>
          </div>

          {/* Live Preview Side */}
          <div className="lg:col-span-6 bg-surface border border-hairline rounded-2xl p-5 sm:p-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brass bg-brass/10 border border-brass/20 px-2.5 py-1 rounded-md">
                  COMMENT PREVIEW
                </span>
                <span className="text-xs text-tertiary">GitHub Issue Comment</span>
              </div>

              <button
                type="button"
                onClick={() => copy(generatedClaimMarkdown, 'claim-markdown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  copiedId === 'claim-markdown'
                    ? 'bg-success text-white'
                    : 'bg-brass text-black hover:bg-brass-hover'
                }`}
                aria-label="Copy issue claim comment to clipboard"
              >
                {copiedId === 'claim-markdown' ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Comment</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="overflow-x-auto rounded-xl border border-hairline bg-surface-raised p-4 font-mono text-xs leading-relaxed text-secondary max-h-[560px] whitespace-pre-wrap select-all">
                {generatedClaimMarkdown}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-tertiary pt-3 border-t border-hairline">
              <span>Paste into the comment box of the issue you wish to claim.</span>
              <span className="font-mono">{generatedClaimMarkdown.length} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Git & Commit Cheatsheet */}
      {activeTab === 'git' && (
        <div className="space-y-8">
          {/* Interactive Conventional Commit Builder */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-4">
              <GitCommit size={18} className="text-accent" />
              <span>Interactive Conventional Commit Builder</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
              <div className="md:col-span-3">
                <label htmlFor="commit-type" className="block text-xs font-bold text-primary mb-1.5">
                  Type
                </label>
                <select
                  id="commit-type"
                  value={commitType}
                  onChange={(e) => setCommitType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary font-mono focus:outline-none focus:border-accent"
                >
                  {COMMIT_TYPES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.type} — {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label htmlFor="commit-scope" className="block text-xs font-bold text-primary mb-1.5">
                  Scope <span className="font-normal text-tertiary">(optional)</span>
                </label>
                <input
                  id="commit-scope"
                  type="text"
                  value={commitScope}
                  onChange={(e) => setCommitScope(e.target.value)}
                  placeholder="e.g. resources"
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="md:col-span-4">
                <label htmlFor="commit-desc" className="block text-xs font-bold text-primary mb-1.5">
                  Short Description
                </label>
                <input
                  id="commit-desc"
                  type="text"
                  value={commitDesc}
                  onChange={(e) => setCommitDesc(e.target.value)}
                  placeholder="imperative mood, e.g. add action toolkit"
                  className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-hairline text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="md:col-span-2 flex items-center h-10">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={commitIsBreaking}
                    onChange={(e) => setCommitIsBreaking(e.target.checked)}
                    className="rounded border-hairline text-error focus:ring-error w-4 h-4"
                  />
                  <span className="text-xs font-bold text-primary">Breaking (!)</span>
                </label>
              </div>
            </div>

            {/* Generated Commit Output */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-surface-raised border border-hairline rounded-xl">
              <div className="font-mono text-xs sm:text-sm text-primary break-all select-all flex items-center gap-2">
                <span className="text-tertiary select-none">$</span>
                <span className="font-bold text-accent">{generatedCommit}</span>
              </div>

              <button
                type="button"
                onClick={() => copy(generatedCommit, 'commit-headline')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  copiedId === 'commit-headline'
                    ? 'bg-success text-white'
                    : 'bg-surface border border-hairline text-primary hover:border-tertiary'
                }`}
                aria-label="Copy conventional commit headline"
              >
                {copiedId === 'commit-headline' ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Commit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Categorized Git Commands */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GIT_CHEATSHEET.map((category) => (
              <div
                key={category.category}
                className="bg-surface border border-hairline rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <GitBranch size={16} className="text-brass" />
                  <h3 className="text-sm font-bold text-primary">{category.category}</h3>
                </div>
                <p className="text-xs text-secondary mb-4">{category.description}</p>

                <div className="space-y-3 mt-auto">
                  {category.commands.map((c, idx) => {
                    const buttonId = `git-cmd-${category.category}-${idx}`;
                    return (
                      <div
                        key={c.cmd}
                        className="bg-surface-raised border border-hairline rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-[11px] sm:text-xs text-primary font-bold break-all select-all">
                            {c.cmd}
                          </code>
                          <button
                            type="button"
                            onClick={() => copy(c.cmd, buttonId)}
                            className={`p-1.5 rounded-md transition-colors shrink-0 ${
                              copiedId === buttonId
                                ? 'bg-success text-white'
                                : 'text-secondary hover:text-primary hover:bg-surface'
                            }`}
                            title="Copy command"
                            aria-label={`Copy command ${c.cmd}`}
                          >
                            {copiedId === buttonId ? (
                              <Check size={13} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-tertiary leading-snug">{c.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Commit Types Reference Table */}
          <div className="bg-surface border border-hairline rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary font-bold text-sm mb-4">
              <Layers size={16} className="text-accent" />
              <span>Conventional Commit Types Quick Reference</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {COMMIT_TYPES.map((t) => (
                <div
                  key={t.type}
                  className="bg-surface-raised border border-hairline rounded-xl p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-accent">
                      {t.type}
                    </span>
                    <span className="text-[10px] text-tertiary uppercase tracking-wider font-semibold">
                      {t.label}
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-snug">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
