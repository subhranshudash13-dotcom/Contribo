import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import {
  apiError,
  isNextResponse,
  parseMutationBody,
  requireUserMutation,
} from '@/lib/api';
import { safeLogError } from '@/lib/security';

export const runtime = 'nodejs';

/** Maximum request body size for PDF export (512 KiB). */
const MAX_PDF_BODY_BYTES = 512 * 1024;

/** Hard execution timeout for Python PDF process (20 seconds). */
const PDF_TIMEOUT_MS = 20_000;

/** Maximum stderr bytes captured for logging (4 KiB). */
const MAX_STDERR_BYTES = 4096;

/**
 * Resolve the Python interpreter binary across operating systems and CI environments.
 */
export function getPythonBinary(): string {
  const envBin = process.env.PYTHON_BIN?.trim();
  if (envBin) return envBin;
  return process.platform === 'win32' ? 'python' : 'python3';
}

/**
 * Sanitize proposal title for Content-Disposition filename.
 */
export function sanitizePdfFilename(rawTitle: unknown): string {
  const titleStr = typeof rawTitle === 'string' ? rawTitle : 'proposal';
  const clean = titleStr
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .slice(0, 50);
  return `${clean || 'contribo-proposal'}.pdf`;
}

/**
 * POST /api/proposals/export-pdf
 * Accepts proposal JSON payload, invokes the Python ReportLab engine,
 * and streams back the generated PDF.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Session authentication and request mutation origin check
    const authResult = await requireUserMutation(req, { maxBytes: MAX_PDF_BODY_BYTES });
    if (isNextResponse(authResult)) {
      return authResult;
    }

    // 2. Parse body with strict size capping (512 KiB)
    const body = await parseMutationBody(req, { maxBytes: MAX_PDF_BODY_BYTES });
    if (isNextResponse(body)) {
      return body;
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return apiError('Invalid proposal payload', 400);
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'proposal_pdf_engine.py');
    const filename = sanitizePdfFilename(body.title);
    const pythonBin = getPythonBinary();

    return await new Promise<NextResponse>((resolve) => {
      let resolved = false;

      const finish = (res: NextResponse) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        resolve(res);
      };

      // Spawn python engine
      const pyProcess = spawn(pythonBin, [scriptPath, '-'], {
        windowsHide: true,
      });

      // Hard timeout timer
      const timer = setTimeout(() => {
        try {
          pyProcess.kill('SIGKILL');
        } catch {
          // ignore already exited process
        }
        safeLogError('Python PDF engine timed out after 20s:', new Error('Timeout'));
        finish(
          apiError(
            'PDF generation timed out. Use client-side Print to PDF or Markdown export.',
            504,
            { code: 'timeout' }
          )
        );
      }, PDF_TIMEOUT_MS);

      // Handle client disconnect / abort signal
      if (req.signal) {
        req.signal.addEventListener(
          'abort',
          () => {
            try {
              pyProcess.kill('SIGKILL');
            } catch {
              // ignore
            }
          },
          { once: true }
        );
      }

      const chunks: Buffer[] = [];
      let stderrData = '';

      pyProcess.stdout.on('data', (data) => {
        chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
      });

      pyProcess.stderr.on('data', (data) => {
        if (stderrData.length < MAX_STDERR_BYTES) {
          stderrData += data.toString().slice(0, MAX_STDERR_BYTES - stderrData.length);
        }
      });

      pyProcess.on('error', (err) => {
        safeLogError('Failed to spawn Python PDF process:', err);
        finish(
          apiError(
            'Python PDF engine unavailable. Use client-side Print to PDF or Markdown export.',
            503,
            { code: 'service_unavailable' }
          )
        );
      });

      pyProcess.on('close', (code) => {
        if (code !== 0) {
          safeLogError('Python PDF engine returned non-zero exit code:', {
            code,
            stderr: stderrData,
          });
          finish(
            apiError(
              'PDF generation failed in Python engine. Use client-side Print to PDF or Markdown export.',
              500,
              { code: 'server' }
            )
          );
          return;
        }

        const pdfBuffer = Buffer.concat(chunks);
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

      // Write JSON to stdin and close pipe safely
      try {
        pyProcess.stdin.write(JSON.stringify(body));
        pyProcess.stdin.end();
      } catch (writeErr) {
        safeLogError('Failed to write proposal body to Python stdin:', writeErr);
        try {
          pyProcess.kill('SIGKILL');
        } catch {
          // ignore
        }
        finish(apiError('Failed to communicate with PDF engine', 500, { code: 'server' }));
      }
    });
  } catch (error) {
    safeLogError('Unexpected error in /api/proposals/export-pdf:', error);
    return apiError('Internal Server Error', 500, { code: 'server' });
  }
}
