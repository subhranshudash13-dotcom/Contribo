import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/repositories/projects.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const projects = [
  { title: 'Zulu Python', stars: 50, year: 2026, score: 5 },
  { title: 'Alpha Python', stars: 3, year: 2024, score: 9 },
  { title: 'Beta Python', stars: 80, year: 2025, score: 2 },
];

function fixture({ missingTextIndex = false } = {}) {
  const filters = [];
  const collection = {
    async countDocuments() { return projects.length; },
    find(filter) {
      const isTextSearch = Boolean(filter.$text);
      filters.push(structuredClone(filter));
      let order;
      let offset = 0;
      let count = projects.length;
      return {
        project() { return this; },
        sort(value) { order = value; return this; },
        skip(value) { offset = value; return this; },
        limit(value) { count = value; return this; },
        async toArray() {
          if (isTextSearch && missingTextIndex) throw new Error('text index required');
          const rows = [...projects].sort((a, b) => {
            for (const [key, direction] of Object.entries(order)) {
              const result = typeof a[key] === 'string'
                ? a[key].localeCompare(b[key])
                : a[key] - b[key];
              if (result) return result * (typeof direction === 'object' ? -1 : direction);
            }
            return 0;
          });
          return rows.slice(offset, offset + count);
        },
      };
    },
  };
  const mocks = {
    react: { cache: (fn) => fn },
    '@/lib/db': { getCollection: async () => collection, COLLECTIONS: { projects: 'projects' } },
    '@/lib/serialize': { serializeDocs: (docs) => docs },
    '@/lib/repositories/programs': { resolveProgramFilter: async () => ({}) },
  };
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require, module, exports) {\n${compiled}\n})`)(
    (id) => {
      assert.ok(Object.hasOwn(mocks, id), `Unexpected import: ${id}`);
      return mocks[id];
    },
    mod,
    mod.exports,
  );
  return { listProjects: mod.exports.listProjects, filters };
}

for (const missingTextIndex of [false, true]) {
  const path = missingTextIndex ? 'regex fallback' : 'text index';
  for (const [sortBy, expected] of [
    ['stars', ['Beta Python', 'Zulu Python', 'Alpha Python']],
    ['title', ['Alpha Python', 'Beta Python', 'Zulu Python']],
    ['newest', ['Zulu Python', 'Beta Python', 'Alpha Python']],
    ['year', ['Zulu Python', 'Beta Python', 'Alpha Python']],
  ]) {
    test(`${path} honors ${sortBy} before pagination`, async () => {
      const { listProjects, filters } = fixture({ missingTextIndex });
      const query = { search: 'Python', sortBy, orgSlug: 'example', tech: 'Python', limit: 2, skip: 0 };
      const first = await listProjects(query);
      const second = await listProjects({ ...query, skip: 2 });
      assert.equal(first.total, 3);
      assert.equal(second.total, 3);
      assert.deepEqual([...first.projects, ...second.projects].map((p) => p.title), expected);
      for (const filter of filters) {
        assert.equal(filter.orgSlug, 'example');
        assert.ok(filter.$and, 'technology filter must remain in both query paths');
      }
      assert.equal(Boolean(filters.at(-1).$text), !missingTextIndex);
    });
  }

  test(`${path} preserves the existing default search order`, async () => {
    const { listProjects } = fixture({ missingTextIndex });
    const result = await listProjects({ search: 'Python', limit: 3, skip: 0 });
    const expected = missingTextIndex
      ? ['Zulu Python', 'Beta Python', 'Alpha Python']
      : ['Alpha Python', 'Zulu Python', 'Beta Python'];
    assert.deepEqual(result.projects.map((p) => p.title), expected);
  });
}

test('listing without search retains existing explicit sorting', async () => {
  const { listProjects } = fixture();
  const result = await listProjects({ sortBy: 'stars', limit: 3, skip: 0 });
  assert.deepEqual(result.projects.map((p) => p.stars), [80, 50, 3]);
});

test('projects API applies requested search sorting before paging', async () => {
  const routeSource = fs.readFileSync(new URL('../src/app/api/projects/route.ts', import.meta.url), 'utf8');
  const routeCompiled = ts.transpileModule(routeSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const { listProjects } = fixture();
  const mocks = {
    '@/lib/api': {
      apiError: (error, status) => Response.json({ error }, { status }),
      apiOk: (data, status) => Response.json(data, { status }),
      parsePagination: (params) => {
        const limit = Number(params.get('limit') || 100);
        const page = Number(params.get('page') || 1);
        return { limit, page, skip: (page - 1) * limit };
      },
      publicCacheHeaders: () => ({}),
      sanitizeSearchQuery: (value) => value || '',
    },
    '@/lib/repositories/projects': { listProjects },
  };
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require, module, exports) {\n${routeCompiled}\n})`)(
    (id) => {
      assert.ok(Object.hasOwn(mocks, id), `Unexpected import: ${id}`);
      return mocks[id];
    },
    mod,
    mod.exports,
  );

  for (const [sortBy, expected] of [['stars', 'Zulu Python'], ['title', 'Beta Python']]) {
    const response = await mod.exports.GET(new Request(
      `http://localhost/api/projects?q=Python&sortBy=${sortBy}&limit=1&page=2`,
    ));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.total, 3);
    assert.equal(body.projects[0].title, expected);
  }
});

test('project page preserves implicit relevance and explicit sorting in pagination links', async () => {
  const pageSource = fs.readFileSync(new URL('../src/app/projects/page.tsx', import.meta.url), 'utf8');
  const pageCompiled = ts.transpileModule(pageSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  }).outputText;
  let receivedQuery;
  const redirect = (url) => { throw new Error(`redirect:${url}`); };
  const mocks = {
    'react/jsx-runtime': {},
    'next/link': { __esModule: true, default: 'a' },
    'next/navigation': { redirect },
    'next/script': { __esModule: true, default: 'script' },
    '@/lib/pagination': { parsePage: (value) => Number(value || 1) },
    '@/lib/hacktoberfest-tags.json': { __esModule: true, default: [] },
    '@/components/ui/ProjectCard': {},
    '@/components/ui/EmptyState': {},
    'lucide-react': {},
    '@/lib/repositories/projects': {
      listProjects: async (query) => {
        receivedQuery = query;
        return { projects: [], total: 30 };
      },
    },
    '@/auth': { auth: async () => null },
    '@/lib/repositories/dashboard': {},
    '@/lib/data-cache': {
      getCachedPrograms: async () => [],
      getCachedFilterFacets: async () => ({ technologies: [], difficulties: [] }),
    },
  };
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require, module, exports) {\n${pageCompiled}\n})`)(
    (id) => {
      assert.ok(Object.hasOwn(mocks, id), `Unexpected import: ${id}`);
      return mocks[id];
    },
    mod,
    mod.exports,
  );

  for (const [selectedSort, expectedQuery] of [
    [undefined, '/projects?q=Python&page=2'],
    ['stars', '/projects?q=Python&sortBy=stars&page=2'],
    ['newest', '/projects?q=Python&sortBy=newest&page=2'],
  ]) {
    const params = { q: 'Python', page: '99', ...(selectedSort ? { sortBy: selectedSort } : {}) };
    await assert.rejects(mod.exports.default({ searchParams: Promise.resolve(params) }), {
      message: `redirect:${expectedQuery}`,
    });
    assert.equal(receivedQuery.sortBy, selectedSort);
  }
});
