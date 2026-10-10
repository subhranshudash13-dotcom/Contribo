import { apiOk } from '@/lib/api';
import { getDb } from '@/lib/db';

/**
 * GET /api/connectivity
 *
 * Lightweight client-facing probe used by offline / degraded-network UI.
 * - Always returns HTTP 200 when the Next.js process is reachable so the
 *   client can distinguish "no internet / app down" from "DB degraded".
 * - Does not expose connection strings or database names.
 *
 * Response shape:
 * {
 *   status: 'ok' | 'degraded',
 *   online: true,
 *   mongodb: 'up' | 'down',
 *   latencyMs: number,
 *   timestamp: string
 * }
 */
let lastProbeTime = 0;
let lastProbeResult: {
  status: 'ok' | 'degraded';
  mongodb: 'up' | 'down';
  latencyMs: number;
} | null = null;
const PROBE_CACHE_TTL_MS = 5_000;

export async function GET() {
  const now = Date.now();
  const timestamp = new Date().toISOString();

  // Return cached probe status if checked within the last 5 seconds.
  // This shields the database from connection exhaustion when hundreds of concurrent tabs probe connectivity.
  if (lastProbeResult && now - lastProbeTime < PROBE_CACHE_TTL_MS) {
    return apiOk(
      {
        status: lastProbeResult.status,
        online: true,
        mongodb: lastProbeResult.mongodb,
        latencyMs: lastProbeResult.latencyMs,
        timestamp,
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  }

  const started = Date.now();

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - started;

    lastProbeResult = {
      status: 'ok',
      mongodb: 'up',
      latencyMs,
    };
    lastProbeTime = now;

    return apiOk(
      {
        status: 'ok' as const,
        online: true,
        mongodb: 'up' as const,
        latencyMs,
        timestamp,
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch {
    console.error('GET /api/connectivity: database unreachable (service degraded)');
    const latencyMs = Date.now() - started;

    lastProbeResult = {
      status: 'degraded',
      mongodb: 'down',
      latencyMs,
    };
    lastProbeTime = now;

    // Still 200 — the app process is up; only Mongo is down.
    // Offline UI uses HTTP success as "server reachable".
    return apiOk(
      {
        status: 'degraded' as const,
        online: true,
        mongodb: 'down' as const,
        latencyMs,
        timestamp,
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  }
}

export const dynamic = 'force-dynamic';
