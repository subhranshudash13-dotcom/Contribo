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
export async function GET() {
  const started = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return apiOk(
      {
        status: 'ok' as const,
        online: true,
        mongodb: 'up' as const,
        latencyMs: Date.now() - started,
        timestamp,
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch {
    console.error('GET /api/connectivity: database unreachable (service degraded)');
    // Still 200 — the app process is up; only Mongo is down.
    // Offline UI uses HTTP success as "server reachable".
    return apiOk(
      {
        status: 'degraded' as const,
        online: true,
        mongodb: 'down' as const,
        latencyMs: Date.now() - started,
        timestamp,
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  }
}

export const dynamic = 'force-dynamic';
