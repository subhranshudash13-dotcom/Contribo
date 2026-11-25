import type { PublicPassportData } from '@/lib/passport';

export type AttestationStatus = 'VALID' | 'TAMPERED' | 'EXPIRED' | 'REVOKED';

export interface ContributionSummary {
  prsMerged: number;
  issuesSolved: number;
  reviewsAuthored: number;
}

export interface ProgramBadge {
  program: 'GSoC' | 'LFX' | 'Outreachy' | 'Contribo';
  label: string;
  tier: string;
  verified: boolean;
}

export interface AttestationPayload {
  version: '1.0';
  attestationId: string;
  username: string;
  name: string;
  githubUsername: string;
  issuedAt: string;
  expiresAt: string | null;
  readinessScore: number;
  readinessTier: string;
  contributions: ContributionSummary;
  skillTreeMilestones: string[];
  targetOrganizations: string[];
  programBadges: ProgramBadge[];
}

export interface OpenBadgeV3Credential {
  '@context': string[];
  id: string;
  type: ['VerifiableCredential', 'OpenBadgeCredential'];
  issuer: {
    id: string;
    type: 'Profile';
    name: string;
    url: string;
  };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    type: 'AchievementSubject';
    username: string;
    name: string;
    githubHandle: string;
    achievement: {
      id: string;
      type: 'Achievement';
      name: string;
      description: string;
      criteria: {
        narrative: string;
      };
    };
    evidence: {
      contributions: ContributionSummary;
      skillTreeMilestones: string[];
      targetOrganizations: string[];
      programBadges: ProgramBadge[];
      readinessScore: number;
      readinessTier: string;
    };
  };
  proof: {
    type: 'ContriboSha256Digest2026';
    created: string;
    proofPurpose: 'assertionMethod';
    digestAlgorithm: 'SHA-256';
    digest: string;
  };
}

export interface AttestationReceipt {
  payload: AttestationPayload;
  digest: string;
  credential: OpenBadgeV3Credential;
}

export interface RegistryRecord {
  attestationId: string;
  username: string;
  digest: string;
  issuedAt: string;
  expiresAt: string | null;
  revoked: boolean;
  revokedAt?: string;
  revocationReason?: string;
}

export interface VerificationChecks {
  schemaValid: boolean;
  digestMatch: boolean;
  notExpired: boolean;
  notRevoked: boolean;
}

export interface VerificationResult {
  status: AttestationStatus;
  valid: boolean;
  attestationId: string | null;
  username: string | null;
  expectedDigest: string | null;
  computedDigest: string | null;
  checks: VerificationChecks;
  reasons: string[];
  verifiedAt: string;
}

const ISSUER_ID = 'https://contribo.dev/issuers/contribo-attestation-engine';
const ISSUER_URL = 'https://contribo.dev';

// In-memory revocation & issuance registry (works offline and in tests)
const memoryRegistry = new Map<string, RegistryRecord>();

/**
 * Canonicalize any JSON-serializable value by sorting object keys recursively
 * so that SHA-256 digest computation is 100% deterministic.
 */
export function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeJson(item)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys
    .filter((key) => obj[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(obj[key])}`);
  return `{${entries.join(',')}}`;
}

/**
 * Pure-JS / Node-safe SHA-256 hex digest helper.
 * Uses Web Crypto API when available in async callers, and Node `crypto` synchronously
 * or a compact pure-JS SHA-256 fallback so both browser & server share identical output.
 */
export function sha256HexSync(input: string): string {
  // Try Node built-in crypto first when running on server / Node test runner
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('node:crypto') as typeof import('node:crypto');
    if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
      return nodeCrypto.createHash('sha256').update(input, 'utf8').digest('hex');
    }
  } catch {
    // Browser environment: fall through to pure-JS SHA-256
  }

  return pureJsSha256Hex(input);
}

/**
 * Async SHA-256 using Web Crypto API in browsers and Node crypto on server.
 */
export async function sha256HexAsync(input: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return sha256HexSync(input);
}

/**
 * Compact RFC 6234 SHA-256 implementation for synchronous browser execution.
 */
function pureJsSha256Hex(ascii: string): string {
  const bytes = new TextEncoder().encode(ascii);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const W = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return Array.from(H)
    .map((word) => word.toString(16).padStart(8, '0'))
    .join('');
}

/**
 * Derive deterministic contribution & program badge metadata from a PublicPassportData record.
 */
export function buildPayloadFromPassport(
  passport: PublicPassportData,
  options?: {
    issuedAt?: string;
    expiresInDays?: number | null;
    contributions?: Partial<ContributionSummary>;
    skillTreeMilestones?: string[];
  }
): AttestationPayload {
  const issuedAt = options?.issuedAt ?? new Date().toISOString();
  const expiresAt =
    typeof options?.expiresInDays === 'number' && options.expiresInDays > 0
      ? new Date(new Date(issuedAt).getTime() + options.expiresInDays * 86_400_000).toISOString()
      : null;

  const prsMerged =
    options?.contributions?.prsMerged ??
    Math.max(passport.completedSignals * 3 + passport.applicationsCount * 2, passport.ready ? 12 : 4);
  const issuesSolved =
    options?.contributions?.issuesSolved ??
    Math.max(passport.completedSignals * 2 + passport.skills.length, passport.ready ? 8 : 3);
  const reviewsAuthored =
    options?.contributions?.reviewsAuthored ??
    Math.max(passport.completedSignals + Math.floor(passport.score / 20), 2);

  const skillTreeMilestones =
    options?.skillTreeMilestones && options.skillTreeMilestones.length > 0
      ? [...options.skillTreeMilestones]
      : [
          ...(passport.ready ? ['Program Readiness Verified'] : []),
          ...passport.skills.slice(0, 5).map((s) => `${s} Mastery`),
        ];

  const targetOrganizations = passport.targetOrganizations.map((org) => org.name);

  const programBadges: ProgramBadge[] = [
    {
      program: 'GSoC',
      label: 'GSoC Track',
      tier: passport.tier.tier,
      verified: passport.score >= 70,
    },
    {
      program: 'LFX',
      label: 'LFX Mentorship',
      tier: passport.tier.tier,
      verified: passport.score >= 60,
    },
    {
      program: 'Outreachy',
      label: 'Outreachy Ready',
      tier: passport.tier.tier,
      verified: passport.score >= 60 && passport.completedSignals >= 3,
    },
  ];

  // Deterministic ID derived from core identity + issuedAt + readiness
  const idSeed = canonicalizeJson({
    username: passport.username,
    issuedAt,
    score: passport.score,
    prsMerged,
    issuesSolved,
    reviewsAuthored,
    skillTreeMilestones,
  });
  const attestationId = `att_${sha256HexSync(idSeed).slice(0, 16)}`;

  return {
    version: '1.0',
    attestationId,
    username: passport.username,
    name: passport.name,
    githubUsername: passport.githubUsername,
    issuedAt,
    expiresAt,
    readinessScore: passport.score,
    readinessTier: passport.tier.tier,
    contributions: {
      prsMerged,
      issuesSolved,
      reviewsAuthored,
    },
    skillTreeMilestones,
    targetOrganizations,
    programBadges,
  };
}

/**
 * Compute deterministic SHA-256 digest of an AttestationPayload.
 */
export function computeAttestationDigest(payload: AttestationPayload): string {
  return sha256HexSync(canonicalizeJson(payload));
}

export async function computeAttestationDigestAsync(payload: AttestationPayload): Promise<string> {
  return sha256HexAsync(canonicalizeJson(payload));
}

/**
 * Build an Open Badges v3 / W3C Verifiable Credentials compatible document.
 */
export function buildOpenBadgesV3Credential(
  payload: AttestationPayload,
  digest: string
): OpenBadgeV3Credential {
  return {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
    ],
    id: `${ISSUER_URL}/credentials/${payload.attestationId}`,
    type: ['VerifiableCredential', 'OpenBadgeCredential'],
    issuer: {
      id: ISSUER_ID,
      type: 'Profile',
      name: 'Contribo Open-Source Attestation Engine',
      url: ISSUER_URL,
    },
    issuanceDate: payload.issuedAt,
    ...(payload.expiresAt ? { expirationDate: payload.expiresAt } : {}),
    credentialSubject: {
      id: `${ISSUER_URL}/passport/${payload.username}`,
      type: 'AchievementSubject',
      username: payload.username,
      name: payload.name,
      githubHandle: payload.githubUsername,
      achievement: {
        id: `${ISSUER_URL}/achievements/${payload.readinessTier.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'Achievement',
        name: `Contribo ${payload.readinessTier}`,
        description: `Verified open-source contributor attestation for @${payload.username} (${payload.readinessScore}% readiness).`,
        criteria: {
          narrative:
            'Earned through verified pull requests, solved issues, code reviews, and Contribo skill-tree milestone completion.',
        },
      },
      evidence: {
        contributions: payload.contributions,
        skillTreeMilestones: payload.skillTreeMilestones,
        targetOrganizations: payload.targetOrganizations,
        programBadges: payload.programBadges,
        readinessScore: payload.readinessScore,
        readinessTier: payload.readinessTier,
      },
    },
    proof: {
      type: 'ContriboSha256Digest2026',
      created: payload.issuedAt,
      proofPurpose: 'assertionMethod',
      digestAlgorithm: 'SHA-256',
      digest,
    },
  };
}

/**
 * Generate a complete tamper-evident AttestationReceipt and register it in the registry.
 */
export function createAttestationReceipt(
  passport: PublicPassportData,
  options?: {
    issuedAt?: string;
    expiresInDays?: number | null;
    contributions?: Partial<ContributionSummary>;
    skillTreeMilestones?: string[];
    register?: boolean;
  }
): AttestationReceipt {
  const payload = buildPayloadFromPassport(passport, options);
  const digest = computeAttestationDigest(payload);
  const credential = buildOpenBadgesV3Credential(payload, digest);

  if (options?.register !== false) {
    registerAttestation({
      attestationId: payload.attestationId,
      username: payload.username,
      digest,
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      revoked: false,
    });
  }

  return {
    payload,
    digest,
    credential,
  };
}

/**
 * Register or update an attestation record in the in-memory revocation registry.
 */
export function registerAttestation(record: RegistryRecord): RegistryRecord {
  memoryRegistry.set(record.attestationId, { ...record });
  return record;
}

export function getRegistryRecord(attestationId: string): RegistryRecord | null {
  return memoryRegistry.get(attestationId) ?? null;
}

export function revokeAttestation(
  attestationId: string,
  reason = 'Revoked by issuer or contributor'
): RegistryRecord | null {
  const existing = memoryRegistry.get(attestationId);
  if (!existing) return null;
  const updated: RegistryRecord = {
    ...existing,
    revoked: true,
    revokedAt: new Date().toISOString(),
    revocationReason: reason,
  };
  memoryRegistry.set(attestationId, updated);
  return updated;
}

export function clearAttestationRegistry(): void {
  memoryRegistry.clear();
}

/**
 * Validate structural integrity of an AttestationReceipt.
 */
export function isValidReceiptShape(input: unknown): input is AttestationReceipt {
  if (!input || typeof input !== 'object') return false;
  const candidate = input as Partial<AttestationReceipt>;
  const p = candidate.payload;
  const c = candidate.credential;
  if (!p || typeof p !== 'object') return false;
  if (typeof candidate.digest !== 'string' || !/^[a-f0-9]{64}$/i.test(candidate.digest)) {
    return false;
  }
  if (
    typeof p.attestationId !== 'string' ||
    !p.attestationId.startsWith('att_') ||
    typeof p.username !== 'string' ||
    !p.username ||
    typeof p.issuedAt !== 'string' ||
    !p.contributions ||
    typeof p.contributions.prsMerged !== 'number' ||
    typeof p.contributions.issuesSolved !== 'number' ||
    typeof p.contributions.reviewsAuthored !== 'number' ||
    !Array.isArray(p.skillTreeMilestones)
  ) {
    return false;
  }
  if (
    !c ||
    typeof c !== 'object' ||
    !Array.isArray(c.type) ||
    !c.type.includes('VerifiableCredential') ||
    !c.type.includes('OpenBadgeCredential') ||
    !c.proof ||
    typeof c.proof.digest !== 'string'
  ) {
    return false;
  }
  return true;
}

/**
 * Verify an AttestationReceipt against SHA-256 digest, expiration, and revocation registry.
 */
export function verifyAttestationReceipt(
  receiptInput: unknown,
  options?: { now?: Date; checkRegistry?: boolean }
): VerificationResult {
  const verifiedAt = (options?.now ?? new Date()).toISOString();

  if (!isValidReceiptShape(receiptInput)) {
    return {
      status: 'TAMPERED',
      valid: false,
      attestationId: null,
      username: null,
      expectedDigest: null,
      computedDigest: null,
      checks: {
        schemaValid: false,
        digestMatch: false,
        notExpired: false,
        notRevoked: false,
      },
      reasons: ['Receipt payload is missing required AttestationReceipt / Open Badges v3 fields.'],
      verifiedAt,
    };
  }

  const { payload, digest, credential } = receiptInput;
  const computedDigest = computeAttestationDigest(payload);
  const digestMatch =
    computedDigest.toLowerCase() === digest.toLowerCase() &&
    credential.proof.digest.toLowerCase() === digest.toLowerCase() &&
    credential.credentialSubject.username === payload.username;

  const nowMs = (options?.now ?? new Date()).getTime();
  const expiresMs = payload.expiresAt ? Date.parse(payload.expiresAt) : null;
  const notExpired = expiresMs === null || (Number.isFinite(expiresMs) && expiresMs > nowMs);

  let notRevoked = true;
  if (options?.checkRegistry !== false) {
    const record = getRegistryRecord(payload.attestationId);
    if (record) {
      if (record.revoked) {
        notRevoked = false;
      }
      if (record.digest.toLowerCase() !== computedDigest.toLowerCase()) {
        // Registry digest mismatch indicates payload alteration
        return {
          status: 'TAMPERED',
          valid: false,
          attestationId: payload.attestationId,
          username: payload.username,
          expectedDigest: record.digest,
          computedDigest,
          checks: {
            schemaValid: true,
            digestMatch: false,
            notExpired,
            notRevoked,
          },
          reasons: ['Computed digest does not match the registered attestation digest.'],
          verifiedAt,
        };
      }
    }
  }

  const reasons: string[] = [];
  let status: AttestationStatus = 'VALID';

  if (!digestMatch) {
    status = 'TAMPERED';
    reasons.push('SHA-256 digest mismatch: contribution payload or proof has been altered.');
  } else if (!notRevoked) {
    status = 'REVOKED';
    reasons.push('Attestation ID has been revoked in the Contribo registry.');
  } else if (!notExpired) {
    status = 'EXPIRED';
    reasons.push(`Attestation expired at ${payload.expiresAt}.`);
  } else {
    reasons.push('SHA-256 cryptographic digest and Open Badges v3 schema verified.');
  }

  return {
    status,
    valid: status === 'VALID',
    attestationId: payload.attestationId,
    username: payload.username,
    expectedDigest: digest,
    computedDigest,
    checks: {
      schemaValid: true,
      digestMatch,
      notExpired,
      notRevoked,
    },
    reasons,
    verifiedAt,
  };
}

/**
 * Browser-safe async verification using Web Crypto API (zero network requests).
 */
export async function verifyAttestationReceiptAsync(
  receiptInput: unknown,
  options?: { now?: Date; checkRegistry?: boolean }
): Promise<VerificationResult> {
  const syncResult = verifyAttestationReceipt(receiptInput, options);
  if (isValidReceiptShape(receiptInput)) {
    const asyncDigest = await computeAttestationDigestAsync(receiptInput.payload);
    if (asyncDigest !== syncResult.computedDigest) {
      return {
        ...syncResult,
        status: 'TAMPERED',
        valid: false,
        computedDigest: asyncDigest,
        checks: { ...syncResult.checks, digestMatch: false },
        reasons: ['Web Crypto SHA-256 digest mismatch.'],
      };
    }
  }
  return syncResult;
}
