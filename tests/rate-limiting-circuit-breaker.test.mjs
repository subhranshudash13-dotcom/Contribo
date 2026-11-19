import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Transpile rate-limit.ts
const rlSource = fs.readFileSync(
  new URL('../src/lib/rate-limit.ts', import.meta.url),
  'utf8'
);
const rlCompiled = ts.transpileModule(rlSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const rlShim = { exports: {} };
vm.runInNewContext(rlCompiled, {
  module: rlShim,
  exports: rlShim.exports,
  process,
  Date,
  Math,
  Map,
  Headers,
  Request,
  fetch: globalThis.fetch,
  AbortSignal,
});
const { checkRateLimit, getClientIp, attachRateLimitHeaders, RATE_LIMIT_TIERS } = rlShim.exports;

// Transpile circuit-breaker.ts
const cbSource = fs.readFileSync(
  new URL('../src/lib/circuit-breaker.ts', import.meta.url),
  'utf8'
);
const cbCompiled = ts.transpileModule(cbSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const cbShim = { exports: {} };
vm.runInNewContext(cbCompiled, {
  module: cbShim,
  exports: cbShim.exports,
  process,
  Date,
  Math,
  Map,
});
const { CircuitBreaker, getCircuitBreaker } = cbShim.exports;

test('1. Distributed Rate Limiter - In-Memory Sliding Window', async (t) => {
  await t.test('allows requests within limit threshold', async () => {
    const key = `test_allow_${Date.now()}`;
    const opts = { limit: 3, windowMs: 1000 };

    const res1 = await checkRateLimit(key, opts);
    assert.equal(res1.success, true);
    assert.equal(res1.remaining, 2);

    const res2 = await checkRateLimit(key, opts);
    assert.equal(res2.success, true);
    assert.equal(res2.remaining, 1);

    const res3 = await checkRateLimit(key, opts);
    assert.equal(res3.success, true);
    assert.equal(res3.remaining, 0);
  });

  await t.test('rejects requests exceeding limit and provides retryAfter', async () => {
    const key = `test_reject_${Date.now()}`;
    const opts = { limit: 2, windowMs: 1000 };

    await checkRateLimit(key, opts);
    await checkRateLimit(key, opts);

    const blocked = await checkRateLimit(key, opts);
    assert.equal(blocked.success, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.retryAfter >= 1);
  });

  await t.test('extracts client IP from proxy headers', () => {
    const reqWithForwarded = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
    });
    assert.equal(getClientIp(reqWithForwarded), '203.0.113.195');

    const reqWithRealIp = new Request('http://localhost', {
      headers: { 'x-real-ip': '198.51.100.22' },
    });
    assert.equal(getClientIp(reqWithRealIp), '198.51.100.22');

    const reqFallback = new Request('http://localhost');
    assert.equal(getClientIp(reqFallback), '127.0.0.1');
  });

  await t.test('attaches correct X-RateLimit-* headers', () => {
    const headers = new Headers();
    const result = {
      success: false,
      limit: 10,
      remaining: 0,
      reset: 1700000000,
      retryAfter: 30,
    };

    attachRateLimitHeaders(headers, result);
    assert.equal(headers.get('X-RateLimit-Limit'), '10');
    assert.equal(headers.get('X-RateLimit-Remaining'), '0');
    assert.equal(headers.get('X-RateLimit-Reset'), '1700000000');
    assert.equal(headers.get('Retry-After'), '30');
  });
});

test('2. Circuit Breaker - Resilient Dependency Protection', async (t) => {
  await t.test('circuit starts in CLOSED state and passes executions', async () => {
    const cb = new CircuitBreaker('test-cb-1', { minRequests: 2 });
    assert.equal(cb.getState(), 'CLOSED');

    const res = await cb.execute(
      async () => 'primary-success',
      async () => 'fallback'
    );
    assert.equal(res, 'primary-success');
  });

  await t.test('circuit trips to OPEN when failure threshold is breached', async () => {
    const cb = new CircuitBreaker('test-cb-2', {
      minRequests: 2,
      failureThreshold: 0.5,
      coolOffMs: 500,
    });

    // Cause two failures
    await cb.execute(
      async () => {
        throw new Error('fail 1');
      },
      async () => 'fallback 1'
    );
    await cb.execute(
      async () => {
        throw new Error('fail 2');
      },
      async () => 'fallback 2'
    );

    assert.equal(cb.getState(), 'OPEN');

    // Subsequent calls immediately return fallback without executing primary
    let primaryCalled = false;
    const res = await cb.execute(
      async () => {
        primaryCalled = true;
        return 'primary';
      },
      async () => 'fast-fallback'
    );

    assert.equal(primaryCalled, false);
    assert.equal(res, 'fast-fallback');
  });

  await t.test('singleton registry returns existing circuit breakers', () => {
    const cb1 = getCircuitBreaker('gemini-api');
    const cb2 = getCircuitBreaker('gemini-api');
    assert.equal(cb1, cb2);
  });
});
