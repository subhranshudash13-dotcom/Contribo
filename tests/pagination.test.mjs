import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/pagination.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleShim = { exports: {} };
vm.runInNewContext(compiled, { module: moduleShim, exports: moduleShim.exports, Number });
const { parsePage } = moduleShim.exports;

test('parsePage falls back to 1 for bad input', () => {
  for (const bad of ['0', '-1', 'abc', '', '1e999', '2.5', 'NaN', '99999999999999999999', ['1', '2'], undefined, null]) {
    assert.equal(parsePage(bad), 1, `input ${JSON.stringify(bad)}`);
  }
});

test('parsePage keeps valid pages', () => {
  assert.equal(parsePage('1'), 1);
  assert.equal(parsePage('3'), 3);
  assert.equal(parsePage(' 12 '), 12);
});
