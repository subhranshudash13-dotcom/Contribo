import { apiError, apiOk } from '@/lib/api';
import { getClient, resolveDatabaseName } from '@/lib/db';

/**
 * GET /api/health
 * Liveness + MongoDB readiness probe for deploy checks and monitoring.
 */
export async function GET() {
  const started = Date.now();
  try {
    const client = await getClient();
    const admin = client.db().admin();
    await admin.ping();

    return apiOk(
      {
        status: 'ok',
        service: 'contribo',
        database: resolveDatabaseName(),
        mongodb: 'up',
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      200,
      {
        'Cache-Control': 'no-store',
      }
    );
  } catch (error) {
    console.error('GET /api/health failed:', error);
    return apiError('Service unhealthy', 503, {
      status: 'error',
      mongodb: 'down',
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  }
}

export const dynamic = 'force-dynamic';
