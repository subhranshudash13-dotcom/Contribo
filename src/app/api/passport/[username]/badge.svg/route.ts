import { generatePassportBadgeSvg, sanitizeUsername } from '@/lib/passport';
import { getPublicPassport } from '@/lib/repositories/passport';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  props: { params: Promise<{ username: string }> | { username: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const username = sanitizeUsername(resolvedParams?.username);

    if (!username) {
      const svg = generatePassportBadgeSvg({ notFound: true });
      return new Response(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      });
    }

    const passport = await getPublicPassport(username);

    let svg: string;
    if (!passport) {
      svg = generatePassportBadgeSvg({ notFound: true });
    } else if (passport.isPrivate) {
      svg = generatePassportBadgeSvg({ isPrivate: true });
    } else {
      svg = generatePassportBadgeSvg({
        score: passport.score,
        tierLabel: passport.tier.label,
      });
    }

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('GET /api/passport/[username]/badge.svg failed:', error);
    const svg = generatePassportBadgeSvg({ notFound: true });
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
      },
    });
  }
}
