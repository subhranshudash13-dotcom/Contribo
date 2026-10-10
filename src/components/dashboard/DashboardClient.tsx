'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Clock,
  Activity,
  Trash2,
  Loader2,
  ArrowRight,
  Edit3,
  BookOpen,
  FileText,
  Search,
  AlertCircle,
  Zap,
  FolderGit2,
  Target,
  Building2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import {
  friendlyApiMessage,
  updateUserApplication,
  deleteUserApplication,
  unsaveUserItem,
} from '@/lib/client/api';
import { useNetwork } from '@/components/ui/NetworkProvider';
import { OrgLogo } from '@/components/ui/OrgLogo';
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
  programSlug?: string;
  techStack?: string[];
  targetId?: string;
  logoUrl?: string;
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getProgramTheme(slug?: string) {
  const colorMap: Record<string, { bg: string, text: string, dot: string, border: string }> = {
    gsoc: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-500/30' },
    outreachy: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500', border: 'border-purple-500/30' },
    lfx: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-blue-500/30' },
    nsoc: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', border: 'border-violet-500/30' },
    gssoc: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-500', border: 'border-pink-500/30' },
    'summer-of-bitcoin': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500', border: 'border-yellow-500/30' },
    'mlh-fellowship': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-500/30' },
  };
  return colorMap[slug || ''] || { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent', border: 'border-accent/30' };
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

  const savedOrganizations = safeSaved.filter((item) => item.type === 'organization');
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
    <main className="max-w-[1600px] mx-auto w-full px-4 sm:px-8 lg:px-12 pt-[148px] pb-16 space-y-10">
      
      {/* 1. HERO HEADER */}
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
            Manage your open-source internship applications, draft winning proposals, and track your target organizations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/matcher"
            className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors px-3 py-1.5 rounded-full border border-hairline hover:border-accent/30 bg-surface/60"
          >
            AI Matcher
          </Link>
          <Link
            href="/proposal-studio"
            className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-primary text-page text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
          >
            <FileText size={14} /> Proposal Studio
          </Link>
        </div>
      </div>

      {/* 2. SAVED ORGANIZATIONS SECTION (First / In the Starting with Official Logos) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20">
                <Building2 size={13} />
                Target Organizations ({savedOrganizations.length})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-primary tracking-tight mt-1.5">
              Saved Organizations
            </h2>
            <p className="text-xs text-secondary mt-0.5 max-w-xl">
              Quick access to your target open-source organizations, official repositories, and community guidelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/organizations"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/5 border border-transparent hover:border-accent/20"
            >
              Explore 300+ Organizations
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {savedOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedOrganizations.map((org) => {
              const theme = getProgramTheme(org.programSlug);
              return (
                <div
                  key={org._id || org.slug}
                  className="group relative rounded-xl border border-hairline/80 bg-surface/70 hover:bg-surface-raised hover:border-accent/40 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Logo + Unsave Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-1 rounded-xl bg-page/80 border border-hairline group-hover:border-accent/30 transition-colors">
                        <OrgLogo
                          logoUrl={org.logoUrl}
                          name={org.title}
                          slug={org.slug}
                          className="w-12 h-12 rounded-lg"
                          size={28}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {org.programSlug && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.bg} ${theme.text} border ${theme.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                            {org.programSlug}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => org._id && removeSaved(org._id)}
                          disabled={busyId === org._id}
                          className="text-tertiary hover:text-error transition-colors p-1.5 rounded-md hover:bg-surface"
                          title="Remove from saved"
                        >
                          {busyId === org._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Org Title & Subtitle */}
                    <div className="mt-3">
                      <Link
                        href={org.slug ? `/organizations/${org.slug}` : org.targetId ? `/organizations/${org.targetId}` : '/organizations'}
                        className="font-heading font-bold text-base text-primary group-hover:text-accent transition-colors line-clamp-1 block"
                      >
                        {org.title}
                      </Link>
                      {org.subtitle && (
                        <p className="text-xs text-secondary line-clamp-2 mt-1 leading-relaxed">
                          {org.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Tech Stack Chips */}
                    {org.techStack && org.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {org.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-hairline text-muted"
                          >
                            {tech}
                          </span>
                        ))}
                        {org.techStack.length > 3 && (
                          <span className="text-[10px] font-mono px-1 py-0.5 text-tertiary">
                            +{org.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer link */}
                  <div className="pt-4 mt-3 border-t border-hairline/60 flex items-center justify-between text-xs font-semibold">
                    <Link
                      href={org.slug ? `/organizations/${org.slug}` : org.targetId ? `/organizations/${org.targetId}` : '/organizations'}
                      className="text-accent hover:underline inline-flex items-center gap-1"
                    >
                      View Organization
                      <ChevronRight size={13} />
                    </Link>
                    <Link
                      href={`/projects?q=${encodeURIComponent(org.title)}`}
                      className="text-[11px] text-muted hover:text-primary transition-colors"
                    >
                      Find Projects
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state with top recommended org showcase & official logos */
          <div className="rounded-2xl border border-hairline bg-surface/50 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Pin Your Target Organizations</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-primary">
                  You haven&apos;t saved any organizations yet
                </h3>
                <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                  Bookmark open-source organizations in the directory to quickly track project ideas, tech requirements, and mentor channels right from this command center.
                </p>
                <div className="pt-2">
                  <Link
                    href="/organizations"
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-page text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Building2 size={14} /> Browse Organizations Directory
                  </Link>
                </div>
              </div>

              {/* Recommended Quick Orgs with Official Logos */}
              <div className="w-full md:w-auto p-4 rounded-xl border border-hairline bg-page/60 space-y-3 min-w-[280px]">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-tertiary flex items-center justify-between">
                  <span>Popular Target Orgs</span>
                  <span className="text-[10px] text-accent">GSoC / LFX</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Apache Software Foundation', slug: 'apache-software-foundation' },
                    { name: 'Cloud Native Computing Foundation (CNCF)', slug: 'cloud-native-computing-foundation-cncf' },
                    { name: 'Python Software Foundation', slug: 'python-software-foundation' },
                    { name: 'Mozilla', slug: 'mozilla' },
                  ].map((rec) => (
                    <Link
                      key={rec.slug}
                      href={`/organizations/${rec.slug}`}
                      className="flex items-center gap-2 p-2 rounded-lg border border-hairline/80 bg-surface/80 hover:border-accent/40 hover:bg-surface transition-all group"
                    >
                      <OrgLogo name={rec.name} slug={rec.slug} className="w-6 h-6 rounded" size={14} />
                      <span className="text-xs font-medium text-primary group-hover:text-accent line-clamp-1">
                        {rec.name.split(' ')[0]}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. STATS STRIP - Modern cards with visual depth */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-hairline/80 bg-surface/50 hover:bg-surface transition-colors space-y-1">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
            <FolderGit2 size={12} /> Tracked Applications
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-primary">{applicationCount}</div>
          <div className="text-xs font-medium text-secondary">
            {draftingCount} drafting · {submittedCount} submitted
          </div>
        </div>

        <div className="p-4 rounded-xl border border-hairline/80 bg-surface/50 hover:bg-surface transition-colors space-y-1">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={12} /> Active Deadlines
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-primary">{activeDeadlineCount}</div>
          <div className="text-xs font-medium text-secondary">
            Live schedule tracking
          </div>
        </div>

        <div className="p-4 rounded-xl border border-hairline/80 bg-surface/50 hover:bg-surface transition-colors space-y-1">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
            <Bookmark size={12} /> Bookmarks
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-primary">{savedCount}</div>
          <div className="text-xs font-medium text-secondary">
            {savedOrganizations.length} orgs · {savedCount - savedOrganizations.length} projects
          </div>
        </div>

        <div className="p-4 rounded-xl border border-hairline/80 bg-surface/50 hover:bg-surface transition-colors space-y-1">
          <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={12} /> Contributor Readiness
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-primary">
            {draftingCount > 0 ? '78%' : applicationCount > 0 ? '60%' : '100%'}
          </div>
          <div className="text-xs font-medium text-success">
            Profile active & ready
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-error/20 bg-error/5 text-xs text-error font-bold">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto underline text-[10px]">Dismiss</button>
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
                <BookOpen size={16} />
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
                    <div className="flex items-center gap-3.5">
                      {item.type === 'organization' ? (
                        <div className="p-1 rounded-xl bg-page border border-hairline shrink-0">
                          <OrgLogo
                            logoUrl={item.logoUrl}
                            name={item.title}
                            slug={item.slug}
                            className="w-10 h-10 rounded-lg"
                            size={22}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-surface-raised border border-hairline flex items-center justify-center shrink-0 text-accent">
                          <FolderGit2 size={18} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-tertiary">
                            {item.type}
                          </span>
                          {item.programSlug && (
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-surface border border-hairline text-accent">
                              {item.programSlug}
                            </span>
                          )}
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
                          <p className="text-xs text-secondary mt-0.5 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => item._id && removeSaved(item._id)}
                      disabled={busyId === item._id}
                      className="text-tertiary hover:text-error transition-colors p-1.5 rounded-lg hover:bg-surface"
                      title="Remove bookmark"
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
