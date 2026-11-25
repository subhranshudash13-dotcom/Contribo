import { NextResponse } from 'next/server';
import { verifyAttestationReceipt } from '@/lib/passport/attestation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const candidate =
      'receipt' in body && (body as { receipt?: unknown }).receipt !== undefined
        ? (body as { receipt: unknown }).receipt
        : body;

    const result = verifyAttestationReceipt(candidate, { checkRegistry: true });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('POST /api/passport/verify failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
