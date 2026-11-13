import { NextResponse, type NextRequest } from 'next/server';
import {
  checkRateLimit,
  getClientIp,
  attachRateLimitHeaders,
  RATE_LIMIT_TIERS,
} from '@/lib/rate-limit';

/**
 * Next.js Edge Middleware for Contribo Platform
 * Provides global security headers, Content Security Policy, and distributed rate limiting.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets, _next internal files, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(req);
  const responseHeaders = new Headers();

  // Generate or propagate unique X-Request-Id across all edge responses
  const requestId =
    req.headers.get('x-request-id') ||
    `req_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
  responseHeaders.set('X-Request-Id', requestId);

  // Content Security Policy & Standard Edge Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' https:;
    frame-ancestors 'none';
    form-action 'self';
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  responseHeaders.set('Content-Security-Policy', cspHeader);
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('X-Frame-Options', 'DENY');
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Distributed Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Determine appropriate tier
    let tier = RATE_LIMIT_TIERS.PUBLIC_READ;
    let identifier = `ip:${clientIp}:${pathname}`;

    if (
      pathname.startsWith('/api/match') ||
      pathname.includes('/ai-improve')
    ) {
      tier = RATE_LIMIT_TIERS.AI_HEAVY_ANON;
      identifier = `ai:${clientIp}`;
    } else if (pathname.includes('/export-pdf')) {
      tier = RATE_LIMIT_TIERS.PDF_EXPORT;
      identifier = `pdf:${clientIp}`;
    } else if (pathname.startsWith('/api/user/')) {
      tier = RATE_LIMIT_TIERS.AUTHENTICATED_USER;
      identifier = `user:${clientIp}`;
    }

    const rateResult = await checkRateLimit(identifier, tier);
    attachRateLimitHeaders(responseHeaders, rateResult);

    if (!rateResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait before retrying.',
          code: 'rate_limited',
          requestId,
          retryAfter: rateResult.retryAfter,
        },
        {
          status: 429,
          headers: responseHeaders,
        }
      );
    }
  }

  const res = NextResponse.next();
  responseHeaders.forEach((val, key) => {
    res.headers.set(key, val);
  });

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
