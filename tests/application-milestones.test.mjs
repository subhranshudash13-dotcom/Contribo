import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createApplicationMilestones,
  normalizeCompletedMilestoneIds,
} from '../src/lib/application-milestones.mjs';

test('builds deterministic IDs from program-specific application steps', () => {
  const steps = ['Join the community', 'Read contribution guidelines'];
  const milestones = createApplicationMilestones('gsoc', steps);

  assert.deepEqual(milestones.map((item) => item.label), steps);
  assert.equal(new Set(milestones.map((item) => item.id)).size, steps.length);
  assert.deepEqual(
    createApplicationMilestones('gsoc', steps),
    milestones
  );
});

test('adding an unrelated step does not change existing milestone IDs', () => {
  const original = createApplicationMilestones('gsoc', ['Join the community']);
  const refreshed = createApplicationMilestones('gsoc', [
    'Read the program overview',
    'Join the community',
  ]);

  assert.equal(original[0].id, refreshed[1].id);
});

test('ignores empty or malformed program steps', () => {
  const milestones = createApplicationMilestones('gsoc', [
    ' Read guidelines ',
    '',
    '   ',
    null,
    12,
  ]);

  assert.deepEqual(milestones.map((item) => item.label), ['Read guidelines']);
});

test('accepts valid completed IDs and removes duplicates', () => {
  assert.deepEqual(
    normalizeCompletedMilestoneIds(['a', 'b', 'a'], ['a', 'b']),
    ['a', 'b']
  );
});

test('rejects unknown or malformed completed IDs', () => {
  assert.equal(normalizeCompletedMilestoneIds(['unknown'], ['a', 'b']), null);
  assert.equal(normalizeCompletedMilestoneIds([12], ['a', 'b']), null);
  assert.equal(normalizeCompletedMilestoneIds(null, ['a', 'b']), null);
  assert.equal(normalizeCompletedMilestoneIds(Array(101).fill('a'), ['a']), null);
});
