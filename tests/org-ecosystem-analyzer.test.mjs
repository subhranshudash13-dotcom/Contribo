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
const analyzer = load('src/lib/organizations/ecosystem-analyzer.ts');
const {
  computeGiniConcentration,
  analyzeBusFactor,
  buildTechStackGraph,
  getOrganizationEcosystemReport,
} = analyzer;

test('computeGiniConcentration bounds concentration within [0, 1]', () => {
  assert.equal(computeGiniConcentration([100, 100, 100, 100]), 0);
  const skewed = computeGiniConcentration([1, 1, 1, 500]);
  assert.ok(skewed > 0.65 && skewed <= 1);
  assert.equal(computeGiniConcentration([]), 0);
});

test('analyzeBusFactor distinguishes Resilient vs Concentrated maintainer distributions', () => {
  const resilient = analyzeBusFactor([
    { handle: '@a', commits: 50, reviews: 20 },
    { handle: '@b', commits: 48, reviews: 20 },
    { handle: '@c', commits: 45, reviews: 20 },
    { handle: '@d', commits: 42, reviews: 20 },
    { handle: '@e', commits: 40, reviews: 20 },
    { handle: '@f', commits: 38, reviews: 20 },
    { handle: '@g', commits: 35, reviews: 20 },
  ]);
  assert.equal(resilient.health, 'Resilient');
  assert.ok(resilient.nakamotoCoefficient >= 4);

  const concentrated = analyzeBusFactor([
    { handle: '@solo', commits: 500, reviews: 10 },
    { handle: '@helper', commits: 10, reviews: 2 },
  ]);
  assert.equal(concentrated.health, 'Concentrated');
  assert.equal(concentrated.nakamotoCoefficient, 1);
});

test('buildTechStackGraph deduplicates nodes and edges across repositories', () => {
  const graph = buildTechStackGraph([
    { repoName: 'core', stacks: ['TypeScript', 'TypeScript', 'React'], stars: 100, openGoodFirstIssues: 3 },
    { repoName: 'cli', stacks: ['TypeScript', 'Go'], stars: 50, openGoodFirstIssues: 2 },
  ]);

  const tsNode = graph.nodes.find((n) => n.id === 'stack:typescript');
  assert.ok(tsNode);
  assert.equal(tsNode.weight, 2);
  assert.equal(graph.edges.length, 4); // core->ts, core->react, cli->ts, cli->go
});

test('GET /api/organizations/[slug]/ecosystem validates slug and returns report', async () => {
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
    '@/lib/organizations/ecosystem-analyzer': analyzer,
  });

  const route = apiLoader('src/app/api/organizations/[slug]/ecosystem/route.ts');

  const badRes = await route.GET(
    new Request('http://localhost/api/organizations/!!!/ecosystem'),
    { params: Promise.resolve({ slug: '!!!' }) }
  );
  assert.equal(badRes.status, 400);

  const okRes = await route.GET(
    new Request('http://localhost/api/organizations/cncf/ecosystem'),
    { params: Promise.resolve({ slug: 'cncf' }) }
  );
  assert.equal(okRes.status, 200);
  const body = await okRes.json();
  assert.equal(body.slug, 'cncf');
  assert.ok(body.velocity.firstTimeMergeRatePct >= 0 && body.velocity.firstTimeMergeRatePct <= 100);
  assert.ok(body.graph.edges.length > 0);
});
