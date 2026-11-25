'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Ban,
  Copy,
  Check,
  Download,
  FileJson,
  Upload,
  ArrowLeft,
  GitPullRequest,
  CheckCircle2,
  MessageSquareCode,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  verifyAttestationReceiptAsync,
  type AttestationReceipt,
  type AttestationStatus,
  type VerificationResult,
} from '@/lib/passport/attestation';
import type { PublicPassportData } from '@/lib/passport';

interface VerifyClientProps {
  passport: PublicPassportData;
  initialReceipt: AttestationReceipt;
  initialVerification: VerificationResult;
}

function StatusBadge({ status }: { status: AttestationStatus }) {
  const styles: Record<AttestationStatus, { cls: string; icon: React.ReactNode }> = {
    VALID: {
      cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    TAMPERED: {
      cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    EXPIRED: {
      cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: <Clock className="w-4 h-4" />,
    },
    REVOKED: {
      cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
      icon: <Ban className="w-4 h-4" />,
    },
  };

  const current = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.cls}`}
    >
      {current.icon}
      {status}
    </span>
  );
}

export function VerifyClient({
  passport,
  initialReceipt,
  initialVerification,
}: VerifyClientProps) {
  const [copiedField, setCopiedField] = useState<'digest' | 'id' | null>(null);
  const [receiptInput, setReceiptInput] = useState<string>(() =>
    JSON.stringify(initialReceipt, null, 2)
  );
  const [offlineResult, setOfflineResult] = useState<VerificationResult>(initialVerification);
  const [parseError, setParseError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const { payload, digest } = initialReceipt;

  async function handleCopy(text: string, field: 'digest' | 'id') {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  function handleDownloadReceipt() {
    const blob = new Blob([JSON.stringify(initialReceipt, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${passport.username}-${payload.attestationId}-openbadge-v3.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runOfflineVerify(rawJson: string) {
    setVerifying(true);
    setParseError(null);
    try {
      const parsed = JSON.parse(rawJson);
      const result = await verifyAttestationReceiptAsync(parsed, { checkRegistry: false });
      setOfflineResult(result);
    } catch {
      setParseError('Invalid JSON syntax. Paste a complete Contribo AttestationReceipt JSON.');
    } finally {
      setVerifying(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setReceiptInput(text);
      void runOfflineVerify(text);
    };
    reader.readAsText(file);
  }

  function handleSimulateTamper() {
    try {
      const cloned = JSON.parse(JSON.stringify(initialReceipt)) as AttestationReceipt;
      cloned.payload.contributions.prsMerged += 99;
      const mutated = JSON.stringify(cloned, null, 2);
      setReceiptInput(mutated);
      void runOfflineVerify(mutated);
    } catch {
      // ignore
    }
  }

  function handleResetReceipt() {
    const original = JSON.stringify(initialReceipt, null, 2);
    setReceiptInput(original);
    void runOfflineVerify(original);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/passport/${passport.username}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to @{passport.username}&apos;s Passport
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-500 shrink-0" />
            Verifiable Contributor Attestation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Cryptographic SHA-256 web-proof &amp; Open Badges v3 credential portal for{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {passport.name}
            </span>{' '}
            (@{passport.username}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={initialVerification.status} />
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export JSON Receipt
          </button>
        </div>
      </div>

      {/* Private Notice */}
      {passport.isPrivate && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            This contributor&apos;s passport is marked private. Only minimal placeholder metadata is shown.
          </span>
        </div>
      )}

      {/* Verified Contribution Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Merged Pull Requests</span>
            <GitPullRequest className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {payload.contributions.prsMerged}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cryptographically bound to digest
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Issues Solved</span>
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {payload.contributions.issuesSolved}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified issue resolutions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Reviews Authored</span>
            <MessageSquareCode className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {payload.contributions.reviewsAuthored}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Peer &amp; mentor code reviews
          </p>
        </div>
      </section>

      {/* Program Participation Badges & Skill-Tree Milestones */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Program Participation Badges
          </h2>
          <div className="space-y-3">
            {payload.programBadges.map((badge) => (
              <div
                key={badge.program}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/70 dark:bg-slate-950/40"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {badge.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tier: {badge.tier}
                  </p>
                </div>
                <StatusBadge status={badge.verified ? initialVerification.status : 'EXPIRED'} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Attested Skill-Tree Milestones
          </h2>
          {payload.skillTreeMilestones.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {payload.skillTreeMilestones.map((milestone) => (
                <span
                  key={milestone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {milestone}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No skill-tree milestones recorded yet.
            </p>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>
              <span className="font-medium text-slate-700 dark:text-slate-300">Issued:</span>{' '}
              {new Date(payload.issuedAt).toUTCString()}
            </p>
            {payload.expiresAt && (
              <p>
                <span className="font-medium text-slate-700 dark:text-slate-300">Expires:</span>{' '}
                {new Date(payload.expiresAt).toUTCString()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Digest Hash Inspector */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileJson className="w-4 h-4 text-sky-500" />
            Cryptographic Digest Inspector (SHA-256)
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Open Badges v3 / W3C VC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Attestation ID
              </span>
              <button
                type="button"
                onClick={() => handleCopy(payload.attestationId, 'id')}
                className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {copiedField === 'id' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-slate-900 dark:text-slate-100 break-all">
              {payload.attestationId}
            </code>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                SHA-256 Digest
              </span>
              <button
                type="button"
                onClick={() => handleCopy(digest, 'digest')}
                className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                {copiedField === 'digest' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-slate-900 dark:text-slate-100 break-all">
              {digest}
            </code>
          </div>
        </div>
      </section>

      {/* Offline Browser Receipt Verifier */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Offline Receipt Verification Tool
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste or upload any exported JSON attestation receipt to verify its SHA-256 checksum
              instantly in your browser with zero network requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Upload JSON
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleSimulateTamper}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              Simulate Tamper
            </button>
            <button
              type="button"
              onClick={handleResetReceipt}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <textarea
          value={receiptInput}
          onChange={(e) => setReceiptInput(e.target.value)}
          rows={8}
          spellCheck={false}
          aria-label="Attestation JSON receipt input"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            disabled={verifying}
            onClick={() => void runOfflineVerify(receiptInput)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {verifying ? 'Verifying...' : 'Verify Receipt Offline'}
          </button>

          {!parseError && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">Result:</span>
              <StatusBadge status={offlineResult.status} />
            </div>
          )}
        </div>

        {parseError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-400">
            {parseError}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    offlineResult.checks.schemaValid ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span>Schema Valid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    offlineResult.checks.digestMatch ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span>Digest Match</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    offlineResult.checks.notExpired ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>Not Expired</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    offlineResult.checks.notRevoked ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                />
                <span>Not Revoked</span>
              </div>
            </div>
            {offlineResult.reasons.map((reason) => (
              <p key={reason} className="text-slate-600 dark:text-slate-400">
                {reason}
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
