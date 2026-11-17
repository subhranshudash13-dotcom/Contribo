'use client';

import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  GitMerge,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { GitHubContributionItem, ActivitySyncStats } from '@/lib/github/activity-sync';

interface VerifiedActivityFeedProps {
  username: string;
  initialItems?: GitHubContributionItem[];
  initialStats?: ActivitySyncStats;
  canSync?: boolean;
}

export function VerifiedActivityFeed({
  username,
  initialItems = [],
  initialStats,
  canSync = true,
}: VerifiedActivityFeedProps) {
  const [items, setItems] = useState<GitHubContributionItem[]>(initialItems);
  const [stats, setStats] = useState<ActivitySyncStats | undefined>(initialStats);
  const [filter, setFilter] = useState<'ALL' | 'MERGED' | 'OPEN' | 'TARGET_ORG'>('ALL');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  // Load activity on initial render if initialItems empty
  useEffect(() => {
    if (initialItems.length === 0) {
      setLoading(true);
      fetch(`/api/passport/${encodeURIComponent(username)}/activity`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.items)) {
            setItems(data.items);
            setStats(data.stats);
            if (data.cooldownSeconds) setCooldown(data.cooldownSeconds);
          }
        })
        .catch((err) => console.error('Failed to load GitHub activity:', err))
        .finally(() => setLoading(false));
    }
  }, [username, initialItems.length]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSync = async () => {
    if (syncing || cooldown > 0) return;
    setSyncing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/sync-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('GitHub activity updated successfully!');
        if (data.stats) setStats(data.stats);
        if (data.cooldownSeconds) setCooldown(data.cooldownSeconds);

        // Refresh feed items
        const feedRes = await fetch(`/api/passport/${encodeURIComponent(username)}/activity`);
        if (feedRes.ok) {
          const feedData = await feedRes.json();
          if (feedData.items) setItems(feedData.items);
        }
      } else if (res.status === 429) {
        setMessage(data.error || 'Sync is on cooldown.');
        if (data.retryAfter) setCooldown(data.retryAfter);
      } else {
        setMessage(data.error || 'Failed to sync GitHub activity.');
      }
    } catch {
      setMessage('Network error while requesting sync.');
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'MERGED') return item.state === 'MERGED';
    if (filter === 'OPEN') return item.state === 'OPEN';
    if (filter === 'TARGET_ORG') return item.isTargetOrg;
    return true;
  });

  return (
    <div className="w-full space-y-5 rounded-2xl border border-hairline/80 bg-surface/90 backdrop-blur-xl p-5 sm:p-7 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-accent" />
            <h3 className="text-base font-heading font-bold text-primary">
              Verified GitHub Contribution Telemetry
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              <ShieldCheck className="w-3 h-3" /> Real-Time Telemetry
            </span>
          </div>
          <p className="text-xs text-secondary">
            Verified pull requests, issue resolutions, and target organization commits mapped to Contribo credentials.
          </p>
        </div>

        {canSync && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || cooldown > 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline bg-surface-raised hover:bg-surface text-xs font-bold text-primary hover:text-accent transition-all disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>
                {syncing
                  ? 'Syncing...'
                  : cooldown > 0
                  ? `Cooldown (${cooldown}s)`
                  : 'Sync Activity'}
              </span>
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="p-3 text-xs rounded-xl bg-accent/10 border border-accent/20 text-accent animate-in fade-in duration-200">
          {message}
        </div>
      )}

      {/* Summary Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-hairline bg-surface-raised/60">
            <span className="text-[11px] font-semibold text-secondary block">Total PRs</span>
            <span className="text-lg font-heading font-extrabold text-primary">
              {stats.totalCount}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-hairline bg-surface-raised/60">
            <span className="text-[11px] font-semibold text-secondary block">Merged PRs</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-heading font-extrabold text-violet-600 dark:text-violet-400">
                {stats.mergedCount}
              </span>
              <GitMerge className="w-3.5 h-3.5 text-violet-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl border border-hairline bg-surface-raised/60">
            <span className="text-[11px] font-semibold text-secondary block">Target Org Merges</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.targetOrgCount}
              </span>
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>

          <div className="p-3 rounded-xl border border-hairline bg-surface-raised/60">
            <span className="text-[11px] font-semibold text-secondary block">Lines Impacted</span>
            <span className="text-lg font-heading font-extrabold text-primary">
              +{stats.totalLinesChanged.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Auto-Verified Milestones Pills */}
      {stats && stats.verifiedMilestones.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-hairline bg-surface-raised/40">
          <span className="text-xs font-bold text-secondary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Verified Signals:
          </span>
          {stats.verifiedMilestones.map((m, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
            >
              <CheckCircle2 className="w-3 h-3" />
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'ALL'
              ? 'bg-primary text-page'
              : 'text-secondary hover:text-primary hover:bg-surface-raised'
          }`}
        >
          All Activity ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('MERGED')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'MERGED'
              ? 'bg-primary text-page'
              : 'text-secondary hover:text-primary hover:bg-surface-raised'
          }`}
        >
          Merged ({items.filter((i) => i.state === 'MERGED').length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('OPEN')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'OPEN'
              ? 'bg-primary text-page'
              : 'text-secondary hover:text-primary hover:bg-surface-raised'
          }`}
        >
          Open ({items.filter((i) => i.state === 'OPEN').length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('TARGET_ORG')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'TARGET_ORG'
              ? 'bg-primary text-page'
              : 'text-secondary hover:text-primary hover:bg-surface-raised'
          }`}
        >
          Target Orgs ({items.filter((i) => i.isTargetOrg).length})
        </button>
      </div>

      {/* Contribution Feed Timeline */}
      {loading ? (
        <div className="py-8 text-center text-xs text-secondary">
          Loading verified telemetry from GitHub...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-secondary border border-dashed border-hairline rounded-xl">
          No GitHub pull requests found for the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isMerged = item.state === 'MERGED';
            const isOpen = item.state === 'OPEN';

            return (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-hairline bg-surface hover:bg-surface-raised transition-all shadow-2xs"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isMerged
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                          : isOpen
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {isMerged ? <GitMerge className="w-3 h-3" /> : <GitPullRequest className="w-3 h-3" />}
                      {item.state}
                    </span>

                    {/* Repository Badge */}
                    <span className="font-mono text-xs font-semibold text-secondary">
                      {item.repository}
                    </span>

                    {/* Target Org Match Pill */}
                    {item.isTargetOrg && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Building2 className="w-2.5 h-2.5" />
                        {item.matchedOrgName || 'Target Organization'}
                      </span>
                    )}
                  </div>

                  {/* PR Title */}
                  <h4 className="text-xs sm:text-sm font-semibold text-primary line-clamp-1 group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>

                  {/* Telemetry Stats */}
                  <div className="flex items-center gap-3 text-[11px] text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {(item.additions > 0 || item.deletions > 0) && (
                      <span className="font-mono">
                        <span className="text-emerald-600">+{item.additions}</span>{' '}
                        <span className="text-rose-500">-{item.deletions}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Link to GitHub */}
                <div className="flex sm:flex-col items-center justify-end shrink-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-accent p-2 rounded-lg border border-hairline/60 hover:bg-surface-raised transition-colors"
                  >
                    <span>View PR</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
