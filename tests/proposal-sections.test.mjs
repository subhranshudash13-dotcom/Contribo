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

// Follow the existing transpile-and-run test pattern, loading real production
// modules. Only external boundaries (auth, MongoDB, AI, browser APIs) are mocked.
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

const context = { params: Promise.resolve({ id: 'draft-test' }) };
const request = (method, body) => new Request('http://localhost:3000/api/proposals/draft-test', {
  method,
  headers: { 'Content-Type': 'application/json' },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

function fixture() {
  const state = { userId: 'user-a', writes: 0, aiCalls: [] };
  const documents = [{
    id: 'draft-test', userId: 'user-a', projectTitle: 'Test proposal',
    projectSlug: 'test-proposal', orgName: 'Test org', sections: { summary: 'Original summary' },
    progress: 0,
  }];
  function matches(doc, filter) {
    return Object.entries(filter).every(([key, value]) => {
      if (key === '$and') return value.every((part) => matches(doc, part));
      if (key === '$or') return value.some((part) => matches(doc, part));
      if (value && typeof value === 'object' && '$in' in value) {
        return value.$in.some((candidate) => String(candidate) === String(doc[key]));
      }
      return String(doc[key]) === String(value);
    });
  }
  const collection = {
    async findOne(filter) {
      return structuredClone(documents.find((doc) => matches(doc, filter)) || null);
    },
    async insertOne(doc) {
      documents.push(structuredClone(doc));
      return { insertedId: 'inserted-test-id' };
    },
    async updateOne(filter, update) {
      const doc = documents.find((item) => matches(item, filter));
      if (!doc) return { matchedCount: 0 };
      Object.assign(doc, structuredClone(update.$set));
      state.writes++;
      return { matchedCount: 1 };
    },
  };
  const load = sourceLoader({
    '@/auth': { auth: async () => state.userId ? { user: { id: state.userId } } : null },
    '@/lib/db': { COLLECTIONS: { proposals: 'proposals' }, getCollection: async () => collection },
    '@/lib/ai/gemini': {
      improveProposalSectionWithGemini: async (input) => {
        state.aiCalls.push(input);
        return { text: `Improved ${input.sectionTitle}`, rationale: 'Mock response' };
      },
    },
  });
  return {
    load, state, documents,
    repo: load('src/lib/repositories/proposals.ts'),
    route: load('src/app/api/proposals/[id]/route.ts'),
    aiRoute: load('src/app/api/proposals/[id]/ai-improve/route.ts'),
  };
}

const testing = '  Unit and integration tests\nPreserve punctuation: < > & ✓  ';
const risks = 'Network outage\nMitigation: retry with bounded backoff.';

test('autosave PATCH returns and stores Testing and Risks, even with explicit progress', async () => {
  const f = fixture();
  const response = await f.route.PATCH(request('PATCH', { sections: { testing, risks }, progress: 100 }), context);
  assert.equal(response.status, 200);
  const { proposal } = await response.json();
  assert.equal(proposal.sections.testing, testing);
  assert.equal(proposal.sections.risks, risks);
  assert.equal(f.documents[0].sections.testing, testing);
  assert.equal(f.documents[0].sections.risks, risks);
});

test('GET reload and subsequent partial updates preserve exact saved text', async () => {
  const f = fixture();
  await f.route.PATCH(request('PATCH', { sections: { testing, risks }, progress: 25 }), context);
  await f.route.PATCH(request('PATCH', { sections: { summary: 'Revised summary' } }), context);
  const response = await f.route.GET(request('GET'), context);
  assert.equal(response.status, 200);
  const { proposal } = await response.json();
  assert.deepEqual(proposal.sections, { summary: 'Revised summary', testing, risks });
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('repository itself accepts current sections without relying on route sanitization', async () => {
  const f = fixture();
  const saved = await f.repo.updateProposal('draft-test', 'user-a', { sections: { testing, risks } });
  assert.equal(saved.sections.testing, testing);
  assert.equal(saved.sections.risks, risks);
});

test('unknown-only updates fail while non-string values remain filtered', async () => {
  const f = fixture();
  const response = await f.route.PATCH(request('PATCH', { sections: { unknown: 'Not accepted' } }), context);
  assert.equal(response.status, 400);
  assert.equal(f.state.writes, 0);
  const saved = await f.repo.updateProposal('draft-test', 'user-a', {
    sections: { unknown: 'Ignored', summary: 123, testing: null, risks: ['invalid'] },
  });
  assert.deepEqual(saved.sections, { summary: 'Original summary' });
});

test('every editor ID and both legacy IDs remain supported', async () => {
  const f = fixture();
  const { BUILDER_SECTIONS } = f.load('src/components/proposal-studio/constants.ts');
  for (const id of [...BUILDER_SECTIONS.map((section) => section.id), 'stretchGoals', 'communityContributions']) {
    assert.ok(f.repo.ALLOWED_SECTION_IDS.has(id), `Missing accepted ID: ${id}`);
    const saved = await f.repo.updateProposal('draft-test', 'user-a', { sections: { [id]: `Content for ${id}` } });
    assert.equal(saved.sections[id], `Content for ${id}`);
  }
});

test('PATCH and direct repository calls retain the 50,000-character limit', async () => {
  const f = fixture();
  const long = 'x'.repeat(50_001);
  const response = await f.route.PATCH(request('PATCH', { sections: { testing: long, risks: long } }), context);
  assert.equal(response.status, 200);
  const { proposal } = await response.json();
  assert.equal(proposal.sections.testing, long.slice(0, 50_000));
  assert.equal(proposal.sections.risks, long.slice(0, 50_000));
  const saved = await f.repo.updateProposal('draft-test', 'user-a', { sections: { testing: long } });
  assert.equal(saved.sections.testing.length, 50_000);
});

test('new drafts initialize all current and legacy section defaults', async () => {
  const f = fixture();
  const draft = await f.repo.createProposal({ projectTitle: 'New', orgName: 'Org', userId: 'user-a' });
  const { BUILDER_SECTIONS } = f.load('src/components/proposal-studio/constants.ts');
  for (const id of [...BUILDER_SECTIONS.map((section) => section.id), 'stretchGoals', 'communityContributions']) {
    assert.equal(draft.sections[id], '', `Missing empty default: ${id}`);
  }
});

test('legacy drafts remain readable and gain new fields only when edited', async () => {
  const f = fixture();
  assert.deepEqual((await f.repo.getProposalById('draft-test', 'user-a')).sections, { summary: 'Original summary' });
  const response = await f.route.PATCH(request('PATCH', { sections: { testing: '', risks: 'New risk' } }), context);
  assert.equal(response.status, 200);
  assert.deepEqual(f.documents[0].sections, { summary: 'Original summary', testing: '', risks: 'New risk' });
});

test('AI route and repository accept both IDs with a mocked provider', async () => {
  const f = fixture();
  for (const sectionId of ['testing', 'risks']) {
    const response = await f.aiRoute.POST(request('POST', { sectionId, currentContent: 'Original content' }), context);
    assert.equal(response.status, 200, `AI rejected ${sectionId}`);
    assert.equal((await response.json()).improvedContent, `Improved ${sectionId}`);
    assert.equal(f.documents[0].sections[sectionId], `Improved ${sectionId}`);
  }
  assert.equal(f.state.aiCalls.length, 2);
  const response = await f.aiRoute.POST(request('POST', { sectionId: 'unknown' }), context);
  assert.equal(response.status, 400);
  assert.equal(f.state.aiCalls.length, 2);
});

test('completion reaches 100% at editor thresholds without counting legacy fields', async () => {
  const f = fixture();
  const { BUILDER_SECTIONS } = f.load('src/components/proposal-studio/constants.ts');
  const sections = Object.fromEntries(BUILDER_SECTIONS.map((section) => [section.id, 'x'.repeat(section.minChars)]));
  const response = await f.route.PATCH(request('PATCH', { sections }), context);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).proposal.progress, 100);
  const saved = await f.repo.updateProposal('draft-test', 'user-a', {
    sections: { testing: '', risks: '', stretchGoals: 'x'.repeat(100), communityContributions: 'x'.repeat(100) },
  });
  assert.equal(saved.progress, 75);
});

test('unauthenticated and wrong-owner requests do not read or mutate a draft', async () => {
  const f = fixture();
  f.state.userId = null;
  assert.equal((await f.route.PATCH(request('PATCH', { sections: { summary: 'Unauthorized edit' } }), context)).status, 401);
  assert.equal((await f.route.GET(request('GET'), context)).status, 401);
  f.state.userId = 'user-b';
  assert.equal((await f.route.PATCH(request('PATCH', { sections: { summary: 'Wrong owner edit' } }), context)).status, 404);
  assert.equal((await f.route.GET(request('GET'), context)).status, 404);
  assert.equal((await f.aiRoute.POST(request('POST', { sectionId: 'summary' }), context)).status, 404);
  assert.equal(f.state.writes, 0);
  assert.equal(f.state.aiCalls.length, 0);
});

test('client API rejects failed saves instead of resolving them as successful responses', async (t) => {
  const { updateProposalDraft } = sourceLoader()('src/lib/client/api.ts');
  for (const status of [400, 401, 500]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Rejected' }, { status }));
    await assert.rejects(updateProposalDraft('draft-test', { sections: { testing } }), (error) => error.status === status);
    t.mock.restoreAll();
  }
  // The hook's separate 401 -> saved behavior is tracked in #73, not fixed here.
});

test('PDF export payload receives persisted Testing and Risks after a GET reload', async (t) => {
  const f = fixture();
  await f.route.PATCH(request('PATCH', { sections: { testing, risks }, progress: 100 }), context);
  const { proposal } = await (await f.route.GET(request('GET'), context)).json();
  const data = f.load('src/lib/proposal-studio/data.ts');
  const load = sourceLoader({
    react: {
      useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
      useMemo: (calculate) => calculate(),
      useCallback: (callback) => callback,
      useRef: (initial) => ({ current: initial }),
      useEffect: () => {},
    },
    'next/navigation': { useSearchParams: () => new URLSearchParams() },
    '@/lib/proposal-studio/data': { ...data, DRAFT_PROPOSALS: [proposal] },
  });
  // This exercises the real export callback with a reloaded draft, not a DOM
  // render or the Python engine. No HTTP request leaves this process.
  for (const [key, value] of Object.entries({
    window: { setTimeout: () => 0 },
    document: { createElement: () => ({ click() {} }) },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  let payload;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/proposals/export-pdf');
    payload = JSON.parse(options.body);
    return new Response('%PDF-1.4', { headers: { 'Content-Type': 'application/pdf' } });
  });
  const studio = load('src/components/proposal-studio/hooks/useProposalStudio.ts').useProposalStudio();
  assert.equal(await studio.downloadPdfFile(), true);
  assert.equal(payload.sections.testing, testing);
  assert.equal(payload.sections.risks, risks);
});
