import {
  apiError,
  apiOk,
  isNextResponse,
  isValidEmail,
  parseMutationBody,
  privateNoStoreHeaders,
} from '@/lib/api';
import { auth } from '@/auth';
import { COLLECTIONS, getCollection } from '@/lib/db';
import { safeLogError } from '@/lib/security';

const ALLOWED_TYPES = new Set([
  'Feature Request',
  'Bug Report',
  'General Feedback',
  'UI/UX',
  'Data Issue',
  'Other',
]);

/**
 * POST /api/feedback
 * Public (optional auth). Validates tightly and fails honestly if persistence fails.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await parseMutationBody(req);
    if (isNextResponse(body)) return body;

    const rawType = typeof body.type === 'string' ? body.type.trim() : 'Feature Request';
    const feedbackType = ALLOWED_TYPES.has(rawType) ? rawType : 'Other';

    const subject =
      typeof body.subject === 'string'
        ? body.subject.trim().slice(0, 200)
        : 'General Feedback';

    const message =
      typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

    if (message.length < 5) {
      return apiError(
        'Please provide a feedback description (minimum 5 characters).',
        400
      );
    }

    let userEmail =
      typeof body.userEmail === 'string'
        ? body.userEmail.trim().slice(0, 254)
        : session?.user?.email || '';

    if (userEmail && !isValidEmail(userEmail)) {
      return apiError('Invalid email address', 400);
    }
    if (!userEmail) {
      userEmail = 'anonymous@contribo.community';
    }

    const doc = {
      type: feedbackType,
      subject: subject || 'General Feedback',
      message,
      userEmail,
      userId: session?.user?.id || null,
      createdAt: new Date(),
    };

    try {
      const col = await getCollection(COLLECTIONS.userFeedback);
      await col.insertOne(doc);
    } catch (err) {
      safeLogError('Feedback insert failed:', err);
      return apiError(
        'Could not save feedback right now. Please try again shortly.',
        503
      );
    }

    return apiOk(
      {
        success: true,
        message: 'Thank you for your feedback! Our team has received your submission.',
      },
      201,
      privateNoStoreHeaders()
    );
  } catch (error) {
    safeLogError('POST /api/feedback failed:', error);
    return apiError('Failed to submit feedback', 500);
  }
}
