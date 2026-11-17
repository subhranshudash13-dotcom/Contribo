'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  Globe,
  Key,
  Link as LinkIcon,
  Shield,
  X,
} from 'lucide-react';
import type { ReviewTokenPermission } from '@/lib/proposal-studio/review-types';

interface ShareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
}

export function ShareReviewModal({
  isOpen,
  onClose,
  proposalId,
}: ShareReviewModalProps) {
  const [permission, setPermission] = useState<ReviewTokenPermission>('can_score');
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/review/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresInDays,
          permission,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate token');
      const data = await res.json();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = `${origin}/proposals/${proposalId}/review?token=${data.token.token}`;
      setGeneratedLink(fullUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-hairline bg-surface shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-primary">
                Invite Mentors & Peers for Review
              </h3>
              <p className="text-[11px] font-mono text-muted">
                Create a secure, expiring cryptographic review link
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-muted block text-[11px] mb-1.5">Reviewer Permissions:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPermission('can_score')}
                className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                  permission === 'can_score'
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-hairline bg-page text-secondary'
                }`}
              >
                <div>Score & Comment</div>
                <div className="text-[10px] text-muted font-normal mt-0.5">Mentors</div>
              </button>
              <button
                type="button"
                onClick={() => setPermission('can_comment')}
                className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                  permission === 'can_comment'
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-hairline bg-page text-secondary'
                }`}
              >
                <div>Comment Only</div>
                <div className="text-[10px] text-muted font-normal mt-0.5">Peers</div>
              </button>
              <button
                type="button"
                onClick={() => setPermission('read_only')}
                className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                  permission === 'read_only'
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-hairline bg-page text-secondary'
                }`}
              >
                <div>Read Only</div>
                <div className="text-[10px] text-muted font-normal mt-0.5">Observers</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-muted block text-[11px] mb-1.5">Link Expiration:</label>
            <div className="flex gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExpiresInDays(days)}
                  className={`flex-1 py-1.5 rounded-xl border text-center transition-colors cursor-pointer ${
                    expiresInDays === days
                      ? 'border-accent bg-accent text-white font-semibold'
                      : 'border-hairline bg-page text-secondary'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate / Link Output */}
        {generatedLink ? (
          <div className="space-y-2 pt-2">
            <label className="text-muted block text-[11px] font-mono">Your Secure Review URL:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="w-full rounded-xl border border-hairline bg-page px-3 py-2 font-mono text-xs text-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-accent text-white font-mono text-xs font-semibold shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] font-mono text-muted">
              Anyone with this link can view and review your draft until it expires in {expiresInDays} days.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-accent text-white font-mono text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Generating Link…' : 'Generate Review Access Link'}
          </button>
        )}
      </div>
    </div>
  );
}
