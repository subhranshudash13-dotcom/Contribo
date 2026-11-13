/**
 * ical-generator.ts
 *
 * RFC 5545 Compliant iCalendar (.ics) Generator & Web Intent Builder.
 * Supports line folding at 75 octets, UTC normalization, deterministic UIDs,
 * multi-tier reminder alarms (VALARM), and direct calendar web intents.
 */

import type { Program } from '../../../types';
import type { ProgramCalendarData } from './programs-data';

export interface CalendarEvent {
  uid?: string;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
  startDate: string | Date;
  endDate?: string | Date;
  allDay?: boolean;
  programSlug?: string;
  programName?: string;
  organizer?: string;
  alarms?: boolean;
}

export interface CalendarOptions {
  calName?: string;
  calDescription?: string;
  prodId?: string;
  sourceUrl?: string;
  events: CalendarEvent[];
}

/**
 * RFC 5545 Section 3.1:
 * Lines of text SHOULD NOT be longer than 75 octets, excluding the line break.
 * Long lines are folded by inserting CRLF followed by a single space character.
 */
export function foldLine(line: string, maxOctets = 75): string {
  if (Buffer.byteLength(line, 'utf8') <= maxOctets) {
    return line;
  }

  const lines: string[] = [];
  let currentLine = '';
  let currentBytes = 0;
  let isFirst = true;

  for (const char of line) {
    const charBytes = Buffer.byteLength(char, 'utf8');
    const limit = isFirst ? maxOctets : maxOctets - 1; // space prefix consumes 1 octet

    if (currentBytes + charBytes > limit) {
      lines.push(currentLine);
      currentLine = char;
      currentBytes = charBytes;
      isFirst = false;
    } else {
      currentLine += char;
      currentBytes += charBytes;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\r\n ');
}

/**
 * RFC 5545 Section 3.3.11:
 * Special characters in text values must be escaped: \, ;, ,, and newlines.
 */
export function escapeText(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * Slugify a title for deterministic UID generation.
 */
export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse a date string or Date object into a standard Date.
 */
export function parseDate(val: string | Date): Date {
  if (val instanceof Date) return val;
  // If format is YYYY-MM-DD
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const [year, month, day] = val.trim().split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 18, 0, 0)); // default 18:00 UTC cutoff
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Format a Date to UTC YYYYMMDDTHHMMSSZ format.
 */
export function formatUtcDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Format Date to YYYYMMDD date-only format.
 */
export function formatUtcDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return `${year}${month}${day}`;
}

/**
 * Deterministic UID generation matching RFC 5545 requirements.
 */
export function generateEventUid(event: CalendarEvent): string {
  if (event.uid) return event.uid;
  const slug = event.programSlug ? slugifyText(event.programSlug) : 'global';
  const eventSlug = slugifyText(event.summary);
  const start = parseDate(event.startDate);
  const year = start.getUTCFullYear();
  return `milestone_${slug}_${year}_${eventSlug}@contribo.org`;
}

/**
 * Builds standard VALARM blocks (-P7D, -P2D, -PT2H) for contributor reminders.
 */
function buildAlarmBlocks(summary: string): string[] {
  const cleanSummary = escapeText(summary);
  return [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    foldLine(`DESCRIPTION:Reminder: ${cleanSummary} is in 7 days`),
    'TRIGGER:-P7D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    foldLine(`DESCRIPTION:Reminder: ${cleanSummary} is in 2 days`),
    'TRIGGER:-P2D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    foldLine(`DESCRIPTION:Urgent Reminder: ${cleanSummary} is in 2 hours`),
    'TRIGGER:-PT2H',
    'END:VALARM',
  ];
}

/**
 * Generates an RFC 5545 VCALENDAR string from CalendarOptions.
 */
export function serializeIcalendar(options: CalendarOptions): string {
  const prodId = options.prodId || '-//Contribo//Program Milestone Calendar//EN';
  const calName = options.calName || 'Contribo Program Milestones';
  const calDesc = options.calDescription || 'Open-source program timelines and contributor application milestones';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    foldLine(`PRODID:${prodId}`),
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldLine(`X-WR-CALNAME:${escapeText(calName)}`),
    foldLine(`X-WR-CALDESC:${escapeText(calDesc)}`),
    'X-WR-TIMEZONE:UTC',
  ];

  if (options.sourceUrl) {
    lines.push(foldLine(`SOURCE:${options.sourceUrl}`));
    lines.push(foldLine(`URL:${options.sourceUrl}`));
  }

  const dtstamp = formatUtcDateTime(new Date('2026-01-01T00:00:00Z'));

  for (const event of options.events) {
    const startDate = parseDate(event.startDate);
    const endDate = event.endDate ? parseDate(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration default
    const uid = generateEventUid(event);

    lines.push('BEGIN:VEVENT');
    lines.push(foldLine(`UID:${uid}`));
    lines.push(`DTSTAMP:${dtstamp}`);

    if (event.allDay) {
      // RFC 5545 all-day date: DTSTART;VALUE=DATE:YYYYMMDD, DTEND is next day (exclusive)
      const nextDay = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      lines.push(`DTSTART;VALUE=DATE:${formatUtcDate(startDate)}`);
      lines.push(`DTEND;VALUE=DATE:${formatUtcDate(nextDay)}`);
    } else {
      lines.push(`DTSTART:${formatUtcDateTime(startDate)}`);
      lines.push(`DTEND:${formatUtcDateTime(endDate)}`);
    }

    lines.push(foldLine(`SUMMARY:${escapeText(event.summary)}`));

    const descParts: string[] = [];
    if (event.programName) {
      descParts.push(`Program: ${event.programName}`);
    }
    if (event.organizer) {
      descParts.push(`Organizer: ${event.organizer}`);
    }
    if (event.description) {
      descParts.push(event.description);
    }
    if (event.url) {
      descParts.push(`Official Portal: ${event.url}`);
    }
    if (event.programSlug) {
      descParts.push(`Contribo Guide: https://contribo.org/programs/${event.programSlug}`);
    }

    if (descParts.length > 0) {
      lines.push(foldLine(`DESCRIPTION:${escapeText(descParts.join('\n\n'))}`));
    }

    if (event.location) {
      lines.push(foldLine(`LOCATION:${escapeText(event.location)}`));
    }

    if (event.url) {
      lines.push(foldLine(`URL:${event.url}`));
    }

    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:TRANSPARENT'); // Does not block user's busy schedule

    if (event.alarms !== false) {
      lines.push(...buildAlarmBlocks(event.summary));
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // RFC 5545 requires CRLF line endings throughout
  return lines.join('\r\n') + '\r\n';
}

/**
 * Build RFC 5545 iCalendar for a single program.
 */
export function generateProgramIcal(
  program: Program | ProgramCalendarData,
  options?: { baseUrl?: string }
): string {
  const baseUrl = options?.baseUrl || 'https://contribo.org';
  const events: CalendarEvent[] = (program.timeline || []).map((t) => {
    const eventDate = parseDate(t.date);
    const desc = 'description' in t ? (t as { description?: string }).description : undefined;
    return {
      summary: `${program.name}: ${t.event}`,
      description: desc || `Milestone for ${program.name}. Track dates and prepare proposals early on Contribo.`,
      startDate: eventDate,
      programSlug: program.slug,
      programName: program.name,
      organizer: program.organizer,
      url: program.officialWebsite || `${baseUrl}/programs/${program.slug}`,
      allDay: true,
      alarms: true,
    };
  });

  return serializeIcalendar({
    calName: `${program.name} 2026 Timeline`,
    calDescription: `Key dates, application deadlines, and milestones for ${program.name}. Managed by Contribo.`,
    sourceUrl: `${baseUrl}/api/programs/${program.slug}/calendar.ics`,
    events,
  });
}

/**
 * Build RFC 5545 iCalendar consolidated across all tracked open source programs.
 */
export function generateConsolidatedIcal(
  programs: (Program | ProgramCalendarData)[],
  options?: { baseUrl?: string }
): string {
  const baseUrl = options?.baseUrl || 'https://contribo.org';
  const events: CalendarEvent[] = [];

  for (const program of programs) {
    for (const t of program.timeline || []) {
      const eventDate = parseDate(t.date);
      const desc = 'description' in t ? (t as { description?: string }).description : undefined;
      events.push({
        summary: `${program.name}: ${t.event}`,
        description: desc || `Milestone for ${program.name}. Track dates and prepare proposals early on Contribo.`,
        startDate: eventDate,
        programSlug: program.slug,
        programName: program.name,
        organizer: program.organizer,
        url: program.officialWebsite || `${baseUrl}/programs/${program.slug}`,
        allDay: true,
        alarms: true,
      });
    }
  }

  // Sort events chronologically
  events.sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());

  return serializeIcalendar({
    calName: 'Contribo Open Source Programs 2026',
    calDescription: 'Consolidated application deadlines and milestone timeline for open source programs in 2026.',
    sourceUrl: `${baseUrl}/api/programs/calendar.ics`,
    events,
  });
}

/**
 * Generates a 1-click Google Calendar Web Intent URL.
 */
export function buildGoogleCalendarUrl(event: {
  title: string;
  startDate: string | Date;
  endDate?: string | Date;
  details?: string;
  location?: string;
}): string {
  const start = parseDate(event.startDate);
  const end = event.endDate ? parseDate(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);

  // Format: YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ
  const dates = `${formatUtcDateTime(start)}/${formatUtcDateTime(end)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: event.details || 'Tracked by Contribo Open Source Platform (https://contribo.org)',
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an Outlook.com / Microsoft 365 Calendar Web Intent URL.
 */
export function buildOutlookCalendarUrl(event: {
  title: string;
  startDate: string | Date;
  endDate?: string | Date;
  details?: string;
  location?: string;
}): string {
  const start = parseDate(event.startDate);
  const end = event.endDate ? parseDate(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);

  const params = new URLSearchParams({
    subject: event.title,
    body: event.details || 'Tracked by Contribo Open Source Platform (https://contribo.org)',
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Converts an HTTP/HTTPS URL into a webcal:// feed URL for calendar apps.
 */
export function toWebcalUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, 'webcal://');
}

