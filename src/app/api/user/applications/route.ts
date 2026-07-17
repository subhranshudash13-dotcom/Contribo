import {
  apiError,
  apiOk,
  requireUserId,
  isNextResponse,
  parseJsonBody,
  privateNoStoreHeaders,
} from '@/lib/api';
import {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  isValidApplicationStatus,
} from '@/lib/repositories/dashboard';

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
    console.error('GET /api/user/applications failed:', error);
    return apiError('Failed to fetch applications', 500);
  }
}

/** POST /api/user/applications — track a project application (idempotent by projectId). */
export async function POST(req: Request) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const body = await parseJsonBody(req);
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

    const { application, created } = await createApplication(authResult.userId, {
      projectId: typeof body.projectId === 'string' ? body.projectId : undefined,
      projectTitle: body.projectTitle,
      orgName: body.orgName,
      orgSlug: typeof body.orgSlug === 'string' ? body.orgSlug : undefined,
      programId: typeof body.programId === 'string' ? body.programId : undefined,
      programSlug: typeof body.programSlug === 'string' ? body.programSlug : undefined,
      programName: typeof body.programName === 'string' ? body.programName : undefined,
      status: isValidApplicationStatus(body.status) ? body.status : undefined,
      notes: typeof body.notes === 'string' ? body.notes : undefined,
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
    console.error('POST /api/user/applications failed:', error);
    return apiError('Failed to create application', 500);
  }
}

/** PATCH /api/user/applications — body must include id */
export async function PATCH(req: Request) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const body = await parseJsonBody(req);
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
    console.error('PATCH /api/user/applications failed:', error);
    return apiError('Failed to update application', 500);
  }
}

/** DELETE /api/user/applications?id=... */
export async function DELETE(req: Request) {
  try {
    const authResult = await requireUserId();
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
    console.error('DELETE /api/user/applications failed:', error);
    return apiError('Failed to delete application', 500);
  }
}
