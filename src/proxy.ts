import { NextResponse } from "next/server";
import { auth } from "./auth";
import {
  checkRateLimit,
  attachRateLimitHeaders,
  RATE_LIMIT_TIERS,
  type RateLimitOptions,
  type RateLimitResult,
} from "./lib/rate-limit";

function rateLimitResponse(rateResult: RateLimitResult, requestId: string) {
  const res = new NextResponse(
    JSON.stringify({
      error: "Too many requests. Please try again in a minute.",
      code: "rate_limited",
      requestId,
      retryAfter: rateResult.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
  attachRateLimitHeaders(res.headers, rateResult);
  return res;
}

function buildCsp(): string {
  // Tight default CSP; Next.js needs 'unsafe-inline' for some styles in dev.
  // Images: self + common avatar/CDN hosts used by the product.
  const isProd = process.env.NODE_ENV === "production";
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://generativelanguage.googleapis.com https://api.openai.com https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

function withSecurityHeaders(res: NextResponse, requestId: string): NextResponse {
  res.headers.set("X-Request-Id", requestId);
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
export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const ip = clientIp(req);
  const method = req.method.toUpperCase();

  const requestId =
    req.headers.get("x-request-id") ||
    `req_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

  // Rate limit API routes
  if (pathname.startsWith("/api")) {
    if (
      pathname.startsWith("/api/health") ||
      pathname.startsWith("/api/connectivity")
    ) {
      const res = await checkRateLimit(`health:${ip}`, { limit: 120, windowMs: 60_000 });
      if (!res.success) {
        return rateLimitResponse(res, requestId);
      }
      return withSecurityHeaders(NextResponse.next(), requestId);
    }

    // Auth endpoints: strictly guard credential submissions against brute-force, while allowing smooth session checks
    if (pathname.startsWith("/api/auth")) {
      const isAuthMutation =
        method === "POST" &&
        (pathname.includes("/callback/credentials") ||
          pathname.includes("/signin") ||
          pathname.includes("/register"));

      const tier: RateLimitOptions = isAuthMutation
        ? { limit: 20, windowMs: 60_000 }
        : { limit: 180, windowMs: 60_000 };
      const prefix = isAuthMutation ? "auth-mutation" : "auth-read";
      const res = await checkRateLimit(`${prefix}:${ip}`, tier);
      if (!res.success) {
        return rateLimitResponse(res, requestId);
      }
      return withSecurityHeaders(NextResponse.next(), requestId);
    }

    // AI / expensive mutations
    const isAiOrHeavy =
      pathname.startsWith("/api/match") ||
      pathname.includes("/ai-improve") ||
      pathname.startsWith("/api/feedback");

    if (isAiOrHeavy && (method === "POST" || method === "PUT" || method === "PATCH")) {
      const res = await checkRateLimit(`ai:${ip}`, RATE_LIMIT_TIERS.AI_HEAVY_ANON);
      if (!res.success) {
        return rateLimitResponse(res, requestId);
      }
    }

    // PDF Export
    if (pathname.includes("/export-pdf")) {
      const res = await checkRateLimit(`pdf:${ip}`, RATE_LIMIT_TIERS.PDF_EXPORT);
      if (!res.success) {
        return rateLimitResponse(res, requestId);
      }
    }

    // User + proposal writes
    const isUserWrite =
      pathname.startsWith("/api/user") ||
      (pathname.startsWith("/api/proposals") &&
        (method === "POST" || method === "PATCH" || method === "DELETE"));

    if (isUserWrite) {
      const res = await checkRateLimit(`userwrite:${ip}`, { limit: 60, windowMs: 60_000 });
      if (!res.success) {
        return rateLimitResponse(res, requestId);
      }
    } else if (!isAiOrHeavy && !pathname.includes("/export-pdf")) {
      // General API reads
      const res = await checkRateLimit(`general:${ip}`, RATE_LIMIT_TIERS.PUBLIC_READ);
      if (!res.success) {
        return rateLimitResponse(res, requestId);
      }
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login" && req.auth) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || "/dashboard";
    return NextResponse.redirect(new URL(callbackUrl, req.nextUrl.origin));
  }

  return withSecurityHeaders(NextResponse.next(), requestId);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp|.*\\.woff2).*)",
  ],
};
