import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../src/app/api/', import.meta.url);
const guardedMutations = [
  ['user/route.ts', 'PATCH'],
  ['user/route.ts', 'DELETE'],
  ['user/applications/route.ts', 'POST'],
  ['user/applications/route.ts', 'PATCH'],
  ['user/applications/route.ts', 'DELETE'],
  ['user/saved/route.ts', 'POST'],
  ['user/saved/route.ts', 'DELETE'],
  ['user/passport-settings/route.ts', 'PATCH'],
  ['proposals/route.ts', 'POST'],
  ['proposals/[id]/route.ts', 'PATCH'],
  ['proposals/[id]/route.ts', 'DELETE'],
  ['proposals/[id]/ai-improve/route.ts', 'POST'],
];

for (const [route, method] of guardedMutations) {
  test(`${method} /api/${route.replace(/\/route\.ts$/, '')} requires authenticated same-origin mutation guard`, async () => {
    const source = await readFile(join(root.pathname, route), 'utf8');
    const declaration = new RegExp(`export async function ${method}\\s*\\([^]*?\\n}`, 'm');
    const handler = source.match(declaration)?.[0];
    assert.ok(handler, `expected ${method} handler in ${route}`);
    assert.match(handler, /requireUserMutation\s*\(/);
  });
}
