import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

function sourceLoader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    const resolved = path.resolve(root, filename);
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const mod = { exports: {} };
    cache.set(resolved, mod);
    const compiled = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (!id.startsWith('@/') && !id.startsWith('.')) return require(id);
      const base = id.startsWith('@/')
        ? path.join(root, 'src', id.slice(2))
        : path.resolve(path.dirname(resolved), id);
      const target = ['.ts', '.tsx'].map((ext) => base + ext).find(fs.existsSync);
      assert.ok(target, `Cannot resolve production module ${id}`);
      return load(target);
    };
    vm.runInThisContext(`(function(require, module, exports) {\n${compiled}\n})`, {
      filename: resolved,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

const load = sourceLoader();
const optimizer = load('src/lib/programs/timeline-optimizer.ts');
const { PROGRAM_WINDOWS, optimizeApplicationPortfolio } = optimizer;

test('disjoint programs within capacity produce conflict-free schedule', () => {
  const res = optimizeApplicationPortfolio(
    ['lfx-spring-2026', 'gsoc-2026', 'nsoc-2026'],
    30
  );
  assert.equal(res.isConflictFree, true);
  assert.equal(res.overflowWeeksCount, 0);
  assert.equal(res.collisions.length, 0);
  assert.equal(res.peakWeeklyHours, 25);
});

test('overlapping exclusive programs trigger critical exclusivity-conflict and overflow', () => {
  const res = optimizeApplicationPortfolio(
    ['gsoc-2026', 'outreachy-may-2026'],
    35
  );
  assert.equal(res.isConflictFree, false);
  assert.ok(res.overflowWeeksCount > 0);
  assert.equal(res.peakWeeklyHours, 60);
  assert.ok(res.collisions.some((c) => c.type === 'exclusivity-conflict' && c.severity === 'critical'));
  assert.ok(res.safeBundleIds.length >= 1);
  // Safe bundle itself must be conflict-free
  const safeCheck = optimizeApplicationPortfolio(res.safeBundleIds, 35);
  assert.equal(safeCheck.isConflictFree, true);
});

test('rankedPrograms computes deterministic priorityOrder and hourlyValueUsd', () => {
  const res = optimizeApplicationPortfolio(
    PROGRAM_WINDOWS.map((p) => p.id),
    25
  );
  assert.equal(res.rankedPrograms.length, PROGRAM_WINDOWS.length);
  for (let i = 1; i < res.rankedPrograms.length; i++) {
    assert.ok(res.rankedPrograms[i - 1].priorityScore >= res.rankedPrograms[i].priorityScore);
  }
});

test('GET and POST /api/applications/optimize validate input and return diagnostics', async () => {
  const apiLoader = sourceLoader({
    'next/server': {
      NextResponse: {
        json(data, init = {}) {
          return new Response(JSON.stringify(data), {
            status: init.status ?? 200,
            headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
          });
        },
      },
    },
    '@/lib/programs/timeline-optimizer': optimizer,
  });

  const route = apiLoader('src/app/api/applications/optimize/route.ts');

  const getRes = await route.GET();
  assert.equal(getRes.status, 200);
  const getJson = await getRes.json();
  assert.equal(getJson.result.isConflictFree, true);

  const badRes = await route.POST(
    new Request('http://localhost/api/applications/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programIds: 'not-an-array' }),
    })
  );
  assert.equal(badRes.status, 400);

  const postRes = await route.POST(
    new Request('http://localhost/api/applications/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programIds: ['gsoc-2026', 'lfx-summer-2026'],
        weeklyCapacityHours: 25,
      }),
    })
  );
  assert.equal(postRes.status, 200);
  const postJson = await postRes.json();
  assert.equal(postJson.result.isConflictFree, false);
  assert.ok(postJson.result.overflowWeeksCount > 0);
});
