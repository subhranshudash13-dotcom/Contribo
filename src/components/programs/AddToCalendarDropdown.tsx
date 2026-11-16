'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  toWebcalUrl,
} from '@/lib/calendar/ical-generator';

interface AddToCalendarDropdownProps {
  programSlug?: string;
  programName?: string;
  events?: { event: string; date: string | Date }[];
  officialWebsite?: string;
  variant?: 'program' | 'global';
  className?: string;
}

export function AddToCalendarDropdown({
  programSlug,
  programName = 'Open Source Programs',
  events = [],
  officialWebsite,
  variant = 'program',
  className = '',
}: AddToCalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Find next upcoming milestone event
  const nextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    const now = new Date().getTime();
    const sorted = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const future = sorted.find((e) => new Date(e.date).getTime() >= now);
    return future || sorted[sorted.length - 1];
  }, [events]);

  const downloadUrl = useMemo(() => {
    if (variant === 'global' || !programSlug) {
      return '/api/programs/calendar.ics';
    }
    return `/api/programs/${programSlug}/calendar.ics`;
  }, [variant, programSlug]);

  const handleCopyWebcal = () => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const absoluteHttpUrl = `${origin}${downloadUrl}`;
    const webcalUrl = toWebcalUrl(absoluteHttpUrl);

    navigator.clipboard.writeText(webcalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const googleUrl = useMemo(() => {
    if (nextEvent) {
      return buildGoogleCalendarUrl({
        title: `${programName}: ${nextEvent.event}`,
        startDate: nextEvent.date,
        details: `Official milestone for ${programName}. Track full timeline, proposal guidelines, and organizations on Contribo (https://contribo.org/programs/${programSlug || ''}).`,
        location: officialWebsite || 'Online / Remote',
      });
    }
    return buildGoogleCalendarUrl({
      title: `${programName} 2026 Deadlines`,
      startDate: '2026-03-24',
      details: `Contribo Open Source Milestone Tracker for ${programName} (https://contribo.org).`,
      location: officialWebsite || 'Online',
    });
  }, [nextEvent, programName, programSlug, officialWebsite]);

  const outlookUrl = useMemo(() => {
    if (nextEvent) {
      return buildOutlookCalendarUrl({
        title: `${programName}: ${nextEvent.event}`,
        startDate: nextEvent.date,
        details: `Official milestone for ${programName}. Track full timeline on Contribo (https://contribo.org/programs/${programSlug || ''}).`,
        location: officialWebsite || 'Online / Remote',
      });
    }
    return buildOutlookCalendarUrl({
      title: `${programName} 2026 Deadlines`,
      startDate: '2026-03-24',
      details: `Contribo Open Source Milestone Tracker for ${programName} (https://contribo.org).`,
      location: officialWebsite || 'Online',
    });
  }, [nextEvent, programName, programSlug, officialWebsite]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-hairline bg-surface hover:bg-surface-raised text-primary text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Calendar size={15} className="text-accent" />
        <span>Add to Calendar</span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-hairline bg-surface/95 backdrop-blur-md p-1.5 shadow-2xl z-50 animate-fade-in divide-y divide-hairline">
          {/* Header pill */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                {variant === 'global' ? 'All Programs 2026' : programName}
              </span>
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold bg-accent/15 text-accent">
                <Sparkles size={9} /> RFC 5545
              </span>
            </div>
            {nextEvent && (
              <p className="mt-1 font-mono text-xs text-primary truncate">
                Next: <span className="font-bold text-accent">{nextEvent.event}</span>
              </p>
            )}
          </div>

          {/* Web Intents & Downloads */}
          <div className="py-1">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-page transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                Google Calendar
              </span>
              <ExternalLink size={12} className="text-muted" />
            </a>

            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-page transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0078D4]" />
                Outlook / Office 365
              </span>
              <ExternalLink size={12} className="text-muted" />
            </a>

            <a
              href={downloadUrl}
              download
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-page transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Download size={14} className="text-emerald-500" />
                Download .ICS File
              </span>
              <span className="font-mono text-[10px] text-muted">Apple / Native</span>
            </a>
          </div>

          {/* Live Subscription Feed */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCopyWebcal}
              className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-page transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {copied ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Copy size={14} className="text-accent" />
                )}
                <span className={copied ? 'text-emerald-500 font-bold' : ''}>
                  {copied ? 'Feed URL Copied!' : 'Copy Live Feed URL'}
                </span>
              </span>
              <span className="font-mono text-[10px] text-muted">webcal://</span>
            </button>
            <p className="px-3 pb-1.5 pt-0.5 font-mono text-[10px] text-muted/70 leading-relaxed">
              Auto-syncs updates into Apple Calendar, Google Calendar, or Thunderbird.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

