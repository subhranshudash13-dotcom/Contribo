import { apiError, apiOk } from '@/lib/api';
import { getDb } from '@/lib/db';

/**
 * GET /api/health
 * Liveness + MongoDB readiness probe for deploy checks and monitoring.
 * Does not expose database names or connection details.
 */
export async function GET() {
  const started = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return apiOk(
      {
        status: 'ok',
        service: 'contribo',
        mongodb: 'up',
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      200,
      {
        'Cache-Control': 'no-store',
      }
    );
  } catch {
    // Do not log raw connection errors (may include URI fragments).
    console.error('GET /api/health failed: database unreachable');
    return apiError('Service unhealthy', 503, {
      status: 'error',
      mongodb: 'down',
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  }
}

export const dynamic = 'force-dynamic';
