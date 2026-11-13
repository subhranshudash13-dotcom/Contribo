import { NextRequest } from 'next/server';
import { getProgramBySlug } from '@/lib/repositories/programs';
import { generateProgramIcal, type CalendarProgramInput } from '@/lib/calendar/ical-generator';
import { FALLBACK_PROGRAMS_CALENDAR } from '@/lib/calendar/programs-data';
import { safeLogError } from '@/lib/security';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const normalized = slug?.trim().toLowerCase();

    if (!normalized) {
      return new Response('Program slug is required', { status: 400 });
    }

    // Try repository first
    let program: CalendarProgramInput | null = null;
    try {
      const dbProgram = await getProgramBySlug(normalized);
      if (dbProgram) {
        program = dbProgram as unknown as CalendarProgramInput;
      }
    } catch (err) {
      safeLogError('Failed to query program from database, falling back to static calendar:', err);
    }

    // Fallback to static catalog if database query returned null or was offline
    if (!program) {
      program = FALLBACK_PROGRAMS_CALENDAR.find((p) => p.slug === normalized) || null;
    }

    if (!program) {
      return new Response(`Program "${slug}" not found`, { status: 404 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    const icsContent = generateProgramIcal(program, { baseUrl });

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="contribo-${normalized}-timeline.ics"`,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    safeLogError('GET /api/programs/[slug]/calendar.ics error:', error);
    return new Response('Failed to generate program calendar', { status: 500 });
  }
}

