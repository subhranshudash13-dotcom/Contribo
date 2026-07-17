import { apiError, apiOk, publicCacheHeaders } from '@/lib/api';
import { getProjectById } from '@/lib/repositories/projects';
import { toObjectId } from '@/lib/serialize';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError('Project id is required', 400);
    }

    if (!toObjectId(id)) {
      return apiError('Invalid project id', 400);
    }

    const project = await getProjectById(id);
    if (!project) {
      return apiError('Project not found', 404);
    }

    return apiOk({ project }, 200, publicCacheHeaders(60, 300));
  } catch (error) {
    console.error('GET /api/projects/[id] failed:', error);
    return apiError('Failed to fetch project', 500);
  }
}
