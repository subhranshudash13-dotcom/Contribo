import { NextRequest } from 'next/server';
import { listPrograms } from '@/lib/repositories/programs';
import { generateConsolidatedIcal } from '@/lib/calendar/ical-generator';
import { FALLBACK_PROGRAMS_CALENDAR } from '@/lib/calendar/programs-data';
import { safeLogError } from '@/lib/security';
import type { Program } from '../../../../types';

export async function GET(req: NextRequest) {
  try {
    let programs: (Program | (typeof FALLBACK_PROGRAMS_CALENDAR)[number])[] = [];

    try {
      const dbPrograms = await listPrograms();
      if (Array.isArray(dbPrograms) && dbPrograms.length > 0) {
        programs = dbPrograms as unknown as Program[];
      }
    } catch (err) {
      safeLogError('Failed to fetch programs from database for calendar, using fallback:', err);
    }

    if (programs.length === 0) {
      programs = FALLBACK_PROGRAMS_CALENDAR;
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    const icsContent = generateConsolidatedIcal(programs, { baseUrl });

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="contribo-all-programs-2026.ics"',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    safeLogError('GET /api/programs/calendar.ics error:', error);
    return new Response('Failed to generate consolidated calendar', { status: 500 });
  }
}

