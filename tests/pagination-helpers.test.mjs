import test from 'node:test';
import assert from 'node:assert/strict';

import { pageCount, pageRange, pageWindow } from '../src/lib/pagination-helpers.mjs';

test('pageCount rounds up and is at least 1', () => {
  assert.equal(pageCount(1257, 120), 11);
  assert.equal(pageCount(120, 120), 1);
  assert.equal(pageCount(121, 120), 2);
  assert.equal(pageCount(0, 120), 1);
});

test('pageRange gives the 1-based items shown on a page', () => {
  assert.deepEqual(pageRange(1, 120, 1257), { start: 1, end: 120 });
  assert.deepEqual(pageRange(2, 120, 1257), { start: 121, end: 240 });
  assert.deepEqual(pageRange(11, 120, 1257), { start: 1201, end: 1257 });
  assert.deepEqual(pageRange(1, 120, 0), { start: 0, end: 0 });
});

test('pageWindow keeps up to 5 links around the current page', () => {
  assert.deepEqual(pageWindow(1, 11), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageWindow(6, 11), [4, 5, 6, 7, 8]);
  assert.deepEqual(pageWindow(11, 11), [7, 8, 9, 10, 11]);
  assert.deepEqual(pageWindow(2, 3), [1, 2, 3]);
  assert.deepEqual(pageWindow(1, 1), [1]);
});

test('every organization is reachable through the pages', () => {
  const total = 1257;
  const size = 120;
  let shown = 0;
  for (let page = 1; page <= pageCount(total, size); page++) {
    const { start, end } = pageRange(page, size, total);
    assert.equal(start, shown + 1);
    shown = end;
  }
  assert.equal(shown, total);
});
