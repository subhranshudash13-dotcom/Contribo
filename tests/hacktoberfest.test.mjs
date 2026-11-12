import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { syncHacktoberfest, HACKTOBERFEST_ORGS_DATA, resolveDatabaseName } = require('../scripts/sync-hacktoberfest.js');
const tags = require('../src/lib/hacktoberfest-tags.json');
const plain = value => JSON.parse(JSON.stringify(value));

// Exercise the real repository functions with an isolated MongoDB collection double.
function matches(doc, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === '$and') return value.every(part => matches(doc, part));
    if (key === '$or') return value.some(part => matches(doc, part));
    const values = Array.isArray(doc[key]) ? doc[key] : [doc[key]];
    if (value?.$regex) {
      const regex = new RegExp(value.$regex, value.$options);
      return values.some(item => typeof item === 'string' && regex.test(item));
    }
    if (value?.$in) return values.some(item => value.$in.some(candidate =>
      typeof candidate?.test === 'function' ? candidate.test(item) : candidate === item));
    return doc[key] === value;
  });
}

function memoryDatabase(initial = {}) {
  const data = { programs: [], organizations: [], projects: [], ...structuredClone(initial) };
  let sequence = 0;
  return {
    data,
    collection(name) {
      const rows = data[name];
      return {
        async updateOne(filter, update, options = {}) {
          let row = rows.find(doc => matches(doc, filter));
          const inserted = !row;
          if (!row && !options.upsert) return { upsertedCount: 0, modifiedCount: 0 };
          if (!row) {
            row = { ...filter, _id: `generated-${++sequence}`, ...structuredClone(update.$setOnInsert || {}) };
            rows.push(row);
          }
          const before = JSON.stringify(row);
          Object.assign(row, structuredClone(update.$set || {}));
          for (const [key, value] of Object.entries(update.$addToSet || {})) {
            row[key] ||= [];
            if (!row[key].includes(value)) row[key].push(value);
          }
          return { upsertedCount: Number(inserted), modifiedCount: Number(!inserted && before !== JSON.stringify(row)) };
        },
        async findOne(filter) { return rows.find(doc => matches(doc, filter)); },
        async countDocuments(filter) {
          if (filter.$text) throw new Error('No text index');
          return rows.filter(doc => matches(doc, filter)).length;
        },
        find(filter) {
          let skip = 0;
          let limit = Infinity;
          return {
            sort() { return this; },
            project() { return this; },
            skip(value) { skip = value; return this; },
            limit(value) { limit = value; return this; },
            async toArray() {
              if (filter.$text) throw new Error('No text index');
              return rows.filter(doc => matches(doc, filter)).slice(skip, skip + limit);
            },
          };
        },
      };
    },
  };
}

function loadTypeScript(path, dependencies) {
  const compiled = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const moduleShim = { exports: {} };
  vm.runInNewContext(compiled, {
    module: moduleShim, exports: moduleShim.exports,
    require: name => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return moduleShim.exports;
}

function repository(db) {
  return loadTypeScript('../src/lib/repositories/projects.ts', {
    react: { cache: fn => fn },
    '@/lib/db': { COLLECTIONS: { projects: 'projects', programs: 'programs' }, getCollection: async name => db.collection(name) },
    '@/lib/serialize': { serializeDocs: docs => docs },
    '@/lib/repositories/programs': { resolveProgramFilter: async query => ({ programId: query.programId }) },
  });
}

test('sync is repeatable and preserves colliding organizations/projects in other programs and years', async () => {
  const otherProgram = { _id: 'gsoc', slug: 'gsoc', organizer: 'Keep me' };
  const otherOrg = { _id: 'other-org', slug: 'digitalocean', programId: 'gsoc', topics: ['existing'] };
  const otherProject = { _id: 'other-project', programId: 'gsoc', orgSlug: 'digitalocean', title: 'DigitalOcean CLI (doctl)', year: 2026, stars: 42 };
  const historical = { _id: 'history', programId: 'hf', orgSlug: 'digitalocean', title: 'DigitalOcean CLI (doctl)', year: 2025, stars: 99 };
  const db = memoryDatabase({
    programs: [otherProgram, { _id: 'hf', slug: 'hacktoberfest' }],
    organizations: [otherOrg, { _id: 'existing-hf-org', programId: 'hf', slug: 'digitalocean', years: [2025], contactEmail: 'curated@example.com' }],
    projects: [otherProject, historical],
  });
  const first = await syncHacktoberfest(db);
  assert.equal(first.organizationsInserted, 13);
  assert.equal(first.projectsInserted, 14);
  const snapshot = structuredClone(db.data);
  assert.deepEqual(await syncHacktoberfest(db), {
    organizationsInserted: 0, organizationsModified: 0, projectsInserted: 0, projectsModified: 0,
  });
  assert.deepEqual(db.data, snapshot);
  assert.deepEqual(db.data.programs.find(doc => doc._id === 'gsoc'), otherProgram);
  assert.deepEqual(db.data.organizations.find(doc => doc._id === 'other-org'), otherOrg);
  assert.deepEqual(db.data.projects.find(doc => doc._id === 'other-project'), otherProject);
  assert.deepEqual(db.data.projects.find(doc => doc._id === 'history'), historical);
  const org = db.data.organizations.find(doc => doc._id === 'existing-hf-org');
  assert.deepEqual(org.years, [2025, 2026]);
  assert.equal(org.contactEmail, 'curated@example.com');
  assert.equal(org.projectCount, 3);
  const project = db.data.projects.find(doc => doc.programId === 'hf' && doc.year === 2026);
  project.description = 'stale';
  project.stars = 123;
  project.difficulty = 'Advanced';
  project.mentors = ['Curated mentor'];
  await syncHacktoberfest(db);
  assert.notEqual(project.description, 'stale');
  assert.equal(project.stars, 123);
  assert.equal(project.difficulty, 'Advanced');
  assert.deepEqual(project.mentors, ['Curated mentor']);
});

test('verified catalog uses canonical tags and does not invent metrics or a Gauge repository', async () => {
  assert.equal(HACKTOBERFEST_ORGS_DATA.length, 14);
  assert.equal(new Set(HACKTOBERFEST_ORGS_DATA.map(org => org.slug)).size, 14);
  assert.equal(HACKTOBERFEST_ORGS_DATA.find(org => org.slug === 'gauge').websiteUrl, 'https://www.withgauge.com/');
  assert.deepEqual(HACKTOBERFEST_ORGS_DATA.find(org => org.slug === 'gauge').projects, []);
  const db = memoryDatabase();
  await syncHacktoberfest(db);
  for (const project of db.data.projects) {
    assert.equal(project.year, 2026);
    assert.ok(project.techStack.length);
    assert.ok(project.description);
    assert.ok(project.githubUrl.startsWith('https://github.com/'));
    assert.equal(project.stars, undefined);
    assert.equal(project.difficulty, undefined);
    assert.ok(project.topics.every(tag => tag === 'hacktoberfest' || tags.includes(tag)));
    assert.ok(db.data.organizations.some(org => org._id === project.orgId && org.programId === project.programId));
  }
  for (const tag of tags) assert.ok(db.data.projects.some(project => project.topics.includes(tag)), tag);
});

test('database selection honors explicit configuration and refuses an implicit default', () => {
  assert.equal(resolveDatabaseName('mongodb://127.0.0.1/uri_db', { MONGODB_DB: ' contribo_dev ' }), 'contribo_dev');
  assert.equal(resolveDatabaseName('mongodb://127.0.0.1/contribo_dev', {}), 'contribo_dev');
  assert.throws(() => resolveDatabaseName('mongodb://127.0.0.1', {}), /explicit database/);
});

test('every track tag filters projects and matches skills within the selected program', async () => {
  const db = memoryDatabase();
  await syncHacktoberfest(db);
  const programId = db.data.programs[0]._id;
  db.data.projects.push({ ...db.data.projects[0], _id: 'foreign', programId: 'other', topics: tags });
  const { listProjects, findProjectsBySkills } = repository(db);
  for (const tag of tags) {
    const result = await listProjects({ programId, tech: tag.toUpperCase(), limit: 100, skip: 0 });
    const expected = db.data.projects.filter(project => project.programId === programId && project.topics.includes(tag));
    assert.deepEqual(result.projects.map(project => project._id), expected.map(project => project._id));
    assert.ok(result.total > 0, tag);
    const matches = await findProjectsBySkills([tag], 100, { programSlugs: ['hacktoberfest'] });
    assert.ok(matches.length > 0, tag);
    assert.ok(matches.every(project => project.programId === programId));
  }
});

test('tag filters survive regex search fallback and match literal technologies', async () => {
  const db = memoryDatabase({ projects: [
    { _id: 'wanted', programId: 'hf', title: 'Agent demo', techStack: ['C++'], topics: ['agents'] },
    { _id: 'wrong-tag', programId: 'hf', title: 'Agent demo', techStack: ['C'], topics: ['other'] },
    { _id: 'wrong-search', programId: 'hf', title: 'Unrelated', techStack: ['Python'], topics: ['agents'] },
    { _id: 'wrong-program', programId: 'other', title: 'Agent demo', techStack: ['C++'], topics: ['agents'] },
  ] });
  const { listProjects } = repository(db);
  const result = await listProjects({ programId: 'hf', tech: 'agents', search: 'demo', limit: 100, skip: 0 });
  assert.deepEqual(result.projects.map(project => project._id), ['wanted']);
  const literal = await listProjects({ programId: 'hf', tech: 'C++', limit: 100, skip: 0 });
  assert.deepEqual(literal.projects.map(project => project._id), ['wanted']);
});

test('Hacktoberfest roadmap has four phases with verified participation and reward links', () => {
  const { getTrackById } = loadTypeScript('../src/app/roadmaps/data.ts', { 'lucide-react': require('lucide-react') });
  const track = getTrackById('hacktoberfest');
  assert.deepEqual(plain(track.stages.map(stage => stage.title)), [
    'Phase 1: Preptember & Identity Setup',
    'Phase 2: Fests & Community Hack Days',
    'Phase 3: Building & Submitting AI Challenges',
    'Phase 4: Sticker Progression & Swag Unlocks',
  ]);
  const urls = track.stages.flatMap(stage => stage.resources.map(resource => resource.url));
  for (const url of ['https://hacktoberfest.com/questions/', 'https://hacktoberfest.com/fests/', 'https://ghw.mlh.com/events/open-source', 'https://dev.to/challenges', 'https://hacktoberfest.com/online/']) {
    assert.ok(urls.includes(url), url);
  }
  assert.equal(urls.includes('https://hacktoberfest.com/participation/'), false);
  assert.ok(getTrackById('events'), 'Other seasonal events retain their existing track');
});


test('roadmaps route renders the existing client inside Suspense instead of redirecting', () => {
  const React = require('react');
  const client = () => null;
  const { default: Page } = loadTypeScript('../src/app/roadmaps/page.tsx', {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/components/ui/LoadingState': { LoadingState: () => null },
    './RoadmapsClient': { default: client },
  });
  const page = Page();
  assert.equal(page.type, React.Suspense);
  assert.equal(page.props.children.type, client);
});
