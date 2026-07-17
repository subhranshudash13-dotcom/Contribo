import { NextResponse } from 'next/server';
import { auth } from '@/auth';

/** Standard JSON error response. */
export function apiError(message: string, status = 500, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Standard JSON success response. */
export function apiOk<T extends object>(
  data: T,
  status = 200,
  headers?: HeadersInit
) {
  return NextResponse.json(data, { status, headers });
}

/** Cache-Control for public, semi-static catalog data. */
export function publicCacheHeaders(seconds = 60, staleWhileRevalidate = 300): HeadersInit {
  return {
    'Cache-Control': `public, s-maxage=${seconds}, stale-while-revalidate=${staleWhileRevalidate}`,
  };
}

/** No-store for personalized / mutating responses. */
export function privateNoStoreHeaders(): HeadersInit {
  return {
    'Cache-Control': 'private, no-store',
  };
}

/** Parse pagination from URL search params with sane clamps. */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults?: { limit?: number; maxLimit?: number }
) {
  const maxLimit = defaults?.maxLimit ?? 200;
  const defaultLimit = defaults?.limit ?? 50;
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || String(defaultLimit), 10) || defaultLimit, 1),
    maxLimit
  );
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
}

/** Safely parse a JSON request body; returns a 400 response on failure. */
export async function parseJsonBody(
  req: Request
): Promise<Record<string, unknown> | NextResponse> {
  try {
    const body = await req.json();
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return apiError('JSON body must be an object', 400);
    }
    return body as Record<string, unknown>;
  } catch {
    return apiError('Invalid JSON body', 400);
  }
}

/** Require an authenticated session; returns user id or a NextResponse error. */
export async function requireUserId(): Promise<
  { userId: string; email?: string | null; name?: string | null } | NextResponse
> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError('Unauthorized', 401);
  }
  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

/** Clamp and clean a free-text query string for search/filter use. */
export function sanitizeSearchQuery(raw: string | null | undefined, maxLen = 80): string {
  if (!raw) return '';
  return raw.trim().slice(0, maxLen);
}

/** Coerce unknown into a trimmed string array with length caps. */
export function normalizeStringArray(
  input: unknown,
  options?: { maxItems?: number; maxItemLen?: number }
): string[] | null {
  if (!Array.isArray(input)) return null;
  const maxItems = options?.maxItems ?? 40;
  const maxItemLen = options?.maxItemLen ?? 64;
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const t = item.trim().slice(0, maxItemLen);
    if (t) out.push(t);
    if (out.length >= maxItems) break;
  }
  return out;
}
