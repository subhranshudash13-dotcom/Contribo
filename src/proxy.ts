import { NextResponse } from "next/server";
import { auth } from "./auth";

// Simple in-memory sliding window rate limit cache
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
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
    JSON.stringify({ error: "Too many requests. Please try again in a minute." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}

// Next.js now expects the execution function to be named 'proxy'
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // Avoid logging full paths with query strings (may include tokens/PII)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Rate limit API routes
  if (pathname.startsWith("/api")) {
    // Health checks stay lightly limited so monitors don't trip the general bucket
    if (pathname.startsWith("/api/health")) {
      if (isRateLimited(`health:${ip}`, 120, 60000)) {
        return rateLimitResponse(30);
      }
      return NextResponse.next();
    }

    // Stricter limit for auth, matches, and user mutations: 20 requests per minute
    if (
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/match") ||
      pathname.startsWith("/api/user")
    ) {
      if (isRateLimited(`strict:${ip}`, 20, 60000)) {
        return rateLimitResponse(60);
      }
    } else {
      // General limit for other APIs: 90 requests per minute
      if (isRateLimited(`general:${ip}`, 90, 60000)) {
        return rateLimitResponse(60);
      }
    }
  }

  return NextResponse.next();
});

// Configure matcher to run on api routes and pages (excluding static files)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images or svg files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
