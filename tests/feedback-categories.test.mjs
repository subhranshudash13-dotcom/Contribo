import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FEEDBACK_CATEGORIES,
  CONTRIBUTOR_FEEDBACK_CATEGORIES,
  isFeedbackCategory,
  normalizeFeedbackCategory,
} from '../src/lib/feedback-categories.mjs';

test('all supported feedback categories are unique and accepted', () => {
  const values = FEEDBACK_CATEGORIES.map(({ value }) => value);

  assert.equal(new Set(values).size, values.length);
  assert.deepEqual(values, [
    'Feature Request',
    'New Program Proposal',
    'Proposal Library Addition',
    'Bug Report',
    'General Feedback',
    'UI/UX',
    'Data Issue',
    'Other',
  ]);

  for (const value of values) {
    assert.equal(isFeedbackCategory(value), true);
  }
});

test('proposal categories are supported by the shared validator', () => {
  assert.equal(isFeedbackCategory('New Program Proposal'), true);
  assert.equal(isFeedbackCategory('Proposal Library Addition'), true);
});

test('invalid category values are rejected', () => {
  for (const value of ['', 'Unknown', ' bug report', null, undefined, 123, {}]) {
    assert.equal(isFeedbackCategory(value), false);
  }
});

test('contributor feedback includes Bug Report but excludes proposal-only categories', () => {
  const values = CONTRIBUTOR_FEEDBACK_CATEGORIES.map(({ value }) => value);

  assert.ok(values.includes('Bug Report'));
  assert.ok(values.includes('General Feedback'));
  assert.ok(!values.includes('New Program Proposal'));
  assert.ok(!values.includes('Proposal Library Addition'));
});

test('missing categories default safely and explicit invalid values are rejected', () => {
  assert.equal(normalizeFeedbackCategory(undefined), 'Feature Request');
  assert.equal(normalizeFeedbackCategory(' New Program Proposal '), 'New Program Proposal');

  for (const value of [null, 123, {}, '', 'Unknown']) {
    assert.equal(normalizeFeedbackCategory(value), null);
  }
});
