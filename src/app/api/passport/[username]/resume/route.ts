import { NextResponse } from 'next/server';
import { sanitizeUsername } from '@/lib/passport';
import { getPublicPassport } from '@/lib/repositories/passport';
import {
  synthesizeResumeFromPassport,
  convertToJsonResume,
  resumeToMarkdown,
} from '@/lib/resume/synthesizer';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ username: string }> | { username: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const username = sanitizeUsername(resolvedParams?.username);

    if (!username) {
      return NextResponse.json(
        { error: 'Invalid or missing username parameter' },
        { status: 400 }
      );
    }

    const passport = await getPublicPassport(username);

    if (!passport) {
      return NextResponse.json(
        { error: `Passport for username "${username}" not found` },
        { status: 404 }
      );
    }

    if (passport.isPrivate) {
      return NextResponse.json(
        { error: `Passport for username "${username}" is private` },
        { status: 403 }
      );
    }

    const resumeData = synthesizeResumeFromPassport(passport);
    const url = new URL(req.url);
    const format = url.searchParams.get('format')?.toLowerCase();

    if (format === 'markdown' || format === 'md') {
      const markdown = resumeToMarkdown(resumeData);
      return new Response(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
        },
      });
    }

    if (format === 'raw') {
      return NextResponse.json(resumeData, {
        headers: {
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
        },
      });
    }

    // Default: schema.org JSON-Resume
    const jsonResume = convertToJsonResume(resumeData);
    return NextResponse.json(jsonResume, {
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('GET /api/passport/[username]/resume failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
