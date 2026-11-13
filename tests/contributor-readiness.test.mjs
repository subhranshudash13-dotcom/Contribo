import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// The repository test runner is plain Node. Transpile the real helper so the
// tests exercise shipped source instead of a duplicated copy.
const source = fs.readFileSync(
  new URL('../src/lib/contributor-readiness.ts', import.meta.url),
  'utf8'
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

const moduleShim = { exports: {} };
vm.runInNewContext(compiled, { module: moduleShim, exports: moduleShim.exports });
const calculateContributorReadiness = moduleShim.exports.calculateContributorReadiness;

const empty = {
  displayName: 'Contributor',
  skills: [],
  savedCount: 0,
  applicationCount: 0,
};

test('contributor readiness gives zero to an empty profile', () => {
  assert.deepEqual({ ...calculateContributorReadiness(empty) }, {
    score: 0,
    completed: 0,
    total: 4,
    hint: 'Complete your profile to get started',
    ready: false,
  });
});

test('contributor readiness uses the issue weights', () => {
  assert.equal(
    calculateContributorReadiness({ ...empty, displayName: 'Senthil' }).score,
    10
  );
  assert.equal(
    calculateContributorReadiness({ ...empty, skills: ['TypeScript'] }).score,
    25
  );
  assert.equal(
    calculateContributorReadiness({ ...empty, savedCount: 1 }).score,
    30
  );
  assert.equal(
    calculateContributorReadiness({ ...empty, applicationCount: 1 }).score,
    35
  );
});

test('contributor readiness accumulates weights up to 100', () => {
  assert.equal(
    calculateContributorReadiness({
      displayName: 'Senthil',
      skills: ['TypeScript'],
      savedCount: 0,
      applicationCount: 0,
    }).score,
    35
  );

  assert.equal(
    calculateContributorReadiness({
      displayName: 'Senthil',
      skills: ['TypeScript'],
      savedCount: 2,
      applicationCount: 0,
    }).score,
    65
  );

  assert.deepEqual(
    {
      ...calculateContributorReadiness({
        displayName: 'Senthil',
        skills: ['TypeScript'],
        savedCount: 1,
        applicationCount: 1,
      }),
    },
    {
      score: 100,
      completed: 4,
      total: 4,
      hint: 'Profile active & ready',
      ready: true,
    }
  );
});

test('contributor readiness points at the next missing step', () => {
  assert.equal(
    calculateContributorReadiness({ ...empty, skills: ['Rust'] }).hint,
    'Set your display name'
  );
  assert.equal(
    calculateContributorReadiness({ ...empty, displayName: 'Senthil' }).hint,
    'Add skills to your profile'
  );
  assert.equal(
    calculateContributorReadiness({
      ...empty,
      displayName: 'Senthil',
      skills: ['Rust'],
    }).hint,
    'Save a target organization'
  );
  assert.equal(
    calculateContributorReadiness({
      ...empty,
      displayName: 'Senthil',
      skills: ['Rust'],
      savedCount: 1,
    }).hint,
    'Track your first application'
  );
});

test('contributor readiness rejects fallback and blank values', () => {
  assert.equal(
    calculateContributorReadiness({
      ...empty,
      displayName: '  Contributor  ',
      skills: ['TypeScript'],
      savedCount: 1,
      applicationCount: 1,
    }).score,
    90
  );

  assert.equal(
    calculateContributorReadiness({
      ...empty,
      displayName: '   ',
      skills: ['   '],
    }).score,
    0
  );
});
