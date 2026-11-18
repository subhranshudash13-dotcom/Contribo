/**
 * Production-ready distributed rate limiting with Upstash Redis / Redis support
 * and high-performance in-memory sliding-window fallback for local development and offline environments.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter: number; // seconds
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

// In-memory sliding-window log store
class MemoryRateLimiter {
  private store = new Map<string, number[]>();
  private lastCleanup = Date.now();

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    this.cleanupIfNeeded(now);

    const timestamps = this.store.get(key) || [];
    const windowStart = now - windowMs;

    // Filter out expired timestamps
    const valid = timestamps.filter((t) => t > windowStart);

    if (valid.length >= limit) {
      const oldestValid = valid[0];
      const resetTimeMs = oldestValid + windowMs;
      const retryAfter = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      this.store.set(key, valid);

      return {
        success: false,
        limit,
        remaining: 0,
        reset: Math.ceil(resetTimeMs / 1000),
        retryAfter,
      };
    }

    valid.push(now);
    this.store.set(key, valid);

    const resetTimeMs = now + windowMs;
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - valid.length),
      reset: Math.ceil(resetTimeMs / 1000),
      retryAfter: 0,
    };
  }

  private cleanupIfNeeded(now: number) {
    if (now - this.lastCleanup > 60_000) {
      this.lastCleanup = now;
      for (const [k, times] of this.store.entries()) {
        const filtered = times.filter((t) => now - t < 120_000);
        if (filtered.length === 0) {
          this.store.delete(k);
        } else {
          this.store.set(k, filtered);
        }
      }
    }
  }

  resetAll() {
    this.store.clear();
  }
}

const memoryLimiter = new MemoryRateLimiter();

/**
 * Tiered Rate Limiting Configurations (as requested in Issue #117)
 */
export const RATE_LIMIT_TIERS = {
  // Public Read Routes (/api/projects, /api/organizations, /api/search): 60 req / min
  PUBLIC_READ: { limit: 60, windowMs: 60_000 },

  // Personalized Authenticated Routes (/api/user/*, /api/proposals/*): 120 req / min
  AUTHENTICATED_USER: { limit: 120, windowMs: 60_000 },

  // Heavy Compute / AI Routes (/api/match, /api/proposals/[id]/ai-improve)
  AI_HEAVY_AUTH: { limit: 10, windowMs: 300_000 }, // 10 req / 5 min
  AI_HEAVY_ANON: { limit: 3, windowMs: 600_000 }, // 3 req / 10 min

  // PDF Export (/api/proposals/export-pdf): 5 req / min
  PDF_EXPORT: { limit: 5, windowMs: 60_000 },
} as const;

/**
 * Check rate limit for a specific identifier.
 * Automatically tries Upstash Redis REST if configured via env, else falls back to memory.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (redisUrl && redisToken) {
    try {
      return await checkUpstashRedis(identifier, options, redisUrl, redisToken);
    } catch {
      // If Upstash fails or has network timeout, smoothly degrade to memory limiter
    }
  }

  return memoryLimiter.check(identifier, options.limit, options.windowMs);
}

/**
 * Direct HTTP call to Upstash Redis REST API to keep zero-dependency and edge compatibility
 */
async function checkUpstashRedis(
  identifier: string,
  options: RateLimitOptions,
  url: string,
  token: string
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
  const key = `ratelimit:${identifier}:${options.windowMs}`;

  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, windowSeconds, 'NX'],
      ['TTL', key],
    ]),
    signal: AbortSignal.timeout(1500),
  });

  if (!res.ok) {
    throw new Error(`Upstash returned ${res.status}`);
  }

  const results = (await res.json()) as Array<{ result: number }>;
  const currentCount = Number(results[0]?.result ?? 1);
  const ttlSeconds = Number(results[2]?.result ?? windowSeconds);

  const reset = Math.ceil(Date.now() / 1000) + Math.max(0, ttlSeconds);
  const success = currentCount <= options.limit;

  return {
    success,
    limit: options.limit,
    remaining: Math.max(0, options.limit - currentCount),
    reset,
    retryAfter: success ? 0 : Math.max(1, ttlSeconds),
  };
}

/**
 * Extract clean IP address from standard Edge / proxy headers
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp?.trim()) return xRealIp.trim();

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim();

  return '127.0.0.1';
}

/**
 * Attach standardized X-RateLimit-* headers to a response
 */
export function attachRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(result.reset));
  if (!result.success && result.retryAfter > 0) {
    headers.set('Retry-After', String(result.retryAfter));
  }
}
