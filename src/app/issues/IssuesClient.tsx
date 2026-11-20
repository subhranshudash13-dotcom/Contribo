'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Sparkles,
  Compass,
  LayoutGrid,
  Kanban,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import type {
  IssueRecord,
  IssueListFilter,
  IssueQueryResult,
  TrackedTask,
  ContributionStatus,
  UserSkillProfile,
} from '@/lib/issues/types';
import { listIssues } from '@/lib/issues/repository';
import { IssueCard } from '@/components/issues/IssueCard';
import { IssueFilterSidebar } from '@/components/issues/IssueFilterSidebar';
import { IssueMatchExplainerModal } from '@/components/issues/IssueMatchExplainerModal';
import { IssueKanbanBoard } from '@/components/issues/IssueKanbanBoard';

const DEFAULT_USER_SKILLS = ['typescript', 'react', 'next.js', 'python'];

export function IssuesClient() {
  const [activeTab, setActiveTab] = useState<'directory' | 'radar'>('directory');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IssueListFilter>({
    sortBy: 'recommended',
    page: 1,
    limit: 8,
  });

  const [userSkills, setUserSkills] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('contribo_user_skills');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_USER_SKILLS;
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSkillEditorOpen, setIsSkillEditorOpen] = useState(false);

  const [trackedTasks, setTrackedTasks] = useState<TrackedTask[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('contribo_tracked_tasks');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [explainingIssue, setExplainingIssue] = useState<IssueRecord | null>(null);

  // Sync tracked tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('contribo_tracked_tasks', JSON.stringify(trackedTasks));
    } catch {}
  }, [trackedTasks]);

  // Sync user skills to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('contribo_user_skills', JSON.stringify(userSkills));
    } catch {}
  }, [userSkills]);

  const skillProfile: UserSkillProfile = useMemo(
    () => ({
      skills: userSkills,
      experienceLevel: 'beginner',
    }),
    [userSkills]
  );

  // Query issues
  const queryResult: IssueQueryResult = useMemo(() => {
    return listIssues(
      {
        ...filters,
        search,
      },
      skillProfile
    );
  }, [filters, search, skillProfile]);

  const handleFilterChange = useCallback((newFilters: Partial<IssueListFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setFilters({
      sortBy: 'recommended',
      page: 1,
      limit: 8,
    });
  }, []);

  const handleToggleTrack = useCallback((issue: IssueRecord) => {
    setTrackedTasks((prev) => {
      const exists = prev.find((t) => t.issueId === issue.id);
      if (exists) {
        return prev.filter((t) => t.issueId !== issue.id);
      }
      const newTask: TrackedTask = {
        issueId: issue.id,
        issue,
        status: 'discovered',
        updatedAt: new Date().toISOString(),
      };
      return [newTask, ...prev];
    });
  }, []);

  const handleUpdateStatus = useCallback((issueId: string, status: ContributionStatus) => {
    setTrackedTasks((prev) =>
      prev.map((t) => (t.issueId === issueId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const handleRemoveTask = useCallback((issueId: string) => {
    setTrackedTasks((prev) => prev.filter((t) => t.issueId !== issueId));
  }, []);

  const handleUpdatePrUrl = useCallback((issueId: string, prUrl: string) => {
    setTrackedTasks((prev) =>
      prev.map((t) => (t.issueId === issueId ? { ...t, prUrl, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const clean = newSkillInput.trim().toLowerCase();
    if (!userSkills.includes(clean)) {
      setUserSkills((prev) => [...prev, clean]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setUserSkills((prev) => prev.filter((s) => s !== skill));
  };

  const trackedIdSet = useMemo(() => new Set(trackedTasks.map((t) => t.issueId)), [trackedTasks]);
  const trackedMap = useMemo(
    () => new Map(trackedTasks.map((t) => [t.issueId, t.status])),
    [trackedTasks]
  );

  return (
    <div className="min-h-screen w-full bg-noise">
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent/10 px-3.5 py-1.5 font-mono text-xs font-bold text-accent shadow-xs">
            <Sparkles size={14} className="animate-pulse" />
            <span>Good First Issue AI Vector Matcher</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight">
                Contributor Task Radar
              </h1>
              <p className="mt-2 font-body text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
                Discover beginner-friendly open source tickets tailored to your tech stack. Track your applications
                from initial claim to merged pull request with Orbit AI affinity scoring.
              </p>
            </div>

            {/* Mode Toggle: Directory vs Task Radar Kanban */}
            <div className="flex items-center rounded-2xl border border-hairline bg-surface p-1 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <LayoutGrid size={15} />
                <span>Issue Directory</span>
                <span className="rounded-md bg-white/20 px-1.5 py-0.2 text-[10px]">
                  {queryResult.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('radar')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'radar'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <Kanban size={15} />
                <span>My Task Radar</span>
                {trackedTasks.length > 0 && (
                  <span className="rounded-md bg-accent/20 text-accent px-1.5 py-0.2 text-[10px] font-bold">
                    {trackedTasks.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Orbit AI Profile Skills Bar */}
        <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
              <Sparkles size={15} className="text-accent" />
              <span>Orbit AI Personalized Skills Vector:</span>
            </div>

            <button
              type="button"
              onClick={() => setIsSkillEditorOpen((prev) => !prev)}
              className="font-mono text-xs font-semibold text-accent hover:underline cursor-pointer"
            >
              {isSkillEditorOpen ? 'Done Editing' : '+ Customize Tech Stack'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {userSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-xl border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-xs font-bold text-accent uppercase"
              >
                <span>{skill}</span>
                {isSkillEditorOpen && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}

            {isSkillEditorOpen && (
              <form onSubmit={handleAddSkill} className="inline-flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. rust, go, vue"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="rounded-lg border border-hairline bg-surface-raised px-2.5 py-1 font-mono text-xs text-primary placeholder:text-muted focus:border-accent focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-2.5 py-1 font-mono text-xs font-bold text-white hover:bg-accent-hover cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* View Content: Directory vs Radar Kanban */}
        {activeTab === 'radar' ? (
          <IssueKanbanBoard
            tasks={trackedTasks}
            onUpdateStatus={handleUpdateStatus}
            onRemoveTask={handleRemoveTask}
            onUpdatePrUrl={handleUpdatePrUrl}
            onExploreMore={() => setActiveTab('directory')}
          />
        ) : (
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left Filter Sidebar */}
            <IssueFilterSidebar
              filters={filters}
              facets={queryResult.facets}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />

            {/* Right Issues Column */}
            <div className="flex-1 w-full space-y-6">
              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="search"
                    placeholder="Search issues by title, description, org, or label..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      handleFilterChange({ page: 1 });
                    }}
                    className="w-full rounded-2xl border border-hairline bg-surface py-2.5 pl-10 pr-4 font-mono text-xs sm:text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-hidden shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <SlidersHorizontal size={15} className="text-muted" />
                  <select
                    value={filters.sortBy || 'recommended'}
                    onChange={(e) =>
                      handleFilterChange({
                        sortBy: e.target.value as IssueListFilter['sortBy'],
                        page: 1,
                      })
                    }
                    className="rounded-xl border border-hairline bg-surface px-3 py-2 font-mono text-xs font-semibold text-secondary focus:border-accent focus:outline-hidden shadow-xs cursor-pointer"
                  >
                    <option value="recommended">Sort: Orbit AI Best Match</option>
                    <option value="newest">Sort: Most Recently Opened</option>
                    <option value="comments-asc">Sort: Least Competition</option>
                    <option value="effort-asc">Sort: Lowest Estimated Hours</option>
                  </select>
                </div>
              </div>

              {/* Issue Cards Grid */}
              {queryResult.issues.length > 0 ? (
                <div className="space-y-4">
                  {queryResult.issues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      isTracked={trackedIdSet.has(issue.id)}
                      currentStatus={trackedMap.get(issue.id)}
                      onExplainMatch={(iss) => setExplainingIssue(iss)}
                      onToggleTrack={handleToggleTrack}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-hairline bg-surface p-12 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-hairline bg-surface-raised text-muted">
                    <Compass size={24} />
                  </div>
                  <h3 className="font-heading text-base font-bold text-primary">No Matching Issues Found</h3>
                  <p className="font-body text-xs sm:text-sm text-secondary max-w-sm">
                    Try broadening your filters or clearing the search query to see more open source opportunities.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-xl border border-hairline bg-surface-raised px-4 py-2 font-mono text-xs font-bold text-primary hover:bg-hairline cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* Pagination Controls */}
              {queryResult.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-hairline/80 pt-4 font-mono text-xs">
                  <span className="text-muted">
                    Showing {(queryResult.page - 1) * queryResult.limit + 1} -{' '}
                    {Math.min(queryResult.page * queryResult.limit, queryResult.total)} of {queryResult.total} issues
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={queryResult.page <= 1}
                      onClick={() => handleFilterChange({ page: queryResult.page - 1 })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-surface text-secondary hover:bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Previous page"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <span className="px-2 font-bold text-primary">
                      {queryResult.page} / {queryResult.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={queryResult.page >= queryResult.totalPages}
                      onClick={() => handleFilterChange({ page: queryResult.page + 1 })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-surface text-secondary hover:bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Next page"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orbit AI Match Explainer Modal */}
        {explainingIssue && (
          <IssueMatchExplainerModal
            issue={explainingIssue}
            userSkills={userSkills}
            onClose={() => setExplainingIssue(null)}
          />
        )}
      </div>
    </div>
  );
}
