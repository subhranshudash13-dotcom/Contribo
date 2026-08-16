/**
 * Low-level request security helpers (no dependency on api.ts — avoids cycles).
 */

/** Max JSON body size for mutating API routes (1 MiB). */
export const MAX_JSON_BODY_BYTES = 1_048_576;

/** Max JSON body for AI-heavy routes (512 KiB). */
export const MAX_AI_BODY_BYTES = 512_000;

export type SecurityDenial = {
  ok: false;
  message: string;
  status: number;
  code: 'forbidden' | 'validation';
};

export type SecurityOk = { ok: true };

/**
 * Resolve allowed app origins from env (AUTH_URL / NEXT_PUBLIC_APP_URL).
 * Always includes localhost variants in development.
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  for (const raw of [
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ]) {
    if (!raw?.trim()) continue;
    try {
      origins.add(new URL(raw.trim()).origin);
    } catch {
      // ignore malformed env
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }

  return [...origins];
}

/**
 * CSRF-style origin check for browser-initiated state-changing requests.
 * Allows non-browser clients with neither Origin nor Referer (auth still required).
 */
export function checkSameOrigin(req: Request): SecurityOk | SecurityDenial {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const allowed = getAllowedOrigins();

  if (!origin && !referer) {
    return { ok: true };
  }

  const host = req.headers.get('host');

  if (origin) {
    if (allowed.length === 0) {
      try {
        if (host && new URL(origin).host === host) return { ok: true };
      } catch {
        /* fall through */
      }
      return {
        ok: false,
        message: 'Invalid request origin',
        status: 403,
        code: 'forbidden',
      };
    }
    if (!allowed.includes(origin)) {
      return {
        ok: false,
        message: 'Invalid request origin',
        status: 403,
        code: 'forbidden',
      };
    }
    return { ok: true };
  }

  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowed.length === 0) {
        if (host && new URL(referer).host === host) return { ok: true };
        return {
          ok: false,
          message: 'Invalid request origin',
          status: 403,
          code: 'forbidden',
        };
      }
      if (!allowed.includes(refOrigin)) {
        return {
          ok: false,
          message: 'Invalid request origin',
          status: 403,
          code: 'forbidden',
        };
      }
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: 'Invalid request origin',
        status: 403,
        code: 'forbidden',
      };
    }
  }

  return { ok: true };
}

/** Reject oversized bodies early using Content-Length when present. */
export function checkBodySize(
  req: Request,
  maxBytes: number = MAX_JSON_BODY_BYTES
): SecurityOk | SecurityDenial {
  const len = req.headers.get('content-length');
  if (!len) return { ok: true };
  const n = parseInt(len, 10);
  if (!Number.isFinite(n) || n < 0) {
    return {
      ok: false,
      message: 'Invalid Content-Length',
      status: 400,
      code: 'validation',
    };
  }
  if (n > maxBytes) {
    return {
      ok: false,
      message: `Request body too large (max ${Math.floor(maxBytes / 1024)}KB)`,
      status: 413,
      code: 'validation',
    };
  }
  return { ok: true };
}

/** Generate a short correlation id for logs / response headers (not a secret). */
export function createRequestId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `req_${rand}`;
}

/** Combined mutation pre-check (origin + size). */
export function checkMutation(
  req: Request,
  options?: { maxBytes?: number }
): SecurityOk | SecurityDenial {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { ok: true };
  }

  const origin = checkSameOrigin(req);
  if (!origin.ok) return origin;

  return checkBodySize(req, options?.maxBytes ?? MAX_JSON_BODY_BYTES);
}

/** Redact common secret patterns from strings before logging. */
export function redactSecrets(input: unknown): string {
  const s = typeof input === 'string' ? input : String(input ?? '');
  return s
    .replace(/mongodb(\+srv)?:\/\/[^\s"']+/gi, 'mongodb://[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer [REDACTED]')
    .replace(/sk-[A-Za-z0-9]{10,}/g, 'sk-[REDACTED]')
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/key=[A-Za-z0-9_\-]{10,}/gi, 'key=[REDACTED]')
    .replace(
      /(password|secret|token|api[_-]?key)\s*[:=]\s*["']?[^"'\s,}+]+/gi,
      '$1=[REDACTED]'
    );
}

/** Safe server log — never dumps raw Error messages that may embed URIs. */
export function safeLogError(label: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(label, redactSecrets(error.message));
  } else {
    console.error(label, redactSecrets(error));
  }
}
