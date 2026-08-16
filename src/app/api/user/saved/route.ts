import {
  apiError,
  apiOk,
  requireUserId,
  requireUserMutation,
  isNextResponse,
  parseMutationBody,
  privateNoStoreHeaders,
  normalizeStringArray,
} from '@/lib/api';
import {
  listSavedItems,
  saveItem,
  unsaveItem,
  unsaveByTarget,
} from '@/lib/repositories/dashboard';
import type { SavedItemType } from '@/../types';
import { safeLogError } from '@/lib/security';

function isSavedType(value: unknown): value is SavedItemType {
  return value === 'project' || value === 'organization';
}

/** GET /api/user/saved?type=project|organization */
export async function GET(req: Request) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const type = isSavedType(typeParam) ? typeParam : undefined;

    const items = await listSavedItems(authResult.userId, type);
    return apiOk({ items, total: items.length }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('GET /api/user/saved failed:', error);
    return apiError('Failed to fetch saved items', 500);
  }
}

/** POST /api/user/saved — bookmark a project or organization (idempotent). */
export async function POST(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    if (!isSavedType(body.type)) {
      return apiError('type must be "project" or "organization"', 400);
    }
    if (typeof body.targetId !== 'string' || !body.targetId) {
      return apiError('targetId is required', 400);
    }
    if (typeof body.title !== 'string' || !body.title.trim()) {
      return apiError('title is required', 400);
    }

    try {
      const item = await saveItem(authResult.userId, {
        type: body.type,
        targetId: String(body.targetId).slice(0, 64),
        title: body.title.trim().slice(0, 200),
        subtitle:
          typeof body.subtitle === 'string'
            ? body.subtitle.trim().slice(0, 200)
            : undefined,
        slug: typeof body.slug === 'string' ? body.slug.trim().slice(0, 120) : undefined,
        programSlug:
          typeof body.programSlug === 'string'
            ? body.programSlug.trim().slice(0, 80)
            : undefined,
        techStack:
          normalizeStringArray(body.techStack, { maxItems: 20, maxItemLen: 48 }) ||
          undefined,
      });

      return apiOk({ item }, 201, privateNoStoreHeaders());
    } catch (e) {
      if (e instanceof Error && (e as Error & { statusCode?: number }).statusCode === 400) {
        return apiError(e.message, 400);
      }
      throw e;
    }
  } catch (error) {
    safeLogError('POST /api/user/saved failed:', error);
    return apiError('Failed to save item', 500);
  }
}

/** DELETE /api/user/saved?id=...  OR  ?type=...&targetId=... */
export async function DELETE(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const targetId = searchParams.get('targetId');

    let removed = false;
    if (id) {
      removed = await unsaveItem(authResult.userId, id);
    } else if (isSavedType(type) && targetId) {
      removed = await unsaveByTarget(authResult.userId, type, targetId);
    } else {
      return apiError('Provide id, or type + targetId', 400);
    }

    if (!removed) {
      return apiError('Saved item not found', 404);
    }

    return apiOk({ success: true }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('DELETE /api/user/saved failed:', error);
    return apiError('Failed to remove saved item', 500);
  }
}
