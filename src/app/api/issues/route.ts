import { NextRequest, NextResponse } from 'next/server';
import { listIssues } from '@/lib/issues/repository';
import type { IssueListFilter, UserSkillProfile } from '@/lib/issues/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('q') || searchParams.get('search');
    const language = searchParams.get('lang') || searchParams.get('language');
    const program = searchParams.get('program');
    const difficulty = searchParams.get('difficulty');
    const scope = searchParams.get('scope');
    const mentorOnly = searchParams.get('mentorOnly');
    const sortBy = (searchParams.get('sort') || searchParams.get('sortBy') || 'recommended') as
      | 'recommended'
      | 'newest'
      | 'comments-asc'
      | 'effort-asc';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10) || 10));

    const filter: IssueListFilter = {
      search,
      language,
      program,
      difficulty,
      scope,
      hasMentor: mentorOnly === 'true' || mentorOnly === '1' ? true : undefined,
      sortBy,
      page,
      limit,
    };

    // Parse user skill profile from query params if passed
    const rawSkills = searchParams.get('skills');
    const rawLevel = searchParams.get('level') as 'beginner' | 'intermediate' | 'advanced' | null;

    let profile: UserSkillProfile | null = null;
    if (rawSkills && rawSkills.trim()) {
      const skills = rawSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (skills.length > 0) {
        profile = {
          skills,
          experienceLevel: rawLevel || 'beginner',
        };
      }
    }

    const data = listIssues(filter, profile);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
