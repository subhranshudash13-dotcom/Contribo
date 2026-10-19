import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import {
  apiError,
  isNextResponse,
  parseJsonBody,
  requireUserId,
} from '@/lib/api';
import { safeLogError } from '@/lib/security';

export const runtime = 'nodejs';

const MAX_PDF_BODY_BYTES = 512 * 1024;
const MAX_STDERR_BYTES = 4 * 1024;
const PDF_TIMEOUT_MS = 20_000;

const pythonBin =
  process.env.PYTHON_BIN?.trim() ||
  (process.platform === 'win32' ? 'python' : 'python3');

/**
 * POST /api/proposals/export-pdf
 * Accepts proposal JSON payload, invokes the Python ReportLab engine,
 * and returns the generated PDF.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireUserId();
    if (isNextResponse(authResult)) return authResult;

    const body = await parseJsonBody(req, { maxBytes: MAX_PDF_BODY_BYTES });
    if (isNextResponse(body)) return body;

    const scriptPath = path.join(process.cwd(), 'scripts', 'proposal_pdf_engine.py');
    const rawTitle = typeof body.title === 'string' ? body.title : 'proposal';
    const title = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .slice(0, 50);
    const filename = `${title || 'contribo-proposal'}.pdf`;

    return await new Promise<NextResponse>((resolve) => {
      let settled = false;

      const pyProcess = spawn(pythonBin, [scriptPath, '-'], {
        windowsHide: true,
      });

      const chunks: Buffer[] = [];
      let stderrData = '';

      const cleanup = () => {
        clearTimeout(timeout);
        req.signal.removeEventListener('abort', handleAbort);
      };

      const finish = (response: NextResponse) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(response);
      };

      const handleAbort = () => {
        if (!pyProcess.killed) {
          pyProcess.kill('SIGKILL');
        }
      };

      const timeout = setTimeout(() => {
        safeLogError('PDF engine timed out:', { timeoutMs: PDF_TIMEOUT_MS });
        if (!pyProcess.killed) {
          pyProcess.kill('SIGKILL');
        }
        finish(apiError('PDF generation timed out', 504));
      }, PDF_TIMEOUT_MS);

      req.signal.addEventListener('abort', handleAbort, { once: true });

      pyProcess.stdout.on('data', (data) => {
        chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
      });

      pyProcess.stderr.on('data', (data) => {
        stderrData = `${stderrData}${data.toString()}`.slice(-MAX_STDERR_BYTES);
      });

      pyProcess.on('error', (err) => {
        safeLogError('Failed to spawn Python PDF process:', err);
        finish(apiError('PDF generation is unavailable right now', 500));
      });

      pyProcess.on('close', (code) => {
        if (settled) return;

        if (code !== 0) {
          safeLogError('Python PDF engine returned a non-zero code:', {
            code,
            stderr: stderrData,
          });
          finish(apiError('PDF generation failed', 500));
          return;
        }

        const pdfBuffer = Buffer.concat(chunks);
        if (pdfBuffer.length === 0) {
          safeLogError('Python PDF engine returned an empty document:', {
            code,
            stderr: stderrData,
          });
          finish(apiError('PDF generation failed', 500));
          return;
        }

        finish(
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

      pyProcess.stdin.on('error', (err) => {
        // A broken pipe is reported through the process close event as well.
        safeLogError('PDF engine stdin stream failed:', err);
      });

      try {
        pyProcess.stdin.write(JSON.stringify(body));
        pyProcess.stdin.end();
      } catch (err) {
        safeLogError('Failed to write proposal payload to PDF engine:', err);
        if (!pyProcess.killed) pyProcess.kill('SIGKILL');
        finish(apiError('PDF generation failed', 500));
      }
    });
  } catch (error) {
    safeLogError('Unexpected error in /api/proposals/export-pdf:', error);
    return apiError('PDF generation failed', 500);
  }
}
