import {
  apiError,
  apiOk,
  requireUserId,
  requireUserMutation,
  isNextResponse,
  parseMutationBody,
  privateNoStoreHeaders,
} from '@/lib/api';
import {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  isValidApplicationStatus,
} from '@/lib/repositories/dashboard';
import { safeLogError } from '@/lib/security';

/** GET /api/user/applications */
export async function GET() {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const applications = await listApplications(authResult.userId);
    return apiOk(
      { applications, total: applications.length },
      200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('GET /api/user/applications failed:', error);
    return apiError('Failed to fetch applications', 500);
  }
}

/** POST /api/user/applications — track a project application (idempotent by projectId). */
export async function POST(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    if (typeof body.projectTitle !== 'string' || !body.projectTitle.trim()) {
      return apiError('projectTitle is required', 400);
    }
    if (typeof body.orgName !== 'string' || !body.orgName.trim()) {
      return apiError('orgName is required', 400);
    }

    if (body.status !== undefined && !isValidApplicationStatus(body.status)) {
      return apiError('Invalid status', 400);
    }

    // Bound free-text fields early so oversized payloads never hit the DB layer.
    const projectTitle = body.projectTitle.trim().slice(0, 300);
    const orgName = body.orgName.trim().slice(0, 200);
    const notes =
      typeof body.notes === 'string' ? body.notes.trim().slice(0, 5000) : undefined;

    const { application, created } = await createApplication(authResult.userId, {
      projectId: typeof body.projectId === 'string' ? body.projectId.slice(0, 64) : undefined,
      projectTitle,
      orgName,
      orgSlug:
        typeof body.orgSlug === 'string' ? body.orgSlug.trim().slice(0, 120) : undefined,
      programId:
        typeof body.programId === 'string' ? body.programId.slice(0, 64) : undefined,
      programSlug:
        typeof body.programSlug === 'string'
          ? body.programSlug.trim().slice(0, 80)
          : undefined,
      programName:
        typeof body.programName === 'string'
          ? body.programName.trim().slice(0, 200)
          : undefined,
      status: isValidApplicationStatus(body.status) ? body.status : undefined,
      notes,
      deadline:
        typeof body.deadline === 'string' || body.deadline === null
          ? (body.deadline as string | null)
          : undefined,
    });

    return apiOk(
      { application, created },
      created ? 201 : 200,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('POST /api/user/applications failed:', error);
    return apiError('Failed to create application', 500);
  }
}

/** PATCH /api/user/applications — body must include id */
export async function PATCH(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    if (typeof body.id !== 'string' || !body.id) {
      return apiError('id is required', 400);
    }

    if (body.status !== undefined && !isValidApplicationStatus(body.status)) {
      return apiError('Invalid status', 400);
    }

    try {
      const application = await updateApplication(authResult.userId, body.id, {
        status: isValidApplicationStatus(body.status) ? body.status : undefined,
        notes: typeof body.notes === 'string' ? body.notes : undefined,
        deadline:
          typeof body.deadline === 'string' || body.deadline === null
            ? (body.deadline as string | null)
            : undefined,
        projectTitle: typeof body.projectTitle === 'string' ? body.projectTitle : undefined,
      });

      if (!application) {
        return apiError('Application not found', 404);
      }

      return apiOk({ application }, 200, privateNoStoreHeaders());
    } catch (e) {
      if (e instanceof Error && e.message === 'Invalid application status') {
        return apiError(e.message, 400);
      }
      throw e;
    }
  } catch (error) {
    safeLogError('PATCH /api/user/applications failed:', error);
    return apiError('Failed to update application', 500);
  }
}

/** DELETE /api/user/applications?id=... */
export async function DELETE(req: Request) {
  try {
    const authResult = await requireUserMutation(req);
    if (isNextResponse(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return apiError('id is required', 400);
    }

    const removed = await deleteApplication(authResult.userId, id);
    if (!removed) {
      return apiError('Application not found', 404);
    }

    return apiOk({ success: true }, 200, privateNoStoreHeaders());
  } catch (error) {
    safeLogError('DELETE /api/user/applications failed:', error);
    return apiError('Failed to delete application', 500);
  }
}
