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

const load = sourceLoader();
const reviewsRepo = load('src/lib/repositories/proposal-reviews.ts');

test('Mentor & Peer Proposal Review Engine Suite', async (t) => {
  await t.test('1. Standardized 4-Pillar Rubric Scoring Formula & Weights', () => {
    // Perfect score: 5, 5, 5, 5
    const perfect = reviewsRepo.calculateRubricScore({
      technicalArchitecture: 5,
      deliverablesTimeline: 5,
      communityBonding: 5,
      longTermImpact: 5,
    });
    assert.equal(perfect.weightedScore, 100);
    assert.equal(perfect.recommendation, 'strong_accept');

    // Lowest score: 1, 1, 1, 1
    const lowest = reviewsRepo.calculateRubricScore({
      technicalArchitecture: 1,
      deliverablesTimeline: 1,
      communityBonding: 1,
      longTermImpact: 1,
    });
    assert.equal(lowest.weightedScore, 20);
    assert.equal(lowest.recommendation, 'reject');

    // Weighted test: arch=5 (35%), time=4 (30%), bond=3 (20%), impact=4 (15%)
    // (5*0.35 + 4*0.30 + 3*0.20 + 4*0.15) / 5 = (1.75 + 1.20 + 0.60 + 0.60)/5 = 4.15 / 5 = 83%
    const realistic = reviewsRepo.calculateRubricScore({
      technicalArchitecture: 5,
      deliverablesTimeline: 4,
      communityBonding: 3,
      longTermImpact: 4,
    });
    assert.equal(realistic.weightedScore, 83);
    assert.equal(realistic.recommendation, 'accept');

    // Needs revision tier: 55-74%
    const revision = reviewsRepo.calculateRubricScore({
      technicalArchitecture: 3,
      deliverablesTimeline: 3,
      communityBonding: 3,
      longTermImpact: 3,
    });
    assert.equal(revision.weightedScore, 60);
    assert.equal(revision.recommendation, 'needs_revision');
  });

  await t.test('2. Cryptographic Review Token Generation & Verification', async () => {
    const proposalId = 'prop_test_123';
    const userId = 'user_author_456';

    const tokenDoc = await reviewsRepo.generateReviewToken({
      proposalId,
      userId,
      expiresInDays: 7,
      permission: 'can_score',
      restrictedEmail: 'mentor@example.com',
    });

    assert.ok(tokenDoc.token);
    assert.equal(tokenDoc.token.length, 40); // 20 bytes hex = 40 chars
    assert.equal(tokenDoc.proposalId, proposalId);
    assert.equal(tokenDoc.permission, 'can_score');
    assert.equal(tokenDoc.restrictedEmail, 'mentor@example.com');
    assert.equal(tokenDoc.revoked, false);

    // Valid verification with authorized email
    const verification = await reviewsRepo.verifyReviewToken(
      proposalId,
      tokenDoc.token,
      'mentor@example.com'
    );
    assert.equal(verification.valid, true);
    assert.ok(verification.tokenDoc);

    // Verification with unauthorized email
    const unauthorized = await reviewsRepo.verifyReviewToken(
      proposalId,
      tokenDoc.token,
      'hacker@example.com'
    );
    assert.equal(unauthorized.valid, false);

    // Verification for wrong proposal
    const wrongProposal = await reviewsRepo.verifyReviewToken(
      'wrong_prop_id',
      tokenDoc.token
    );
    assert.equal(wrongProposal.valid, false);
  });

  await t.test('3. Token Revocation Boundary', async () => {
    const proposalId = 'prop_rev_test';
    const userId = 'user_owner';

    const tokenDoc = await reviewsRepo.generateReviewToken({
      proposalId,
      userId,
      expiresInDays: 14,
    });

    // Revoke by non-owner fails
    const failedRevoke = await reviewsRepo.revokeReviewToken(
      proposalId,
      tokenDoc.token,
      'intruder'
    );
    assert.equal(failedRevoke, false);

    // Revoke by owner succeeds
    const successRevoke = await reviewsRepo.revokeReviewToken(
      proposalId,
      tokenDoc.token,
      userId
    );
    assert.equal(successRevoke, true);

    // After revocation, verification fails
    const postRevoke = await reviewsRepo.verifyReviewToken(proposalId, tokenDoc.token);
    assert.equal(postRevoke.valid, false);
    assert.ok(postRevoke.reason.includes('revoked'));
  });

  await t.test('4. Inline Annotation Creation, Status Transitions & Threaded Replies', async () => {
    const proposalId = 'prop_ann_test';

    // 1. Add annotation
    const annotation = await reviewsRepo.addProposalAnnotation(proposalId, {
      sectionId: 'architecture',
      authorName: 'Alex Rivera',
      authorRole: 'mentor',
      selectedText: 'Distributed Redis cluster',
      content: 'Consider connection pooling for serverless cold starts.',
    });

    assert.ok(annotation.id);
    assert.equal(annotation.status, 'open');
    assert.equal(annotation.authorRole, 'mentor');
    assert.equal(annotation.replies.length, 0);

    // 2. Add reply
    const updated = await reviewsRepo.addAnnotationReply(proposalId, annotation.id, {
      authorName: 'Student Contributor',
      content: 'Added ioredis cluster pool with max 10 connections.',
    });

    assert.ok(updated);
    assert.equal(updated.replies.length, 1);
    assert.equal(updated.replies[0].authorName, 'Student Contributor');

    // 3. Transition status to addressed
    const addressed = await reviewsRepo.updateAnnotationStatus(
      proposalId,
      annotation.id,
      'addressed'
    );
    assert.equal(addressed.status, 'addressed');

    // 4. Transition status to resolved
    const resolved = await reviewsRepo.updateAnnotationStatus(
      proposalId,
      annotation.id,
      'resolved'
    );
    assert.equal(resolved.status, 'resolved');

    // 5. Query all annotations
    const list = await reviewsRepo.getProposalAnnotations(proposalId);
    assert.equal(list.length, 1);
    assert.equal(list[0].id, annotation.id);
  });

  await t.test('5. Rubric Scorecard Evaluation Submission', async () => {
    const proposalId = 'prop_rubric_test';

    const evaluation = await reviewsRepo.submitRubricEvaluation(proposalId, {
      evaluatorName: 'Sarah Chen',
      evaluatorRole: 'alumnus',
      technicalArchitecture: 5,
      deliverablesTimeline: 4,
      communityBonding: 4,
      longTermImpact: 5,
      strengths: 'Excellent deliverables breakdown.',
      improvements: 'Add automated CI/CD pipeline.',
    });

    assert.ok(evaluation.id);
    assert.ok(evaluation.weightedScore >= 80);
    assert.equal(evaluation.evaluatorName, 'Sarah Chen');

    const evals = await reviewsRepo.getProposalRubricEvaluations(proposalId);
    assert.equal(evals.length, 1);
    assert.equal(evals[0].id, evaluation.id);
  });
});
