import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  checkBodySize,
  checkMutation,
  checkSameOrigin,
  createRequestId,
  MAX_JSON_BODY_BYTES,
  safeLogError,
  type SecurityDenial,
} from '@/lib/security';

/** Stable error codes returned to clients (mapped by lib/client/errors). */
export type ApiErrorCode =
  | 'offline'
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'server'
  | 'unknown'
  | 'service_unavailable';

function defaultCodeForStatus(status: number): ApiErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 400 || status === 422 || status === 413) return 'validation';
  if (status === 429) return 'rate_limited';
  if (status === 503) return 'service_unavailable';
  if (status >= 500) return 'server';
  return 'unknown';
}

const BASE_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function mergeHeaders(extra?: HeadersInit, requestId?: string): HeadersInit {
  const h = new Headers(BASE_SECURITY_HEADERS);
  if (requestId) h.set('X-Request-Id', requestId);
  if (extra) {
    const more = new Headers(extra);
    more.forEach((v, k) => h.set(k, v));
  }
  return h;
}

function denialToResponse(denial: SecurityDenial): NextResponse {
  return apiError(denial.message, denial.status, { code: denial.code });
}

/** Standard JSON error response (always includes `error` + `code`). */
export function apiError(
  message: string,
  status = 500,
  extra?: Record<string, unknown> & { code?: ApiErrorCode }
) {
  const { code, ...rest } = extra || {};
  const requestId = createRequestId();
  return NextResponse.json(
    {
      error: message,
      code: code || defaultCodeForStatus(status),
      requestId,
      ...rest,
    },
    {
      status,
      headers: mergeHeaders(undefined, requestId),
    }
  );
}

/** Standard JSON success response. */
export function apiOk<T extends object>(
  data: T,
  status = 200,
  headers?: HeadersInit
) {
  const requestId = createRequestId();
  return NextResponse.json(data, {
    status,
    headers: mergeHeaders(headers, requestId),
  });
}

/**
 * Wrap an async route handler with consistent try/catch logging.
 */
export function withApiHandler(
  handler: (req: Request) => Promise<NextResponse>,
  options?: { failureMessage?: string; failureStatus?: number }
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      safeLogError(options?.failureMessage || 'API handler failed:', error);
      return apiError(
        options?.failureMessage || 'Internal server error',
        options?.failureStatus ?? 500
      );
    }
  };
}

/** Cache-Control for public, semi-static catalog data. */
export function publicCacheHeaders(
  seconds = 60,
  staleWhileRevalidate = 300
): HeadersInit {
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
    Math.max(
      parseInt(searchParams.get('limit') || String(defaultLimit), 10) ||
        defaultLimit,
      1
    ),
    maxLimit
  );
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
}

/**
 * Safely parse a JSON request body with size caps.
 */
export async function parseJsonBody(
  req: Request,
  options?: { maxBytes?: number }
): Promise<Record<string, unknown> | NextResponse> {
  const maxBytes = options?.maxBytes ?? MAX_JSON_BODY_BYTES;

  const sizeCheck = checkBodySize(req, maxBytes);
  if (!sizeCheck.ok) return denialToResponse(sizeCheck);

  try {
    const text = await req.text();
    if (text.length > maxBytes) {
      return apiError(
        `Request body too large (max ${Math.floor(maxBytes / 1024)}KB)`,
        413
      );
    }
    if (!text.trim()) {
      return apiError('JSON body is required', 400);
    }

    const body = JSON.parse(text) as unknown;
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return apiError('JSON body must be an object', 400);
    }
    return body as Record<string, unknown>;
  } catch {
    return apiError('Invalid JSON body', 400);
  }
}

/**
 * Parse JSON after same-origin + size guards (POST/PATCH/DELETE from browsers).
 */
export async function parseMutationBody(
  req: Request,
  options?: { maxBytes?: number }
): Promise<Record<string, unknown> | NextResponse> {
  const mutation = checkMutation(req, options);
  if (!mutation.ok) return denialToResponse(mutation);
  return parseJsonBody(req, options);
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

/**
 * Auth + mutation guards for owner-scoped write endpoints.
 */
export async function requireUserMutation(
  req: Request,
  options?: { maxBytes?: number }
): Promise<
  { userId: string; email?: string | null; name?: string | null } | NextResponse
> {
  const mutation = checkMutation(req, options);
  if (!mutation.ok) return denialToResponse(mutation);
  return requireUserId();
}

/** Same-origin only (e.g. public feedback POST). */
export function requireSameOrigin(req: Request): NextResponse | null {
  const result = checkSameOrigin(req);
  if (!result.ok) return denialToResponse(result);
  return null;
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

/** Clamp and clean a free-text query string for search/filter use. */
export function sanitizeSearchQuery(
  raw: string | null | undefined,
  maxLen = 80
): string {
  if (!raw) return '';
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
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
    const t = item
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .trim()
      .slice(0, maxItemLen);
    if (t) out.push(t);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Validate a simple email shape (not full RFC). */
export function isValidEmail(value: string): boolean {
  if (!value || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Clamp a finite number into [min, max]. */
export function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
