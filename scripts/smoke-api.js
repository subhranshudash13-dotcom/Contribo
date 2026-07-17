/**
 * Lightweight API smoke checks (no auth session required for public routes).
 * Usage: node scripts/smoke-api.js [baseUrl]
 * Default baseUrl: http://localhost:3000
 */
require('dotenv').config();

const BASE = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function check(name, path, opts = {}) {
  const url = `${BASE.replace(/\/$/, '')}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: opts.method || 'GET',
      headers: opts.headers || {},
      body: opts.body,
    });
    const ms = Date.now() - started;
    let body = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      body = await res.json().catch(() => null);
    } else {
      await res.text().catch(() => '');
    }
    const ok = opts.expectStatus
      ? res.status === opts.expectStatus
      : res.status >= 200 && res.status < 300;
    const extra = opts.validate ? opts.validate(body, res) : true;
    if (ok && extra !== false) {
      console.log(`PASS  ${name}  [${res.status}] ${ms}ms`);
      return true;
    }
    console.error(`FAIL  ${name}  [${res.status}] expected ok`, body?.error || '');
    return false;
  } catch (e) {
    console.error(`FAIL  ${name}  network:`, e.message);
    return false;
  }
}

async function main() {
  console.log(`Smoke checks against ${BASE}\n`);
  const results = [];

  results.push(
    await check('GET /api/health', '/api/health', {
      validate: (b) => b && (b.status === 'ok' || b.mongodb === 'up'),
    })
  );
  results.push(
    await check('GET /api/stats', '/api/stats', {
      validate: (b) => b && typeof b.projects === 'number',
    })
  );
  results.push(await check('GET /api/programs', '/api/programs'));
  results.push(await check('GET /api/programs/gsoc', '/api/programs/gsoc'));
  results.push(await check('GET /api/programs/gssoc', '/api/programs/gssoc'));
  results.push(await check('GET /api/programs/nsoc', '/api/programs/nsoc'));
  results.push(
    await check('GET /api/projects?limit=3', '/api/projects?limit=3')
  );
  results.push(
    await check('GET /api/organizations?limit=3', '/api/organizations?limit=3')
  );
  results.push(await check('GET /api/search?q=python', '/api/search?q=python'));
  results.push(
    await check('GET /api/meta/filters', '/api/meta/filters', {
      validate: (b) => Array.isArray(b?.technologies),
    })
  );
  results.push(
    await check('GET /api/trending?domain=web&limit=5', '/api/trending?domain=web&limit=5', {
      validate: (b) => Array.isArray(b?.projects),
    })
  );
  results.push(
    await check('GET /api/guidelines?program=gsoc', '/api/guidelines?program=gsoc', {
      validate: (b) => b?.guideline || (Array.isArray(b?.guidelines) && b.guidelines.length > 0),
    })
  );

  results.push(
    await check('POST /api/match (valid)', '/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: ['Python', 'JavaScript'],
        experience: 'intermediate',
        availability: 20,
      }),
      validate: (b) => Array.isArray(b?.matches),
    })
  );

  results.push(
    await check('POST /api/match (invalid body)', '/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills: [] }),
      expectStatus: 400,
    })
  );

  results.push(
    await check('GET /api/user (unauthorized)', '/api/user', {
      expectStatus: 401,
    })
  );
  results.push(
    await check('GET /api/user/saved (unauthorized)', '/api/user/saved', {
      expectStatus: 401,
    })
  );
  results.push(
    await check('GET /api/user/applications (unauthorized)', '/api/user/applications', {
      expectStatus: 401,
    })
  );
  results.push(
    await check('POST /api/user/status (unauthorized)', '/api/user/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectIds: ['000000000000000000000001'] }),
      expectStatus: 401,
    })
  );

  const passed = results.filter(Boolean).length;
  const total = results.length;
  console.log(`\n${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
