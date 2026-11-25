import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

function sourceLoader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    const resolved = path.resolve(root, filename);
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const mod = { exports: {} };
    cache.set(resolved, mod);
    const compiled = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (!id.startsWith('@/') && !id.startsWith('.')) return require(id);
      const base = id.startsWith('@/')
        ? path.join(root, 'src', id.slice(2))
        : path.resolve(path.dirname(resolved), id);
      const target = ['.ts', '.tsx'].map((ext) => base + ext).find(fs.existsSync);
      assert.ok(target, `Cannot resolve production module ${id}`);
      return load(target);
    };
    vm.runInThisContext(`(function(require, module, exports) {\n${compiled}\n})`, {
      filename: resolved,
    })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load;
}

const mockPassport = {
  isPrivate: false,
  username: 'trunal2005',
  name: 'Trunal Patil',
  githubUsername: 'Trunal2005',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
  bio: 'Open-source systems & TypeScript contributor.',
  score: 92,
  completedSignals: 4,
  totalSignals: 4,
  ready: true,
  hint: 'Program ready',
  tier: {
    tier: 'Distinguished Fellow',
    label: 'Distinguished',
    color: '#8b5cf6',
    bgClass: '',
    badgeColor: '#8b5cf6',
    description: 'Top-tier contributor',
  },
  skills: ['TypeScript', 'Next.js', 'MongoDB', 'Node.js'],
  targetOrganizations: [
    { name: 'Apache Software Foundation', slug: 'apache' },
    { name: 'CNCF', slug: 'cncf' },
  ],
  applicationsCount: 3,
  visibility: 'public',
};

const privatePassport = {
  ...mockPassport,
  isPrivate: true,
  username: 'private_dev',
  visibility: 'private',
};

const load = sourceLoader();
const attestation = load('src/lib/passport/attestation.ts');
const {
  canonicalizeJson,
  computeAttestationDigest,
  createAttestationReceipt,
  verifyAttestationReceipt,
  verifyAttestationReceiptAsync,
  revokeAttestation,
  clearAttestationRegistry,
} = attestation;

test('canonicalizeJson produces identical strings regardless of key insertion order', () => {
  const a = { z: 1, a: { d: 4, b: 2 }, arr: [{ y: 9, x: 8 }] };
  const b = { arr: [{ x: 8, y: 9 }], a: { b: 2, d: 4 }, z: 1 };
  assert.equal(canonicalizeJson(a), canonicalizeJson(b));
});

test('createAttestationReceipt generates deterministic SHA-256 digest and att_ ID', () => {
  clearAttestationRegistry();
  const fixedDate = '2026-11-25T12:00:00.000Z';
  const r1 = createAttestationReceipt(mockPassport, { issuedAt: fixedDate, expiresInDays: 365 });
  const r2 = createAttestationReceipt(mockPassport, { issuedAt: fixedDate, expiresInDays: 365 });

  assert.match(r1.payload.attestationId, /^att_[a-f0-9]{16}$/);
  assert.match(r1.digest, /^[a-f0-9]{64}$/);
  assert.equal(r1.payload.attestationId, r2.payload.attestationId);
  assert.equal(r1.digest, r2.digest);
  assert.equal(computeAttestationDigest(r1.payload), r1.digest);
});

test('Open Badges v3 / W3C Verifiable Credential structure is valid', () => {
  clearAttestationRegistry();
  const receipt = createAttestationReceipt(mockPassport, {
    issuedAt: '2026-11-25T12:00:00.000Z',
    expiresInDays: 90,
  });
  const vc = receipt.credential;

  assert.ok(vc['@context'].includes('https://www.w3.org/ns/credentials/v2'));
  assert.ok(vc['@context'].includes('https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json'));
  assert.deepEqual(vc.type, ['VerifiableCredential', 'OpenBadgeCredential']);
  assert.equal(vc.credentialSubject.username, 'trunal2005');
  assert.equal(vc.proof.digestAlgorithm, 'SHA-256');
  assert.equal(vc.proof.digest, receipt.digest);
  assert.ok(vc.expirationDate);
});

test('verifyAttestationReceipt returns VALID for untampered serialized receipt', async () => {
  clearAttestationRegistry();
  const receipt = createAttestationReceipt(mockPassport, {
    issuedAt: '2026-11-25T12:00:00.000Z',
    expiresInDays: 365,
  });
  const roundTripped = JSON.parse(JSON.stringify(receipt));

  const syncRes = verifyAttestationReceipt(roundTripped, {
    now: new Date('2026-11-26T00:00:00.000Z'),
  });
  assert.equal(syncRes.status, 'VALID');
  assert.equal(syncRes.valid, true);
  assert.deepEqual(syncRes.checks, {
    schemaValid: true,
    digestMatch: true,
    notExpired: true,
    notRevoked: true,
  });

  const asyncRes = await verifyAttestationReceiptAsync(roundTripped, {
    now: new Date('2026-11-26T00:00:00.000Z'),
  });
  assert.equal(asyncRes.status, 'VALID');
  assert.equal(asyncRes.valid, true);
});

test('verifyAttestationReceipt detects tampering when any payload field is mutated', () => {
  clearAttestationRegistry();
  const receipt = createAttestationReceipt(mockPassport, {
    issuedAt: '2026-11-25T12:00:00.000Z',
    expiresInDays: 365,
  });

  const tamperedPrs = JSON.parse(JSON.stringify(receipt));
  tamperedPrs.payload.contributions.prsMerged += 1;
  const resPrs = verifyAttestationReceipt(tamperedPrs);
  assert.equal(resPrs.status, 'TAMPERED');
  assert.equal(resPrs.valid, false);
  assert.equal(resPrs.checks.digestMatch, false);

  const tamperedMilestone = JSON.parse(JSON.stringify(receipt));
  tamperedMilestone.payload.skillTreeMilestones.push('Injected Milestone');
  const resMilestone = verifyAttestationReceipt(tamperedMilestone);
  assert.equal(resMilestone.status, 'TAMPERED');
  assert.equal(resMilestone.valid, false);
});

test('verifyAttestationReceipt detects EXPIRED and REVOKED credentials', () => {
  clearAttestationRegistry();
  const receipt = createAttestationReceipt(mockPassport, {
    issuedAt: '2026-01-01T00:00:00.000Z',
    expiresInDays: 30,
  });

  const expiredRes = verifyAttestationReceipt(receipt, {
    now: new Date('2026-03-01T00:00:00.000Z'),
  });
  assert.equal(expiredRes.status, 'EXPIRED');
  assert.equal(expiredRes.valid, false);
  assert.equal(expiredRes.checks.notExpired, false);

  revokeAttestation(receipt.payload.attestationId, 'Key rotation');
  const revokedRes = verifyAttestationReceipt(receipt, {
    now: new Date('2026-01-10T00:00:00.000Z'),
  });
  assert.equal(revokedRes.status, 'REVOKED');
  assert.equal(revokedRes.valid, false);
  assert.equal(revokedRes.checks.notRevoked, false);
});

test('REST routes GET /api/passport/[username]/attestation and POST /api/passport/verify handle all cases', async () => {
  clearAttestationRegistry();
  const apiLoader = sourceLoader({
    'next/server': {
      NextResponse: {
        json(data, init = {}) {
          return new Response(JSON.stringify(data), {
            status: init.status ?? 200,
            headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
          });
        },
      },
    },
    '@/lib/repositories/passport': {
      async getPublicPassport(username) {
        if (username === 'trunal2005') return mockPassport;
        if (username === 'private_dev') return privatePassport;
        return null;
      },
    },
    '@/lib/passport/attestation': attestation,
  });

  const getRoute = apiLoader('src/app/api/passport/[username]/attestation/route.ts');
  const verifyRoute = apiLoader('src/app/api/passport/verify/route.ts');

  // 400 invalid username
  const badReq = new Request('http://localhost/api/passport/!!!/attestation');
  const badRes = await getRoute.GET(badReq, { params: Promise.resolve({ username: '!!!' }) });
  assert.equal(badRes.status, 400);

  // 404 missing user
  const notFoundReq = new Request('http://localhost/api/passport/ghost/attestation');
  const notFoundRes = await getRoute.GET(notFoundReq, { params: Promise.resolve({ username: 'ghost' }) });
  assert.equal(notFoundRes.status, 404);

  // 403 private user
  const privReq = new Request('http://localhost/api/passport/private_dev/attestation');
  const privRes = await getRoute.GET(privReq, { params: Promise.resolve({ username: 'private_dev' }) });
  assert.equal(privRes.status, 403);

  // 200 valid receipt
  const okReq = new Request('http://localhost/api/passport/trunal2005/attestation?expiresInDays=180');
  const okRes = await getRoute.GET(okReq, { params: Promise.resolve({ username: 'trunal2005' }) });
  assert.equal(okRes.status, 200);
  const receipt = await okRes.json();
  assert.match(receipt.payload.attestationId, /^att_[a-f0-9]{16}$/);

  // 200 ?format=vc
  const vcReq = new Request('http://localhost/api/passport/trunal2005/attestation?format=vc');
  const vcRes = await getRoute.GET(vcReq, { params: Promise.resolve({ username: 'trunal2005' }) });
  assert.equal(vcRes.status, 200);
  const vcBody = await vcRes.json();
  assert.deepEqual(vcBody.type, ['VerifiableCredential', 'OpenBadgeCredential']);

  // POST /api/passport/verify -> VALID
  const verifyValidReq = new Request('http://localhost/api/passport/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(receipt),
  });
  const verifyValidRes = await verifyRoute.POST(verifyValidReq);
  assert.equal(verifyValidRes.status, 200);
  const verifyValidJson = await verifyValidRes.json();
  assert.equal(verifyValidJson.status, 'VALID');

  // POST /api/passport/verify -> TAMPERED
  const tampered = JSON.parse(JSON.stringify(receipt));
  tampered.payload.readinessScore = 100;
  const verifyTamperReq = new Request('http://localhost/api/passport/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receipt: tampered }),
  });
  const verifyTamperRes = await verifyRoute.POST(verifyTamperReq);
  assert.equal(verifyTamperRes.status, 200);
  const verifyTamperJson = await verifyTamperRes.json();
  assert.equal(verifyTamperJson.status, 'TAMPERED');

  // POST /api/passport/verify -> 400 on invalid JSON
  const badJsonReq = new Request('http://localhost/api/passport/verify', {
    method: 'POST',
    body: '{bad json',
  });
  const badJsonRes = await verifyRoute.POST(badJsonReq);
  assert.equal(badJsonRes.status, 400);
});
