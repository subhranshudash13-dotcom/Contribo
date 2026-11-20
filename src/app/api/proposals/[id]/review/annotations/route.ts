import { NextRequest, NextResponse } from 'next/server';
import {
  addAnnotationReply,
  addProposalAnnotation,
  updateAnnotationStatus,
} from '@/lib/repositories/proposal-reviews';
import type { AnnotationStatus, ReviewerRole } from '@/lib/proposal-studio/review-types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if adding a reply to an existing annotation
    if (body.annotationId && body.replyContent) {
      const updated = await addAnnotationReply(id, String(body.annotationId), {
        authorName: String(body.authorName || 'Reviewer'),
        content: String(body.replyContent),
      });

      if (!targetAnnotationExists(updated)) {
        return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
      }
      return NextResponse.json({ annotation: updated }, { status: 201 });
    }

    // Creating new annotation
    if (!body.sectionId || !body.content) {
      return NextResponse.json(
        { error: 'sectionId and content are required' },
        { status: 400 }
      );
    }

    const annotation = await addProposalAnnotation(id, {
      sectionId: String(body.sectionId),
      authorName: String(body.authorName || 'Peer Reviewer'),
      authorAvatar: body.authorAvatar ? String(body.authorAvatar) : undefined,
      authorRole: (body.authorRole as ReviewerRole) || 'peer',
      selectedText: body.selectedText ? String(body.selectedText) : undefined,
      startOffset: typeof body.startOffset === 'number' ? body.startOffset : undefined,
      endOffset: typeof body.endOffset === 'number' ? body.endOffset : undefined,
      content: String(body.content),
    });

    return NextResponse.json({ annotation }, { status: 201 });
  } catch (error) {
    console.error('Failed to handle annotation mutation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.annotationId || !body.status) {
      return NextResponse.json(
        { error: 'annotationId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses: AnnotationStatus[] = ['open', 'addressed', 'resolved'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid annotation status' }, { status: 400 });
    }

    const updated = await updateAnnotationStatus(
      id,
      String(body.annotationId),
      body.status as AnnotationStatus
    );

    if (!updated) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    return NextResponse.json({ annotation: updated });
  } catch (error) {
    console.error('Failed to update annotation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function targetAnnotationExists(val: unknown): boolean {
  return val !== null && val !== undefined;
}
