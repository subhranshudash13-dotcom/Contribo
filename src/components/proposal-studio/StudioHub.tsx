'use client';

import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck2,
  MessageSquarePlus,
  Plus,
  RefreshCw,
  Rocket,
  Sparkles,
  Star,
  Trash2,
  Wand2,
} from 'lucide-react';
import { HUB_CAPABILITIES } from './constants';
import { ProgressMeter } from './ui/ProgressMeter';
import { useProposalStudioContext } from './context/ProposalStudioContext';

export function StudioHub() {
  const {
    drafts,
    isBootstrapping,
    bootstrapError,
    isOfflineMode,
    openWorkspace,
    createDraft,
    deleteDraft,
    setIsFeedbackModalOpen,
  } = useProposalStudioContext();

  const avgProgress =
    drafts.length > 0
      ? Math.round(drafts.reduce((a, d) => a + (d.progress || 0), 0) / drafts.length)
      : 0;

  const soonestDays =
    drafts.length > 0 ? Math.min(...drafts.map((d) => d.daysLeft)) : undefined;

  // Interactive Live Hero Graphic State
  const [heroSection, setHeroSection] = useState<'summary' | 'timeline' | 'arch' | 'ai'>('arch');
  const [isScanning, setIsScanning] = useState(false);

  const triggerAiScan = () => {
    setIsScanning(true);
    setHeroSection('ai');
    setTimeout(() => setIsScanning(false), 1200);
  };

  return (
    <main className="min-h-screen w-full bg-noise">
      {/* Background ambient lighting */}
      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 py-10 sm:py-16 space-y-16">
        <div className="absolute top-12 left-1/4 w-[500px] h-[300px] bg-accent/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[250px] bg-brass/10 blur-[110px] rounded-full pointer-events-none" />

        {/* 1. Immersive Visual Split Hero */}
        <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Text & Actions */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-accent border border-accent/25">
                <Sparkles size={13} /> Proposal Studio
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-page border border-hairline px-3 py-1 font-mono text-[11px] font-semibold text-muted">
                GSoC · LFX · Outreachy Ready
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary leading-[1.1]">
              Write proposals maintainers{' '}
              <span className="bg-gradient-to-r from-accent via-brass to-accent bg-clip-text text-transparent">
                actually accept
              </span>
            </h1>

            <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-2xl font-normal">
              A focused, intelligent writing workspace for open-source program applicants — structured sections, maintainer tips, benchmarked examples, readiness audits, and 1-click Markdown export.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void createDraft()}
                className="inline-flex h-13 items-center gap-2.5 rounded-2xl bg-accent px-7 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-hover transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus size={18} /> New Proposal
              </button>
              <button
                type="button"
                onClick={() => openWorkspace(undefined, 'examples')}
                className="inline-flex h-13 items-center gap-2.5 rounded-2xl bg-surface/90 border border-hairline px-6 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary hover:bg-surface-raised transition-all cursor-pointer shadow-xs"
              >
                <Star size={16} className="text-brass" /> Browse Library
              </button>
              <button
                type="button"
                onClick={() => openWorkspace(undefined, 'guide')}
                className="inline-flex h-13 items-center gap-2.5 rounded-2xl bg-surface/90 border border-hairline px-6 font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-primary hover:bg-surface-raised transition-all cursor-pointer shadow-xs"
              >
                <BookOpen size={16} className="text-merge" /> Project Guide
              </button>
            </div>

            {/* Minimal Horizontal Stat Strip */}
            <div className="pt-6 border-t border-hairline/60 flex flex-wrap items-center gap-8 sm:gap-12 font-mono">
              <div>
                <p className="text-3xl font-extrabold text-primary tabular-nums">
                  {drafts.length}
                </p>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mt-0.5">
                  Active Drafts
                </p>
              </div>
              <div className="h-8 w-px bg-hairline/60 hidden sm:block" />
              <div>
                <p className="text-3xl font-extrabold text-primary tabular-nums">
                  {avgProgress}%
                </p>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mt-0.5">
                  Avg Progress
                </p>
              </div>
              <div className="h-8 w-px bg-hairline/60 hidden sm:block" />
              <div>
                <p className="text-3xl font-extrabold text-accent tabular-nums">
                  {soonestDays !== undefined ? `${soonestDays}d` : '—'}
                </p>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mt-0.5">
                  Next Deadline
                </p>
              </div>
            </div>
          </div>

          {/* Right Interactive Hero Graphic (Alternates Theme: Dark in Light Site, Light in Dark Site) */}
          <div className="lg:col-span-5 flex flex-col justify-center h-full">
            <div className="relative w-full rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 font-mono text-xs overflow-hidden backdrop-blur-md transition-all duration-300 bg-[#160F0C] border-[#382A24] text-[#FBF9F6] dark:bg-[#FFFFFF] dark:border-[#E6DFD5] dark:text-[#160F0C]">
              {/* Window Bar */}
              <div className="flex items-center justify-between border-b border-[#382A24] dark:border-[#E6DFD5] pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-error/70 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-warning/70 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-success/70 inline-block" />
                  </div>
                  <span className="text-[11px] font-bold text-[#A0928A] dark:text-[#6E615A] ml-2">
                    proposal-draft-gsoc2026.md
                  </span>
                </div>
                <button
                  type="button"
                  onClick={triggerAiScan}
                  className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/15 px-3 py-1 text-[10px] font-bold uppercase text-success hover:bg-success/25 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={12} /> Score: 94/100
                </button>
              </div>

              {/* Proposal Interactive Code Snippet Preview */}
              <div className="space-y-3.5 font-mono text-xs leading-relaxed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#E59569] dark:text-[#C67848]">
                    <FileCheck2 size={15} />
                    <span>
                      {heroSection === 'summary' && '## 01. Executive Summary & Goals'}
                      {heroSection === 'timeline' && '## 02. Milestones & Timeline'}
                      {heroSection === 'arch' && '## 03. Architecture & Data Pipeline'}
                      {heroSection === 'ai' && '## 04. AI Section Quality Audit'}
                    </span>
                  </div>

                  {isScanning && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-accent animate-pulse">
                      <RefreshCw size={11} className="animate-spin" /> Scanning
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#241A16] border border-[#382A24] dark:bg-[#F6F4F0] dark:border-[#E6DFD5] space-y-2">
                  <p className="text-[11px] text-[#D8CDC6] dark:text-[#52443D]">
                    <span className="text-[#E59569] dark:text-[#C67848] font-bold">
                      @maintainer_tip:
                    </span>{' '}
                    {heroSection === 'summary' && 'Keep value proposition clear and quantify expected maintainer impact.'}
                    {heroSection === 'timeline' && 'Include 2-week review buffers before midterm and final evaluation.'}
                    {heroSection === 'arch' && 'Mentors prefer explicit test coverage metrics & non-blocking execution models.'}
                    {heroSection === 'ai' && '94% Match: Strong technical depth, complete timeline, and verified tests.'}
                  </p>
                  <code className="block text-[11px] bg-[#100A08] border border-[#382A24] text-[#E59569] dark:bg-[#FFFFFF] dark:border-[#E6DFD5] dark:text-[#C67848] p-3 rounded-xl font-mono">
                    {heroSection === 'summary' && 'const goal = "Build resilient async data pipeline with 99.9% uptime";'}
                    {heroSection === 'timeline' && 'const timeline = [{ week: "1-4", milestone: "Core REST Endpoints" }];'}
                    {heroSection === 'arch' && 'export async function executePipeline(task: TaskConfig): Promise<Status>'}
                    {heroSection === 'ai' && 'const auditResult = { score: 94, readiness: "High", testCoverage: "95%" };'}
                  </code>
                </div>

                {/* Clickable Interactive Section Tabs */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setHeroSection('summary')}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all cursor-pointer ${
                      heroSection === 'summary'
                        ? 'bg-accent text-white border-accent font-bold'
                        : 'bg-[#241A16] border-[#382A24] text-[#D8CDC6] dark:bg-[#F6F4F0] dark:border-[#E6DFD5] dark:text-[#52443D] hover:border-accent/40'
                    }`}
                  >
                    <CheckCircle2 size={13} className={heroSection === 'summary' ? 'text-white' : 'text-success'} />
                    <span className="truncate">01. Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroSection('timeline')}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all cursor-pointer ${
                      heroSection === 'timeline'
                        ? 'bg-accent text-white border-accent font-bold'
                        : 'bg-[#241A16] border-[#382A24] text-[#D8CDC6] dark:bg-[#F6F4F0] dark:border-[#E6DFD5] dark:text-[#52443D] hover:border-accent/40'
                    }`}
                  >
                    <CheckCircle2 size={13} className={heroSection === 'timeline' ? 'text-white' : 'text-success'} />
                    <span className="truncate">02. Timeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroSection('arch')}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all cursor-pointer ${
                      heroSection === 'arch'
                        ? 'bg-accent text-white border-accent font-bold'
                        : 'bg-[#241A16] border-[#382A24] text-[#D8CDC6] dark:bg-[#F6F4F0] dark:border-[#E6DFD5] dark:text-[#52443D] hover:border-accent/40'
                    }`}
                  >
                    <CheckCircle2 size={13} className={heroSection === 'arch' ? 'text-white' : 'text-success'} />
                    <span className="truncate">03. Deliverables</span>
                  </button>

                  <button
                    type="button"
                    onClick={triggerAiScan}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all cursor-pointer ${
                      heroSection === 'ai'
                        ? 'bg-accent text-white border-accent font-bold'
                        : 'bg-accent/15 border-accent/40 text-accent font-bold hover:bg-accent/25'
                    }`}
                  >
                    <Wand2 size={13} className={isScanning ? 'animate-spin' : 'animate-pulse'} />
                    <span className="truncate">04. Run AI Scan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Visual Step-by-Step Proposal Process */}
        <section className="pt-6 border-t border-hairline/60 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
              How It Works
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
              From Draft to Submitted Proposal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select Target Org',
                desc: 'Pick your GSoC/LFX project and fetch official maintainer specifications.',
                icon: Rocket,
              },
              {
                step: '02',
                title: 'Fill 8 Guided Sections',
                desc: 'Write technical architecture, timeline, and deliverables with live hints.',
                icon: FileCheck2,
              },
              {
                step: '03',
                title: 'Run AI Audit',
                desc: 'Scan proposal depth, verify test coverage, and catch missing criteria.',
                icon: Wand2,
              },
              {
                step: '04',
                title: 'Export & Submit',
                desc: 'Generate clean Markdown for official application portals.',
                icon: CheckCircle2,
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="space-y-3 border-l-2 border-accent/40 pl-5 transition-all hover:border-accent"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
                      {st.step}
                    </span>
                    <Icon size={16} className="text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-primary">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Capability Highlights */}
        <section className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HUB_CAPABILITIES.map((cap: { title: string; body: string }, i: number) => (
              <div
                key={cap.title}
                className="space-y-2 border-l-2 border-brass/40 pl-5 transition-colors hover:border-brass"
              >
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-brass">
                  Feature 0{i + 1}
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-primary">
                  {cap.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {cap.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Active Drafts List View */}
        <section className="space-y-6 pt-4 border-t border-hairline/60">
          <div className="flex items-center justify-between border-b border-hairline/80 pb-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
                Workspace
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                Active Drafts
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void createDraft()}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 font-mono text-xs font-bold uppercase tracking-wide text-white hover:bg-accent-hover transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Start New Draft
            </button>
          </div>

          {bootstrapError && (
            <div
              role="status"
              className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                isOfflineMode
                  ? 'border-alert/30 bg-alert/5 text-alert'
                  : 'border-hairline bg-page text-muted'
              }`}
            >
              {bootstrapError}
            </div>
          )}

          {isBootstrapping ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading drafts">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface/50" />
              ))}
              <p className="text-xs font-mono text-muted uppercase tracking-wide">
                Loading your drafts…
              </p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-heading text-xl font-bold text-primary">
                No active proposal drafts yet
              </p>
              <p className="text-sm text-secondary max-w-md mx-auto">
                Start a fresh proposal workspace or import structure directly from our library of accepted GSoC/LFX applications.
              </p>
              <button
                type="button"
                onClick={() => void createDraft()}
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 font-mono text-xs font-bold uppercase tracking-wide text-white hover:bg-accent-hover transition-all cursor-pointer"
              >
                <Plus size={14} /> Create First Draft
              </button>
            </div>
          ) : (
            <div className="divide-y divide-hairline/60">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 px-3 rounded-2xl hover:bg-surface/80 transition-all"
                >
                  {/* Left Metadata */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="rounded-full bg-accent/10 border border-accent/25 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase text-accent">
                        {d.programName}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-muted">
                        <Clock size={13} /> {d.daysLeft}d left
                      </span>
                    </div>

                    <h3 className="font-heading text-lg sm:text-xl font-bold text-primary group-hover:text-accent transition-colors truncate">
                      {d.projectTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary font-mono">
                      {d.orgName} <span className="text-muted">·</span> Mentor: {d.mentorName}
                    </p>
                  </div>

                  {/* Right Progress & Action */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-36 sm:w-44">
                      <ProgressMeter value={d.progress} size="sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete draft “${d.projectTitle}”? This cannot be undone.`
                            )
                          ) {
                            void deleteDraft(d.id);
                          }
                        }}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-hairline bg-surface text-muted hover:text-error hover:border-error/40 hover:bg-error/5 transition-all cursor-pointer"
                        title="Delete draft"
                        aria-label={`Delete draft ${d.projectTitle}`}
                      >
                        <Trash2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openWorkspace(d.id, 'builder')}
                        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-surface border border-hairline px-4 font-mono text-xs font-bold uppercase tracking-wide text-primary hover:bg-accent hover:text-white hover:border-accent transition-all cursor-pointer shadow-xs group-hover:shadow-md"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. Minimal Community Feedback Row */}
        <section className="pt-8 border-t border-hairline/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
              Community Driven
            </p>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-primary">
              Missing a program or sample proposal?
            </h3>
            <p className="text-sm text-secondary">
              Request indexing for a mentorship program or suggest library additions directly to our maintainers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-hairline bg-surface px-5 font-mono text-xs font-bold uppercase tracking-wide text-primary hover:bg-surface-raised transition-all cursor-pointer"
          >
            <MessageSquarePlus size={15} className="text-accent" />
            <span>Send Feedback</span>
          </button>
        </section>
      </div>
    </main>
  );
}
