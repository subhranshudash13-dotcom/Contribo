'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  ROADMAP_TRACKS,
  countTrackChecklistItems,
  type RoadmapStage,
  type RoadmapTrack,
  type TrackAccent,
} from './data';

const STORAGE_KEY = 'contribo_roadmap_v2';

interface TrackProgress {
  checkedItems: Record<string, string[]>;
}

type ProgressMap = Record<string, TrackProgress>;

const ACCENT_STYLES: Record<
  TrackAccent,
  {
    border: string;
    bg: string;
    text: string;
    soft: string;
    ring: string;
    bar: string;
    chip: string;
  }
> = {
  accent: {
    border: 'border-accent',
    bg: 'bg-accent',
    text: 'text-accent',
    soft: 'bg-accent/10',
    ring: 'ring-accent',
    bar: 'bg-accent',
    chip: 'border-accent/30 bg-accent/10 text-accent',
  },
  brass: {
    border: 'border-brass',
    bg: 'bg-brass',
    text: 'text-brass',
    soft: 'bg-brass/10',
    ring: 'ring-brass',
    bar: 'bg-brass',
    chip: 'border-brass/30 bg-brass/10 text-brass',
  },
  merge: {
    border: 'border-merge',
    bg: 'bg-merge',
    text: 'text-merge',
    soft: 'bg-merge/10',
    ring: 'ring-merge',
    bar: 'bg-merge',
    chip: 'border-merge/30 bg-merge/10 text-merge',
  },
  success: {
    border: 'border-success',
    bg: 'bg-success',
    text: 'text-success',
    soft: 'bg-success/10',
    ring: 'ring-success',
    bar: 'bg-success',
    chip: 'border-success/30 bg-success/10 text-success',
  },
};

function emptyProgress(): ProgressMap {
  return {};
}

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === 'object' ? parsed : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveProgress(map: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function itemKey(text: string, index: number) {
  return `${index}:${text}`;
}

export default function RoadmapsClient() {
  const searchParams = useSearchParams();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [activeTrackId, setActiveTrackId] = useState(() => ROADMAP_TRACKS[0].id);
  const [activeStageId, setActiveStageId] = useState(() => ROADMAP_TRACKS[0].stages[0].id);
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());

  // Synchronize track selection from URL search params when changed
  const queryTrack = searchParams.get('track');
  const [prevQueryTrack, setPrevQueryTrack] = useState(queryTrack);

  if (queryTrack !== prevQueryTrack) {
    setPrevQueryTrack(queryTrack);
    if (queryTrack && ROADMAP_TRACKS.some((t) => t.id === queryTrack) && queryTrack !== activeTrackId) {
      setActiveTrackId(queryTrack);
      const track = ROADMAP_TRACKS.find((t) => t.id === queryTrack)!;
      setActiveStageId(track.stages[0].id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('contribo_roadmap_active_track', queryTrack);
      }
    }
  }

  const activeTrack = useMemo(
    () => ROADMAP_TRACKS.find((t) => t.id === activeTrackId) ?? ROADMAP_TRACKS[0],
    [activeTrackId]
  );

  const activeStage = useMemo(() => {
    return (
      activeTrack.stages.find((s) => s.id === activeStageId) ?? activeTrack.stages[0]
    );
  }, [activeTrack, activeStageId]);

  const accent = ACCENT_STYLES[activeTrack.accent];
  const StageIcon = activeStage.icon;

  const selectTrack = useCallback((track: RoadmapTrack) => {
    setActiveTrackId(track.id);
    setActiveStageId(track.stages[0].id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('contribo_roadmap_active_track', track.id);
      const url = new URL(window.location.href);
      url.searchParams.set('track', track.id);
      window.history.replaceState({}, '', `${url.pathname}?track=${track.id}`);
    }
  }, []);

  const trackChecked = progress[activeTrack.id]?.checkedItems ?? {};

  const { checkedCount, totalCount, percent, stageCompleteMap } = useMemo(() => {
    let checked = 0;
    const total = countTrackChecklistItems(activeTrack);
    const stageMap: Record<string, boolean> = {};

    for (const stage of activeTrack.stages) {
      const keys = stage.checklist.map((text, i) => itemKey(text, i));
      const done = trackChecked[stage.id] ?? [];
      const stageChecked = keys.filter((k) => done.includes(k)).length;
      checked += stageChecked;
      stageMap[stage.id] = keys.length > 0 && stageChecked === keys.length;
    }

    return {
      checkedCount: checked,
      totalCount: total,
      percent: total === 0 ? 0 : Math.round((checked / total) * 100),
      stageCompleteMap: stageMap,
    };
  }, [activeTrack, trackChecked]);

  const toggleChecklistItem = (stage: RoadmapStage, text: string, index: number) => {
    const key = itemKey(text, index);
    setProgress((prev) => {
      const trackProg = prev[activeTrack.id] ?? { checkedItems: {} };
      const current = trackProg.checkedItems[stage.id] ?? [];
      const nextItems = current.includes(key)
        ? current.filter((x) => x !== key)
        : [...current, key];

      const next: ProgressMap = {
        ...prev,
        [activeTrack.id]: {
          checkedItems: {
            ...trackProg.checkedItems,
            [stage.id]: nextItems,
          },
        },
      };
      saveProgress(next);
      return next;
    });
  };

  const markStageComplete = (stage: RoadmapStage) => {
    const allKeys = stage.checklist.map((text, i) => itemKey(text, i));
    setProgress((prev) => {
      const trackProg = prev[activeTrack.id] ?? { checkedItems: {} };
      const next: ProgressMap = {
        ...prev,
        [activeTrack.id]: {
          checkedItems: {
            ...trackProg.checkedItems,
            [stage.id]: allKeys,
          },
        },
      };
      saveProgress(next);
      return next;
    });
  };

  const resetTrackProgress = () => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[activeTrack.id];
      saveProgress(next);
      return next;
    });
  };

  const isItemChecked = (stageId: string, text: string, index: number) => {
    if (!mounted) return false;
    return (trackChecked[stageId] ?? []).includes(itemKey(text, index));
  };

  const stageCheckedCount = (stage: RoadmapStage) => {
    if (!mounted) return 0;
    const done = trackChecked[stage.id] ?? [];
    return stage.checklist.filter((text, i) => done.includes(itemKey(text, i))).length;
  };

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1320px] mx-auto w-full mt-20 pb-24">
      {/* Breadcrumbs */}
      <nav
        className="flex items-center text-xs font-mono text-muted mb-8 uppercase tracking-widest font-bold"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
        >
          Platform
        </Link>
        <ChevronRight size={14} className="mx-2" aria-hidden />
        <span className="text-primary font-bold">Roadmaps</span>
      </nav>

      {/* Hero */}
      <header className="mb-10 max-w-3xl">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent font-semibold bg-accent/10 px-3 py-1.5 rounded-full border border-accent/25 mb-4">
          <Compass size={12} aria-hidden />
          Prepare · Guided paths
        </span>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-primary leading-tight">
          Contributor roadmaps
        </h1>
        <p className="text-secondary text-base sm:text-lg mt-4 font-normal leading-relaxed">
          Goal-based paths from first commit to paid mentorship and maintainership.
          Check off real prep work, track progress locally, and jump into programs,
          projects, and resources when you are ready.
        </p>
      </header>

      {/* Track picker */}
      <section className="mb-10" aria-labelledby="track-picker-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <h2
              id="track-picker-heading"
              className="text-xs font-mono uppercase tracking-widest text-muted font-bold"
            >
              Choose your goal
            </h2>
            <p className="text-sm text-secondary mt-1">
              Four independent tracks — switch anytime. Progress is saved per track.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {ROADMAP_TRACKS.map((track) => {
            const styles = ACCENT_STYLES[track.accent];
            const isActive = track.id === activeTrackId;
            const Icon = track.icon;
            const trackTotal = countTrackChecklistItems(track);
            const trackDone = mounted
              ? Object.values(progress[track.id]?.checkedItems ?? {}).reduce(
                  (sum, arr) => sum + arr.length,
                  0
                )
              : 0;
            const trackPct =
              trackTotal === 0 ? 0 : Math.round((trackDone / trackTotal) * 100);

            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track)}
                aria-pressed={isActive}
                className={`text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                  isActive
                    ? `bg-surface-raised ${styles.border} ring-1 ${styles.ring} shadow-sm`
                    : 'bg-surface border-hairline hover:bg-surface-raised hover:border-hairline'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border border-hairline ${styles.soft} ${styles.text}`}
                  >
                    <Icon size={20} aria-hidden />
                  </div>
                  {mounted && trackPct > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${styles.chip}`}
                    >
                      {trackPct}%
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-primary text-base leading-snug">
                  {track.title}
                </h3>
                <p className="text-xs text-secondary mt-1.5 leading-relaxed line-clamp-2">
                  {track.tagline}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                    {track.stages.length} stages
                  </span>
                  <span className="text-[10px] font-mono text-muted">·</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                    {track.duration}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active track summary + progress */}
      <section
        className="bg-surface border border-hairline/80 rounded-3xl p-6 sm:p-8 mb-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)]"
        aria-labelledby="active-track-heading"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border mb-3 ${accent.chip}`}
            >
              <Target size={11} aria-hidden />
              Active track
            </span>
            <h2
              id="active-track-heading"
              className="text-2xl sm:text-3xl font-heading font-bold text-primary"
            >
              {activeTrack.title}
            </h2>
            <p className="text-secondary text-sm sm:text-base mt-2 leading-relaxed">
              {activeTrack.tagline}. For {activeTrack.audience.toLowerCase()}.
            </p>
            <p className="text-sm text-primary mt-3 font-medium flex items-start gap-2">
              <Sparkles size={16} className={`mt-0.5 shrink-0 ${accent.text}`} aria-hidden />
              <span>
                <span className="text-muted font-normal">Outcome: </span>
                {activeTrack.outcome}
              </span>
            </p>
          </div>

          <div className="w-full lg:w-72 shrink-0 space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
                  Checklist progress
                </span>
                <p className="font-heading font-bold text-xl text-primary mt-0.5">
                  {mounted ? (
                    <>
                      {checkedCount}
                      <span className="text-muted font-medium text-base">
                        {' '}
                        / {totalCount}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </p>
              </div>
              <span className={`text-lg font-mono font-bold ${accent.text}`}>
                {mounted ? `${percent}%` : '—'}
              </span>
            </div>
            <div
              className="w-full h-2 bg-surface-raised border border-hairline rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={mounted ? percent : 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${activeTrack.shortTitle} checklist progress`}
            >
              <div
                className={`h-full ${accent.bar} transition-all duration-300 rounded-full`}
                style={{ width: mounted ? `${percent}%` : '0%' }}
              />
            </div>
            <button
              type="button"
              onClick={resetTrackProgress}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1 py-1 cursor-pointer"
            >
              <RotateCcw size={12} aria-hidden />
              Reset this track
            </button>
          </div>
        </div>
      </section>

      {/* Workspace: stages + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Stage list */}
        <aside className="lg:col-span-4 xl:col-span-4 space-y-3" aria-label="Stages">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted mb-4 border-b border-hairline/80 pb-2.5 font-bold">
            Stages
          </h3>

          <ol className="relative space-y-3">
            {activeTrack.stages.map((stage, idx) => {
              const isActive = stage.id === activeStage.id;
              const isDone = mounted && stageCompleteMap[stage.id];
              const doneCount = stageCheckedCount(stage);
              const Icon = stage.icon;

              return (
                <li key={stage.id}>
                  <button
                    type="button"
                    onClick={() => setActiveStageId(stage.id)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`w-full text-left relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isActive
                        ? `border-accent bg-surface-raised ring-1 ring-accent/40 shadow-sm`
                        : 'border-hairline bg-surface hover:bg-surface-raised'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border text-sm font-mono font-bold transition-colors ${
                        isDone
                          ? `${accent.bg} border-transparent text-white`
                          : isActive
                            ? `${accent.soft} ${accent.text} border-hairline`
                            : 'bg-base border-hairline text-muted'
                      }`}
                    >
                      {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon
                          size={14}
                          className={isActive ? accent.text : 'text-muted'}
                          aria-hidden
                        />
                        <h4
                          className={`font-heading font-bold text-sm leading-tight truncate ${
                            isActive ? 'text-primary' : 'text-primary group-hover:text-accent'
                          } transition-colors`}
                        >
                          {stage.title}
                        </h4>
                      </div>
                      <p className="text-xs text-secondary font-medium line-clamp-1">
                        {stage.subtitle}
                      </p>
                      <p className="text-[10px] font-mono text-muted mt-1.5">
                        {mounted
                          ? `${doneCount}/${stage.checklist.length} tasks · ${stage.estimatedTime}`
                          : stage.estimatedTime}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Stage detail panel */}
        <section
          className="lg:col-span-8 xl:col-span-8"
          aria-labelledby="stage-detail-heading"
        >
          <div className="bg-surface border border-hairline/80 rounded-3xl p-6 sm:p-8 relative shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${accent.bar}`} aria-hidden />

            {/* Stage header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 border-b border-hairline/80 pb-6">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-hairline shrink-0 ${accent.soft} ${accent.text}`}
                >
                  <StageIcon size={22} aria-hidden />
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${accent.text}`}>
                    Stage{' '}
                    {activeTrack.stages.findIndex((s) => s.id === activeStage.id) + 1} of{' '}
                    {activeTrack.stages.length}
                  </span>
                  <h3
                    id="stage-detail-heading"
                    className="text-xl sm:text-2xl font-heading font-bold text-primary leading-tight mt-1"
                  >
                    {activeStage.title}
                  </h3>
                  <p className="text-sm text-secondary mt-1">{activeStage.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-secondary bg-surface-raised border border-hairline px-3 py-1.5 rounded-xl">
                  <Clock size={13} aria-hidden />
                  {activeStage.estimatedTime}
                </span>
                {!stageCompleteMap[activeStage.id] && (
                  <button
                    type="button"
                    onClick={() => markStageComplete(activeStage)}
                    className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wide px-3 py-1.5 rounded-xl border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${accent.soft} ${accent.text} border-transparent hover:opacity-90`}
                  >
                    <Check size={13} strokeWidth={3} aria-hidden />
                    Complete stage
                  </button>
                )}
                {mounted && stageCompleteMap[activeStage.id] && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wide px-3 py-1.5 rounded-xl border ${accent.chip}`}
                  >
                    <Check size={13} strokeWidth={3} aria-hidden />
                    Stage done
                  </span>
                )}
              </div>
            </div>

            {/* Outcome */}
            <div className={`rounded-2xl border border-hairline p-4 mb-6 ${accent.soft}`}>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
                You will be able to
              </span>
              <p className="text-sm sm:text-base text-primary mt-1.5 leading-relaxed font-medium">
                {activeStage.outcome}
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Checklist */}
              <div className="xl:col-span-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5 font-bold">
                  <ListChecks size={14} className={accent.text} aria-hidden />
                  Action checklist
                  <span className="font-medium text-muted normal-case tracking-normal ml-1">
                    ({mounted ? stageCheckedCount(activeStage) : 0}/
                    {activeStage.checklist.length})
                  </span>
                </h4>
                <ul className="space-y-2">
                  {activeStage.checklist.map((item, index) => {
                    const checked = isItemChecked(activeStage.id, item, index);
                    const id = `check-${activeStage.id}-${index}`;
                    return (
                      <li key={id}>
                        <label
                          htmlFor={id}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            checked
                              ? `${accent.soft} border-hairline`
                              : 'border-hairline bg-base hover:bg-surface-raised'
                          }`}
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleChecklistItem(activeStage, item, index)
                            }
                            className="sr-only"
                          />
                          <span
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              checked
                                ? `${accent.bg} border-transparent text-white`
                                : 'border-hairline bg-surface'
                            }`}
                            aria-hidden
                          >
                            {checked && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span
                            className={`text-sm leading-relaxed ${
                              checked
                                ? 'text-secondary line-through decoration-hairline'
                                : 'text-primary'
                            }`}
                          >
                            {item}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                {/* Skills */}
                <div className="mt-6">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 font-bold">
                    Skills you practice
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeStage.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium text-secondary bg-surface-raised border border-hairline px-2.5 py-1 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Links + tips */}
              <div className="xl:col-span-2 space-y-6">
                {activeStage.productLinks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5 font-bold">
                      <Compass size={13} className={accent.text} aria-hidden />
                      On Contribo
                    </h4>
                    <div className="space-y-2">
                      {activeStage.productLinks.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          className="flex items-start justify-between gap-2 p-3 rounded-xl border border-hairline bg-base hover:bg-surface-raised transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-primary group-hover:text-accent transition-colors block">
                              {link.label}
                            </span>
                            {link.description && (
                              <span className="text-[11px] text-secondary leading-snug block mt-0.5">
                                {link.description}
                              </span>
                            )}
                          </div>
                          <ArrowRight
                            size={14}
                            className="text-muted group-hover:text-accent shrink-0 mt-0.5 transition-colors"
                            aria-hidden
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {activeStage.resources.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5 font-bold">
                      <BookOpen size={13} className={accent.text} aria-hidden />
                      Resources
                    </h4>
                    <div className="space-y-2">
                      {activeStage.resources.map((res) => {
                        const external = res.external || res.url.startsWith('http');
                        const className =
                          'flex items-center justify-between gap-2 p-3 rounded-xl border border-hairline bg-base hover:bg-surface-raised transition-colors text-xs font-mono font-bold text-primary group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';
                        if (external) {
                          return (
                            <a
                              key={res.url + res.title}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                            >
                              <span className="truncate pr-2">{res.title}</span>
                              <ExternalLink
                                size={13}
                                className="text-muted group-hover:text-accent shrink-0"
                                aria-hidden
                              />
                            </a>
                          );
                        }
                        return (
                          <Link
                            key={res.url + res.title}
                            href={res.url}
                            className={className}
                          >
                            <span className="truncate pr-2">{res.title}</span>
                            <ChevronRight
                              size={14}
                              className="text-muted group-hover:text-accent shrink-0"
                              aria-hidden
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeStage.tips && activeStage.tips.length > 0 && (
                  <div className="rounded-2xl border border-brass/25 bg-brass/10 p-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-brass mb-2 flex items-center gap-1.5 font-bold">
                      <Lightbulb size={13} aria-hidden />
                      Mentor tips
                    </h4>
                    <ul className="space-y-2">
                      {activeStage.tips.map((tip) => (
                        <li
                          key={tip}
                          className="text-xs sm:text-sm text-primary leading-relaxed"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Stage nav */}
            <div className="mt-8 pt-6 border-t border-hairline/80 flex flex-col sm:flex-row justify-between gap-3">
              {(() => {
                const idx = activeTrack.stages.findIndex((s) => s.id === activeStage.id);
                const prev = idx > 0 ? activeTrack.stages[idx - 1] : null;
                const next =
                  idx < activeTrack.stages.length - 1
                    ? activeTrack.stages[idx + 1]
                    : null;
                return (
                  <>
                    <button
                      type="button"
                      disabled={!prev}
                      onClick={() => prev && setActiveStageId(prev.id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-hairline bg-surface text-sm font-medium text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Previous stage
                    </button>
                    <button
                      type="button"
                      disabled={!next}
                      onClick={() => next && setActiveStageId(next.id)}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${accent.bg} hover:opacity-90`}
                    >
                      Next stage
                      <ArrowRight size={16} aria-hidden />
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom CTAs */}
      <section className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Continue exploring">
        {[
          {
            href: '/programs',
            title: 'Explore programs',
            desc: 'Compare GSoC, Outreachy, LFX, MLH, events, and more.',
            icon: Target,
          },
          {
            href: '/matcher',
            title: 'Match projects',
            desc: 'Use the AI matcher to find projects that fit your skills.',
            icon: Sparkles,
          },
          {
            href: '/resources',
            title: 'Level up with guides',
            desc: 'Proposals, Git, first issues, resumes, and checklists.',
            icon: BookOpen,
          },
        ].map((cta) => {
          const Icon = cta.icon;
          return (
            <Link
              key={cta.href}
              href={cta.href}
              className="group rounded-2xl border border-hairline bg-surface p-5 hover:bg-surface-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-accent" aria-hidden />
                <h3 className="font-heading font-bold text-primary group-hover:text-accent transition-colors">
                  {cta.title}
                </h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed">{cta.desc}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-mono font-bold text-accent">
                Open <ArrowRight size={12} aria-hidden />
              </span>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
