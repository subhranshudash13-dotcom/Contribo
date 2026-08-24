import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { apiError } from '@/lib/api';
import { safeLogError } from '@/lib/security';

export const runtime = 'nodejs';

/**
 * POST /api/proposals/export-pdf
 * Accepts proposal JSON payload, invokes the Python ReportLab engine,
 * and streams back the generated PDF.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return apiError('Invalid proposal payload', 400);
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'proposal_pdf_engine.py');
    const title = (body.title || 'proposal').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').slice(0, 50);
    const filename = `${title || 'contribo-proposal'}.pdf`;

    return new Promise<NextResponse>((resolve) => {
      // Spawn python engine
      const pyProcess = spawn('python', [scriptPath, '-'], {
        windowsHide: true,
      });

      const chunks: Buffer[] = [];
      let stderrData = '';

      pyProcess.stdout.on('data', (data) => {
        chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
      });

      pyProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pyProcess.on('error', (err) => {
        safeLogError('Failed to spawn Python PDF process:', err);
        resolve(
          apiError(
            `Python PDF engine failed to start: ${err.message}`,
            500
          )
        );
      });

      pyProcess.on('close', (code) => {
        if (code !== 0) {
          safeLogError('Python PDF engine returned non-zero code:', { code, stderrData });
          resolve(
            apiError(
              stderrData || 'PDF generation failed in Python engine',
              500
            )
          );
          return;
        }

        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': String(pdfBuffer.length),
              'Cache-Control': 'no-store, max-age=0',
            },
          })
        );
      });

      // Write JSON to stdin and close pipe
      pyProcess.stdin.write(JSON.stringify(body));
      pyProcess.stdin.end();
    });
  } catch (error) {
    safeLogError('Unexpected error in /api/proposals/export-pdf:', error);
    return apiError(
      error instanceof Error ? error.message : 'Internal Server Error',
      500
    );
  }
}
