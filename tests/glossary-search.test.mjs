import test from 'node:test';
import assert from 'node:assert/strict';
import { filterGlossary, normalizeQuery } from '../src/lib/glossary-search.mjs';

const items = [
  { term: 'PR', category: 'github', shortDef: 'Pull Request: a proposal to merge changes.', aliases: ['pull request'] },
  { term: 'Rebase', category: 'git', shortDef: 'Re-apply commits on a newer base.' },
  { term: 'LGTM', category: 'culture', shortDef: 'Looks Good To Me.' },
];

test('empty query and "all" returns everything', () => {
  assert.equal(filterGlossary(items, { query: '', category: 'all' }).length, 3);
});

test('search is case-insensitive and matches terms', () => {
  assert.deepEqual(filterGlossary(items, { query: 'rEbAsE' }).map((i) => i.term), ['Rebase']);
});

test('search matches definitions', () => {
  assert.deepEqual(filterGlossary(items, { query: 'looks good' }).map((i) => i.term), ['LGTM']);
});

test('search matches aliases', () => {
  assert.deepEqual(filterGlossary(items, { query: 'pull request' }).map((i) => i.term), ['PR']);
});

test('category filter combines with search', () => {
  assert.equal(filterGlossary(items, { query: 'pr', category: 'git' }).length, 0);
  assert.equal(filterGlossary(items, { category: 'git' }).length, 1);
});

test('no matches returns an empty list and whitespace is trimmed', () => {
  assert.equal(filterGlossary(items, { query: 'zzzz' }).length, 0);
  assert.equal(normalizeQuery('  GIT  '), 'git');
});
