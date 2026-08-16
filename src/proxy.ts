import { NextResponse } from "next/server";
import { auth } from "./auth";

// Simple in-memory sliding window rate limit cache (single-instance only).
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const MAX_RATE_LIMIT_KEYS = 10_000;

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    if (rateLimitMap.size >= MAX_RATE_LIMIT_KEYS) {
      const drop = Math.ceil(MAX_RATE_LIMIT_KEYS * 0.1);
      let i = 0;
      for (const k of rateLimitMap.keys()) {
        rateLimitMap.delete(k);
        if (++i >= drop) break;
      }
    }
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return false;
  }

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return false;
  }

  record.count += 1;
  return record.count > limit;
}

function rateLimitResponse(retryAfterSec = 60) {
  return new NextResponse(
    JSON.stringify({
      error: "Too many requests. Please try again in a minute.",
      code: "rate_limited",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}

function buildCsp(): string {
  // Tight default CSP; Next.js needs 'unsafe-inline' for some styles in dev.
  // Images: self + common avatar/CDN hosts used by the product.
  const isProd = process.env.NODE_ENV === "production";
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://generativelanguage.googleapis.com https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("Content-Security-Policy", buildCsp());

  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return res;
}

function clientIp(req: { headers: Headers }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

// Next.js 16: request interceptor is named `proxy` (formerly middleware)
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const ip = clientIp(req);
  const method = req.method.toUpperCase();

  // Rate limit API routes
  if (pathname.startsWith("/api")) {
    if (
      pathname.startsWith("/api/health") ||
      pathname.startsWith("/api/connectivity")
    ) {
      if (isRateLimited(`health:${ip}`, 120, 60_000)) {
        return rateLimitResponse(30);
      }
      return withSecurityHeaders(NextResponse.next());
    }

    // Auth endpoints — protect credential stuffing
    if (pathname.startsWith("/api/auth")) {
      if (isRateLimited(`auth:${ip}`, 15, 60_000)) {
        return rateLimitResponse(60);
      }
      return withSecurityHeaders(NextResponse.next());
    }

    // AI / expensive mutations
    const isAiOrHeavy =
      pathname.startsWith("/api/match") ||
      pathname.includes("/ai-improve") ||
      pathname.startsWith("/api/feedback");

    if (isAiOrHeavy && (method === "POST" || method === "PUT" || method === "PATCH")) {
      if (isRateLimited(`ai:${ip}`, 12, 60_000)) {
        return rateLimitResponse(60);
      }
    }

    // User + proposal writes
    const isUserWrite =
      pathname.startsWith("/api/user") ||
      (pathname.startsWith("/api/proposals") &&
        (method === "POST" || method === "PATCH" || method === "DELETE"));

    if (isUserWrite) {
      if (isRateLimited(`userwrite:${ip}`, 40, 60_000)) {
        return rateLimitResponse(60);
      }
    } else if (!isAiOrHeavy) {
      if (isRateLimited(`general:${ip}`, 100, 60_000)) {
        return rateLimitResponse(60);
      }
    }
  }

  // Soft limit on login page POSTs (server actions hit different paths; this covers page abuse)
  if (pathname.startsWith("/login") && method === "POST") {
    if (isRateLimited(`loginpage:${ip}`, 20, 60_000)) {
      return rateLimitResponse(60);
    }
  }

  return withSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp|.*\\.woff2).*)",
  ],
};
