'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Clock,
  CheckCircle2,
  CalendarDays,
  Activity,
  Inbox,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Edit3,
  BookOpen,
  Compass,
  MessageSquarePlus,
  FileText,
  Building2,
  Code2,
  TrendingUp,
  Search,
  Filter,
  Check,
  AlertCircle,
  Zap,
  FolderGit2,
  MoreVertical,
  Target
} from 'lucide-react';
import Link from 'next/link';
import {
  friendlyApiMessage,
  updateUserApplication,
  deleteUserApplication,
  unsaveUserItem,
} from '@/lib/client/api';
import { useNetwork } from '@/components/ui/NetworkProvider';
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

function getProgramTheme(slug?: string) {
  const colorMap: Record<string, { bg: string, text: string, dot: string }> = {
    gsoc: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    outreachy: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
    lfx: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
    nsoc: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
    gssoc: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-500' },
    'summer-of-bitcoin': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
    'mlh-fellowship': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  };
  return colorMap[slug || ''] || { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' };
}

function StatusBadge({ status }: { status: string }) {
  const isAccepted = status === 'accepted';
  const isSubmitted = status === 'submitted';
  const isDrafting = status === 'drafting';
  const isResearching = status === 'researching';
  const isRejected = status === 'rejected' || status === 'withdrawn';

  let color = 'text-muted';
  let Icon = Clock;

  if (isAccepted) {
    color = 'text-emerald-500';
    Icon = CheckCircle2;
  } else if (isSubmitted) {
    color = 'text-merge';
    Icon = CheckCircle2;
  } else if (isDrafting) {
    color = 'text-accent';
    Icon = Edit3;
  } else if (isResearching) {
    color = 'text-brass';
    Icon = Compass;
  } else if (isRejected) {
    color = 'text-error';
    Icon = AlertCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold ${color}`}>
      <Icon size={12} strokeWidth={2.5} />
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

function getDeadlineUrgency(value?: string | Date | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const diffDays = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Passed', color: 'text-muted' };
  if (diffDays === 0) return { label: '🔥 Due Today', color: 'text-error animate-pulse font-bold' };
  if (diffDays <= 7) return { label: `🔥 ${diffDays} days left`, color: 'text-error font-bold' };
  if (diffDays <= 30) return { label: `${diffDays} days left`, color: 'text-accent font-semibold' };
  return { label: `${diffDays} days left`, color: 'text-secondary' };
}

export function DashboardClient({
  displayName = 'Contributor',
  initialApplications = [],
  initialSaved = [],
}: {
  displayName?: string;
  initialApplications?: DashboardApp[];
  initialSaved?: DashboardSaved[];
  skills?: string[];
}) {
  const router = useRouter();
  const { isOnline, browserOnline } = useNetwork();
  const [applications, setApplications] = useState<DashboardApp[]>(initialApplications || []);
  const [savedItems, setSavedItems] = useState<DashboardSaved[]>(initialSaved || []);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'proposals' | 'bookmarks'>('applications');
  const [bookmarkQuery, setBookmarkQuery] = useState('');

  const safeApplications = applications || [];
  const safeSaved = savedItems || [];

  const savedCount = safeSaved.length;
  const applicationCount = safeApplications.length;
  const draftingCount = applications.filter((a) => a.status === 'drafting').length;
  const submittedCount = applications.filter((a) => a.status === 'submitted' || a.status === 'accepted').length;

  const now = new Date();
  const activeDeadlineCount = applications.filter((a) => {
    if (!a.deadline) return false;
    if (a.status === 'accepted' || a.status === 'rejected' || a.status === 'withdrawn') {
      return false;
    }
    const d = new Date(a.deadline);
    return !Number.isNaN(d.getTime()) && d >= now;
  }).length;

  const filteredBookmarks = savedItems.filter((item) => {
    if (!bookmarkQuery.trim()) return true;
    const q = bookmarkQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.techStack && item.techStack.some((t) => t.toLowerCase().includes(q)))
    );
  });

  async function updateStatus(id: string, status: ApplicationStatus) {
    if (!isOnline) {
      setError(
        browserOnline
          ? 'Cannot reach Contribo right now. Try again shortly.'
          : 'You are offline. Reconnect to update application status.'
      );
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await updateUserApplication({ id, status });
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
      startTransition(() => router.refresh());
    } catch (e) {
      setError(friendlyApiMessage(e, 'Failed to update status'));
    } finally {
      setBusyId(null);
    }
  }

  async function removeApplication(id: string) {
    if (!confirm('Remove this application from your tracker?')) return;
    if (!isOnline) {
      setError('You are offline. Reconnect to remove applications.');
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await deleteUserApplication(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(friendlyApiMessage(e, 'Failed to remove application'));
    } finally {
      setBusyId(null);
    }
  }

  async function removeSaved(id: string) {
    if (!isOnline) {
      setError('You are offline. Reconnect to update saved items.');
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await unsaveUserItem({ id });
      setSavedItems((prev) => prev.filter((s) => s._id !== id));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(friendlyApiMessage(e, 'Failed to remove saved item'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-8 lg:px-12 pt-[148px] pb-12 space-y-12">
      
      {/* 1. HERO - Streamlined text-driven header without a box */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hairline">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-tertiary">
            <Target size={12} /> Contributor Dashboard
            <span className="text-hairline">|</span>
            <div className="flex items-center gap-1.5">
              <Activity size={10} className={!isOnline ? 'text-error' : pending ? 'text-brass animate-pulse' : 'text-success'} />
              <span className={!isOnline ? 'text-error' : 'text-success'}>
                {!isOnline ? 'Offline' : pending ? 'Syncing' : 'Live'}
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-primary">
            Welcome back, {displayName}
          </h1>
          <p className="text-secondary text-sm leading-relaxed">
            Manage your open-source internship applications, draft winning proposals, and track deadlines seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/matcher"
            className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors"
          >
            <Sparkles size={14} /> AI Matcher
          </Link>
          <Link
            href="/proposal-studio"
            className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-primary text-page text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <FileText size={14} /> Proposal Studio
          </Link>
        </div>
      </div>

      {/* 2. STATS STRIP - Streamlined without boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-left">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <FolderGit2 size={12} /> Tracked
          </span>
          <div className="text-3xl font-heading font-bold text-primary">{applicationCount}</div>
          <div className="text-xs font-medium text-secondary">
            {draftingCount} drafting · {submittedCount} submitted
          </div>
        </div>

        <div className="space-y-0.5 border-l border-hairline pl-6 md:pl-10">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Clock size={12} /> Deadlines
          </span>
          <div className="text-3xl font-heading font-bold text-primary">{activeDeadlineCount}</div>
          <div className="text-xs font-medium text-secondary">
            Active tracking
          </div>
        </div>

        <div className="space-y-0.5 border-l border-hairline pl-6 md:pl-10">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Bookmark size={12} /> Saved
          </span>
          <div className="text-3xl font-heading font-bold text-primary">{savedCount}</div>
          <div className="text-xs font-medium text-secondary">
            Items bookmarked
          </div>
        </div>

        <div className="space-y-0.5 border-l border-hairline pl-6 md:pl-10">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Zap size={12} /> Readiness
          </span>
          <div className="text-3xl font-heading font-bold text-primary">
            {draftingCount > 0 ? '78%' : applicationCount > 0 ? '60%' : '100%'}
          </div>
          <div className="text-xs font-medium text-success">
            On track
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-error font-bold">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 underline text-[10px]">Dismiss</button>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTENT - Flat text-based layout */}
      <div className="space-y-6 pt-6 border-t border-hairline">
        
        {/* Sleek Underline Tabs */}
        <div className="flex items-center gap-6 border-b border-hairline overflow-x-auto">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'applications'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Applications <span className="ml-1 text-tertiary">({applicationCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'proposals'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Studio Hub
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'bookmarks'
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            Bookmarks <span className="ml-1 text-tertiary">({savedCount})</span>
          </button>
        </div>

        {/* TAB 1: APPLICATION TRACKER - Flat List */}
        {activeTab === 'applications' && (
          <div className="space-y-0">
            {applications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-secondary text-base mb-4">No tracked applications yet.</p>
                <Link href="/projects" className="text-accent text-sm font-bold hover:underline">
                  Browse Projects
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {applications.map((app) => {
                  const urgency = getDeadlineUrgency(app.deadline);
                  const theme = getProgramTheme(app.programSlug);
                  
                  return (
                    <div key={app._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                      
                      {/* Project Info */}
                      <div className="flex-1 flex gap-3">
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text}`}>
                              {app.programName || app.programSlug || 'Program'}
                            </span>
                            <span className="text-tertiary">·</span>
                            <span className="text-xs font-medium text-secondary">
                              {app.orgName}
                            </span>
                          </div>
                          <h3 className="font-heading font-bold text-lg text-primary leading-tight group-hover:text-accent transition-colors">
                            {app.projectTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Controls - Flat */}
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="flex flex-col items-start min-w-[100px]">
                          <span className="text-[9px] font-bold text-tertiary uppercase tracking-wider mb-1">Status</span>
                          <select
                            value={String(app.status)}
                            disabled={busyId === app._id}
                            onChange={(e) => app._id && updateStatus(app._id, e.target.value as ApplicationStatus)}
                            className="appearance-none bg-transparent text-primary font-bold text-xs focus:outline-none cursor-pointer"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{statusLabel(s)}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex flex-col items-start min-w-[100px]">
                          <span className="text-[9px] font-bold text-tertiary uppercase tracking-wider mb-1">Deadline</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-primary">{formatDate(app.deadline)}</span>
                            {urgency && (
                              <span className={`text-[10px] ${urgency.color}`}>({urgency.label.replace('🔥 ', '')})</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={busyId === app._id}
                          onClick={() => app._id && removeApplication(app._id)}
                          className="text-tertiary hover:text-error transition-colors p-1"
                          title="Remove Application"
                        >
                          {busyId === app._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROPOSAL STUDIO HUB - Flat Layout */}
        {activeTab === 'proposals' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-2">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent mb-1">
                <Edit3 size={16} />
                <h3 className="font-heading font-bold text-lg text-primary">Interactive Builder</h3>
              </div>
              <p className="text-secondary text-xs leading-relaxed">
                Draft, structure, and format winning proposals for GSoC, Outreachy, LFX, and ESoC with AI assistance.
              </p>
              <div className="pt-1">
                <Link href="/proposal-studio" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  Launch Studio <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-merge mb-1">
                <BookOpen size={16} />
                <h3 className="font-heading font-bold text-lg text-primary">Accepted Proposals</h3>
              </div>
              <p className="text-secondary text-xs leading-relaxed">
                Explore 500+ annotated real-world winning proposals from top open-source alumni.
              </p>
              <div className="pt-1">
                <Link href="/proposal-studio?tab=examples" className="text-xs font-bold text-merge hover:underline flex items-center gap-1">
                  Browse Library <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-brass mb-1">
                <Sparkles size={16} />
                <h3 className="font-heading font-bold text-lg text-primary">Official Guides</h3>
              </div>
              <p className="text-secondary text-xs leading-relaxed">
                Read stipend rules, eligibility criteria, and mentor grading matrices.
              </p>
              <div className="pt-1">
                <Link href="/proposal-studio?tab=guide" className="text-xs font-bold text-brass hover:underline flex items-center gap-1">
                  Read Guidelines <ArrowRight size={12} />
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: BOOKMARKS & SAVED ITEMS - Flat List */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-6 pt-2">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                value={bookmarkQuery}
                onChange={(e) => setBookmarkQuery(e.target.value)}
                placeholder="Search bookmarks..."
                className="w-full text-base bg-transparent border-b border-hairline focus:border-accent pl-6 pr-4 py-1.5 text-primary focus:outline-none transition-colors"
              />
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="py-10 text-left">
                <p className="text-secondary text-base mb-4">No saved bookmarks match your search.</p>
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {filteredBookmarks.map((item) => (
                  <div key={item._id} className="py-4 flex items-center justify-between group">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-tertiary">
                          {item.type}
                        </span>
                      </div>
                      <Link
                        href={
                          item.type === 'project' && item.targetId
                            ? `/projects/${item.targetId}`
                            : item.type === 'organization' && item.slug
                            ? `/organizations/${item.slug}`
                            : '#'
                        }
                        className="font-heading font-bold text-base text-primary hover:text-accent transition-colors block"
                      >
                        {item.title}
                      </Link>
                      {item.subtitle && (
                        <p className="text-xs text-secondary mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => item._id && removeSaved(item._id)}
                      disabled={busyId === item._id}
                      className="text-tertiary hover:text-error transition-colors p-1"
                    >
                      {busyId === item._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
