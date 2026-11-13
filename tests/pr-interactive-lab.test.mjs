import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const prLabPath = path.resolve('src/app/resources/components/PrInteractiveLab.tsx');
const resourcesClientPath = path.resolve('src/app/resources/ResourcesClient.tsx');

test('PrInteractiveLab component file exists at target directory', () => {
  assert.equal(fs.existsSync(prLabPath), true, 'PrInteractiveLab.tsx should exist');
});

test('PrInteractiveLab implements the 3 required tabs and views', () => {
  const content = fs.readFileSync(prLabPath, 'utf8');
  assert.ok(content.includes('Anatomy of a PR'), 'Must include Anatomy of a PR view');
  assert.ok(content.includes('Issue Inspector'), 'Must include Issue Inspector view');
  assert.ok(content.includes('Value Breakdown'), 'Must include Value Breakdown view');
});

test('PrInteractiveLab implements all 5 interactive PR anatomy elements', () => {
  const content = fs.readFileSync(prLabPath, 'utf8');
  assert.ok(content.includes('Semantic PR Title'), 'Must include semantic title');
  assert.ok(content.includes('Automatic Issue Linking'), 'Must include automatic issue linking');
  assert.ok(content.includes('Code Diff'), 'Must include code diffs');
  assert.ok(content.includes('Threaded Review Comments'), 'Must include threaded review comments');
  assert.ok(content.includes('Automated CI Test Checks') || content.includes('All checks have passed'), 'Must include CI checks');
});

test('PrInteractiveLab includes side-by-side low-effort vs high-value issue comparison', () => {
  const content = fs.readFileSync(prLabPath, 'utf8');
  assert.ok(content.includes('Low-Effort Issue'), 'Must include low-effort issue comparison');
  assert.ok(content.includes('High-Value Bug Report'), 'Must include high-value bug report comparison');
});

test('PrInteractiveLab includes all 3 value breakdown cards', () => {
  const content = fs.readFileSync(prLabPath, 'utf8');
  assert.ok(content.includes('Hardens Security'), 'Must include security pillar');
  assert.ok(content.includes('Accelerates Feature Velocity'), 'Must include feature delivery velocity pillar');
  assert.ok(content.includes('Verifiable Proof-of-Work'), 'Must include proof-of-work pillar');
});

test('PrInteractiveLab uses Contribo semantic design tokens and required icons', () => {
  const content = fs.readFileSync(prLabPath, 'utf8');
  // Design tokens
  assert.ok(content.includes('bg-surface'), 'Must use bg-surface');
  assert.ok(content.includes('text-primary'), 'Must use text-primary');
  assert.ok(content.includes('border-hairline'), 'Must use border-hairline');
  assert.ok(content.includes('text-accent'), 'Must use text-accent');

  // Required Lucide icons
  assert.ok(content.includes('GitPullRequest'), 'Must import GitPullRequest');
  assert.ok(content.includes('CircleDot'), 'Must import CircleDot');
  assert.ok(content.includes('CheckCircle2'), 'Must import CheckCircle2');
  assert.ok(content.includes('ShieldCheck'), 'Must import ShieldCheck');
  assert.ok(content.includes('Terminal'), 'Must import Terminal');
  assert.ok(content.includes('Zap'), 'Must import Zap');
});

test('ResourcesClient imports and renders PrInteractiveLab', () => {
  const content = fs.readFileSync(resourcesClientPath, 'utf8');
  assert.ok(content.includes("import { PrInteractiveLab } from './components/PrInteractiveLab'"), 'Must import PrInteractiveLab');
  assert.ok(content.includes('<PrInteractiveLab />'), 'Must render <PrInteractiveLab />');
});

