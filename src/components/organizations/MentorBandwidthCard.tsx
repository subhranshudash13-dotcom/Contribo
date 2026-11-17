'use client';

import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Shield,
  Users,
} from 'lucide-react';
import type {
  BusFactorRisk,
  CommunicationChannel,
} from '@/lib/organizations/types';

interface MentorBandwidthCardProps {
  activeMaintainers: number;
  busFactor: BusFactorRisk;
  channels: CommunicationChannel[];
  bestTimeToSubmit: {
    recommendedWindow: string;
    timezone: string;
    peakActivityDays: string[];
    tips: string;
  };
}

export function MentorBandwidthCard({
  activeMaintainers,
  busFactor,
  channels,
  bestTimeToSubmit,
}: MentorBandwidthCardProps) {
  const busFactorColor =
    busFactor === 'Low'
      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      : busFactor === 'Moderate'
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      : 'text-rose-500 bg-rose-500/10 border-rose-500/20';

  return (
    <div className="rounded-3xl border border-hairline bg-surface p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Users className="w-3 h-3" />
            Mentorship Capacity
          </span>
          <h2 className="mt-1.5 text-xl font-heading font-bold text-primary">
            Mentor Bandwidth & Communication Channels
          </h2>
          <p className="text-xs font-mono text-muted">
            Maintainer distribution, community triage channels, and proposal submission strategy
          </p>
        </div>

        <div className={`px-3 py-1 rounded-xl border font-mono text-xs font-bold ${busFactorColor}`}>
          Bus Factor: {busFactor}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Communication Channels */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider">
            Verified Community Channels
          </h3>

          <div className="space-y-2">
            {channels.map((chan, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl border border-hairline bg-page/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-heading font-bold text-primary flex items-center gap-1.5">
                      <span>{chan.channel}</span>
                      {chan.recommended && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/20">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-muted">
                      Avg Response: {chan.responsiveness}
                    </div>
                  </div>
                </div>

                {chan.url && (
                  <a
                    href={chan.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-hairline bg-surface text-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submission Strategy & Timing */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider">
            Applicant Recommendation & Timing
          </h3>

          <div className="rounded-2xl border border-hairline bg-page/50 p-4 space-y-3 text-xs font-mono">
            <div>
              <span className="text-muted block text-[11px]">Recommended Window:</span>
              <span className="font-bold text-primary">{bestTimeToSubmit.recommendedWindow}</span>
            </div>

            <div>
              <span className="text-muted block text-[11px]">Peak Maintainer Activity:</span>
              <span className="text-secondary">{bestTimeToSubmit.peakActivityDays.join(', ')}</span>
            </div>

            <div className="pt-2 border-t border-hairline/60">
              <span className="text-muted block text-[11px] mb-1">Mentor Advisory:</span>
              <p className="text-secondary leading-relaxed">{bestTimeToSubmit.tips}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
