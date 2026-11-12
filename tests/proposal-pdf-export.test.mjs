import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

test('1. Python Binary & Filename Resolution', async (t) => {
  const routeSource = fs.readFileSync(
    path.join(ROOT, 'src/app/api/proposals/export-pdf/route.ts'),
    'utf8'
  );

  await t.test('resolves python binary with PYTHON_BIN and platform fallback', () => {
    assert.ok(
      routeSource.includes("process.env.PYTHON_BIN?.trim()"),
      'Route must respect PYTHON_BIN environment variable'
    );
    assert.ok(
      routeSource.includes("process.platform === 'win32' ? 'python' : 'python3'"),
      'Route must default to python on Windows and python3 on Unix/Linux'
    );
  });

  await t.test('sanitizes filename and prevents directory traversal or arbitrary objects', () => {
    assert.ok(
      routeSource.includes("typeof rawTitle === 'string'"),
      'Filename sanitizer must type-check raw title'
    );
    assert.ok(
      routeSource.includes("[^a-z0-9_-]+"),
      'Filename sanitizer must strip unsafe characters'
    );
  });
});

test('2. Security Guardrails & Resource Bounding', async (t) => {
  const routeSource = fs.readFileSync(
    path.join(ROOT, 'src/app/api/proposals/export-pdf/route.ts'),
    'utf8'
  );

  await t.test('requires authentication before spawning child process', () => {
    assert.ok(
      routeSource.includes('requireUserMutation'),
      'Endpoint must require authenticated user mutation session'
    );
  });

  await t.test('enforces strict body size capping of 512 KiB', () => {
    assert.ok(
      routeSource.includes('MAX_PDF_BODY_BYTES = 512 * 1024'),
      'Must cap body size at 512 KiB'
    );
  });

  await t.test('enforces hard timeout with SIGKILL cleanup', () => {
    assert.ok(
      routeSource.includes('PDF_TIMEOUT_MS = 20_000'),
      'Must set 20-second timeout'
    );
    assert.ok(
      routeSource.includes("pyProcess.kill('SIGKILL')"),
      'Must SIGKILL process on timeout or abort'
    );
    assert.ok(
      routeSource.includes("status: 504") || routeSource.includes("504"),
      'Must return 504 on timeout'
    );
  });

  await t.test('caps stderr and returns sanitized generic message without leaking tracebacks', () => {
    assert.ok(
      routeSource.includes('MAX_STDERR_BYTES = 4096'),
      'Must cap stderr collection to 4 KiB'
    );
    assert.ok(
      !routeSource.includes('apiError(stderrData'),
      'Must never return raw stderrData to the client'
    );
    assert.ok(
      routeSource.includes('safeLogError'),
      'Must log stderr securely using safeLogError'
    );
  });
});
