'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  LayoutGrid,
  CalendarDays,
  Activity,
  Inbox,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { DangerZone } from '@/components/dashboard/DangerZone';
import type { ApplicationStatus } from '@/../types';

const STATUSES: ApplicationStatus[] = [
  'saved',
  'researching',
  'drafting',
  'submitted',
  'accepted',
  'rejected',
  'withdrawn',
];

export type DashboardApp = {
  _id?: string;
  programName?: string;
  programSlug?: string;
  projectTitle: string;
  orgName: string;
  status: ApplicationStatus | string;
  deadline?: string | Date | null;
  notes?: string;
};

export type DashboardSaved = {
  _id?: string;
  type: string;
  title: string;
  subtitle?: string;
  slug?: string;
  techStack?: string[];
  targetId?: string;
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusBadge({ status }: { status: string }) {
  const isDone = status === 'submitted' || status === 'accepted';
  const isAlert = status === 'drafting' || status === 'researching' || status === 'saved';
  const Icon = isDone ? CheckCircle2 : Clock;
  const color = isDone
    ? 'text-merge bg-merge/10 border-merge/20'
    : isAlert
    ? 'text-accent bg-accent/10 border-accent/20'
    : 'text-muted bg-base border-hairline';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold border ${color}`}
    >
      <Icon size={10} />
      {statusLabel(status)}
    </span>
  );
}

function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DashboardClient({
  displayName,
  initialApplications,
  initialSaved,
  skills,
}: {
  displayName: string;
  initialApplications: DashboardApp[];
  initialSaved: DashboardSaved[];
  skills?: string[];
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [savedItems, setSavedItems] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const savedCount = savedItems.length;
  const applicationCount = applications.length;
  const now = new Date();
  const activeDeadlineCount = applications.filter((a) => {
    if (!a.deadline) return false;
    if (a.status === 'accepted' || a.status === 'rejected' || a.status === 'withdrawn') {
      return false;
    }
    const d = new Date(a.deadline);
    return !Number.isNaN(d.getTime()) && d >= now;
  }).length;

  const upcoming = applications
    .filter((a) => a.deadline)
    .map((a) => ({ ...a, _deadline: new Date(a.deadline as string | Date) }))
    .filter((a) => !Number.isNaN(a._deadline.getTime()) && a._deadline >= now)
    .sort((a, b) => a._deadline.getTime() - b._deadline.getTime())
    .slice(0, 5);

  async function updateStatus(id: string, status: ApplicationStatus) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch('/api/user/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Update failed');
      }
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  async function removeApplication(id: string) {
    if (!confirm('Remove this application from your tracker?')) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/user/applications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed');
      }
      setApplications((prev) => prev.filter((a) => a._id !== id));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove application');
    } finally {
      setBusyId(null);
    }
  }

  async function removeSaved(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/user/saved?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 404) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unsave failed');
      }
      setSavedItems((prev) => prev.filter((s) => s._id !== id));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove saved item');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="p-4 sm:p-6 lg:p-12 max-w-[1440px] mx-auto w-full bg-noise mt-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 border-b border-hairline pb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-primary mb-2">
            Dashboard
          </h1>
          <p className="text-secondary font-mono text-xs uppercase tracking-widest font-semibold">
            Welcome back, {displayName}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/matcher"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-accent text-white text-xs font-mono uppercase tracking-wider font-bold hover:bg-accent-hover transition-all shadow-sm"
          >
            <Sparkles size={13} /> Orbit AI Matcher
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-hairline bg-surface text-primary text-xs font-mono uppercase tracking-wider font-bold hover:bg-surface-raised hover:border-accent/40 transition-all shadow-sm"
          >
            Explore Projects
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-muted">
            <Activity size={14} className="text-merge animate-pulse" />
            <span>{pending ? 'Syncing…' : 'Live sync'}</span>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl border border-alert/25 bg-alert/5 text-sm text-alert font-medium font-mono"
        >
          Error: {error}
        </div>
      )}

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Item 1 */}
            <div className="bg-surface border border-hairline p-6 rounded-3xl transition-all relative overflow-hidden group hover:border-brass/30 shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-brass/30 group-hover:bg-brass transition-colors" />
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <Bookmark size={16} className="text-brass" />
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold">Saved Items</h3>
              </div>
              <p className="text-4xl font-mono text-primary font-bold tabular-nums">{savedCount}</p>
              <p className="text-[10px] font-mono text-muted mt-2 uppercase tracking-widest">
                Bookmarks
              </p>
            </div>

            {/* Stat Item 2 */}
            <div className="bg-surface border border-hairline p-6 rounded-3xl transition-all relative overflow-hidden group hover:border-accent/30 shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-accent/30 group-hover:bg-accent transition-colors" />
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <Clock size={16} className="text-accent" />
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold">Active Deadlines</h3>
              </div>
              <p className="text-4xl font-mono text-primary font-bold tabular-nums">
                {activeDeadlineCount}
              </p>
              <p className="text-[10px] font-mono text-muted mt-2 uppercase tracking-widest">
                Upcoming
              </p>
            </div>

            {/* Stat Item 3 */}
            <div className="bg-surface border border-hairline p-6 rounded-3xl transition-all relative overflow-hidden group hover:border-merge/30 shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-merge/30 group-hover:bg-merge transition-colors" />
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <CheckCircle2 size={16} className="text-merge" />
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold">Tracked Applications</h3>
              </div>
              <p className="text-4xl font-mono text-primary font-bold tabular-nums">
                {applicationCount}
              </p>
              <p className="text-[10px] font-mono text-muted mt-2 uppercase tracking-widest">
                Applications
              </p>
            </div>
          </div>

          {/* Application Tracker Panel */}
          <div className="bg-surface border border-hairline rounded-[28px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.005)]">
            <div className="border-b border-hairline/80 p-5 sm:px-6 bg-surface-raised/35 flex justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <LayoutGrid size={16} className="text-secondary" />
                <h2 className="font-heading font-bold text-lg text-primary">Application Tracker</h2>
              </div>
              <Link
                href="/projects"
                className="text-xs font-mono uppercase tracking-wider font-bold text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Track Project <ExternalLink size={12} />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-base border border-hairline flex items-center justify-center mx-auto mb-4">
                  <Inbox size={24} className="text-muted" />
                </div>
                <p className="text-primary font-heading font-bold mb-1">No tracked applications</p>
                <p className="text-xs text-muted mb-6 max-w-sm mx-auto leading-relaxed">
                  Track project proposals from directories or recommendations. Status updates sync here in real time.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/matcher"
                    className="inline-flex text-xs font-mono uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors"
                  >
                    Find matches
                  </Link>
                  <Link
                    href="/projects"
                    className="inline-flex text-xs font-mono uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl border border-hairline text-primary bg-surface hover:bg-surface-raised transition-colors"
                  >
                    Browse projects
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-hairline font-mono text-[10px] uppercase tracking-widest text-muted bg-surface-raised">
                      <th className="px-6 py-4 font-bold w-32">Program</th>
                      <th className="px-6 py-4 font-bold">Project Details</th>
                      <th className="px-6 py-4 font-bold w-48">Status Progress</th>
                      <th className="px-6 py-4 font-bold w-36">Milestone/Deadline</th>
                      <th className="px-6 py-4 font-bold w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-hairline/65">
                    {applications.map((app) => (
                      <tr
                        key={app._id}
                        className="hover:bg-surface-raised/30 transition-colors group"
                      >
                        <td className="px-6 py-4.5 vertical-middle">
                          <span className="font-mono text-[9px] uppercase tracking-wide bg-base px-2 py-1 border border-hairline text-secondary rounded-md font-semibold">
                            {app.programName || app.programSlug || '—'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4.5">
                          <p className="font-bold text-primary leading-snug group-hover:text-brass transition-colors">
                            {app.projectTitle}
                          </p>
                          <p className="text-xs text-muted font-mono mt-1 uppercase tracking-wide">
                            {app.orgName}
                          </p>
                        </td>

                        <td className="px-6 py-4.5">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                              <StatusBadge status={String(app.status)} />
                              {busyId === app._id && (
                                <Loader2 size={12} className="animate-spin text-muted ml-2" />
                              )}
                            </div>
                            
                            <select
                              value={String(app.status)}
                              disabled={busyId === app._id}
                              onChange={(e) =>
                                app._id &&
                                updateStatus(app._id, e.target.value as ApplicationStatus)
                              }
                              className="w-full text-[10px] font-mono bg-base border border-hairline rounded-lg px-2.5 py-1.5 text-primary focus:outline-none focus:border-brass disabled:opacity-50 cursor-pointer"
                              aria-label={`Status for ${app.projectTitle}`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {statusLabel(s)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-6 py-4.5 font-mono text-muted text-xs">
                          {formatDate(app.deadline)}
                        </td>

                        <td className="px-6 py-4.5 text-center">
                          <button
                            type="button"
                            disabled={busyId === app._id}
                            onClick={() => app._id && removeApplication(app._id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-hairline text-muted hover:text-alert hover:border-alert/40 transition-colors disabled:opacity-50 cursor-pointer"
                            aria-label={`Remove ${app.projectTitle}`}
                          >
                            {busyId === app._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bookmarks Section */}
          <div className="bg-surface border border-hairline rounded-[28px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.005)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-hairline/80">
              <h3 className="font-heading font-bold text-lg text-primary">Bookmarks</h3>
              <span className="font-mono text-[10px] uppercase text-muted tracking-wider font-semibold">
                {savedCount} item{savedCount === 1 ? '' : 's'}
              </span>
            </div>

            {savedItems.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-hairline rounded-2xl bg-base/20">
                <Bookmark size={20} className="mx-auto text-muted mb-2 opacity-60" />
                <p className="text-xs text-muted mb-4 max-w-xs mx-auto">
                  Bookmark projects or organizations to see them saved in this collection.
                </p>
                <div className="flex justify-center gap-3">
                  <Link href="/projects" className="text-brass text-xs font-mono uppercase tracking-wider font-bold hover:underline">
                    Projects
                  </Link>
                  <span className="text-hairline">•</span>
                  <Link
                    href="/organizations"
                    className="text-brass text-xs font-mono uppercase tracking-wider font-bold hover:underline"
                  >
                    Organizations
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-hairline/65">
                {savedItems.slice(0, 15).map((item) => (
                  <li
                    key={item._id}
                    className="py-4.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate hover:text-brass transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted font-mono mt-1 uppercase tracking-wide">
                        {item.type}
                        {item.subtitle ? ` · ${item.subtitle}` : ''}
                      </p>
                      {item.techStack && item.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.techStack.slice(0, 4).map((tech) => (
                            <span key={tech} className="bg-base border border-hairline text-[9px] font-mono px-1.5 py-0.5 rounded-sm text-secondary uppercase">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      disabled={busyId === item._id}
                      onClick={() => item._id && removeSaved(item._id)}
                      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-hairline text-muted hover:text-alert hover:border-alert/40 transition-colors disabled:opacity-50 cursor-pointer"
                      aria-label={`Unsave ${item.title}`}
                    >
                      {busyId === item._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DangerZone />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Skills Card */}
          <div className="bg-surface border border-hairline rounded-3xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
            <div className="border-b border-hairline p-4 bg-surface-raised/45 flex items-center justify-between">
              <h3 className="font-bold text-xs text-primary uppercase tracking-widest font-mono">
                My Skills
              </h3>
              <Link
                href="/matcher"
                className="text-[10px] font-mono text-muted hover:text-accent font-semibold uppercase tracking-wider"
              >
                Match
              </Link>
            </div>
            <div className="p-4.5">
              {skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-hairline bg-base text-primary uppercase tracking-wide"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted leading-relaxed">
                  Run the Orbit AI matcher or update your profile skills to personalize recommendations.
                </p>
              )}
            </div>
          </div>

          {/* Timeline Deadlines Card */}
          <div className="bg-surface border border-hairline rounded-3xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.005)]">
            <div className="border-b border-hairline p-4 bg-surface-raised/45 flex items-center justify-between">
              <h3 className="font-bold text-xs text-primary uppercase tracking-widest font-mono">
                Timeline
              </h3>
            </div>
            <div className="p-4.5 space-y-4">
              {upcoming.length === 0 ? (
                <p className="text-xs text-muted leading-relaxed">
                  No upcoming deadlines on tracked applications. Add a deadline when tracking projects.
                </p>
              ) : (
                upcoming.map((item) => (
                  <div key={item._id} className="flex items-start gap-3">
                    <CalendarDays size={14} className="text-secondary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-mono text-muted mb-0.5">
                        {formatDate(item.deadline)}
                      </p>
                      <p className="text-xs font-bold text-primary leading-snug">{item.projectTitle}</p>
                    </div>
                  </div>
                ))
              )}
              
              <div className="flex items-start gap-3 pt-4.5 border-t border-hairline">
                <Sparkles size={14} className="text-brass mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-mono text-muted mb-0.5 uppercase tracking-wide font-semibold">Tip</p>
                  <p className="text-xs text-secondary leading-snug">
                    Use <strong>Track</strong> on any project card in the directories to add proposals here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
