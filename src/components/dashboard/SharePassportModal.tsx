'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Shield,
  Eye,
  Lock,
  Globe,
  Loader2,
} from 'lucide-react';
import type { PassportSettings } from '@/../types';

interface SharePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
  initialSettings?: PassportSettings;
}

export function SharePassportModal({
  isOpen,
  onClose,
  username,
  displayName,
  initialSettings,
}: SharePassportModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>(
    initialSettings?.visibility || 'public'
  );
  const [showTargetOrgs, setShowTargetOrgs] = useState(
    initialSettings?.showTargetOrgs !== false
  );
  const [showSkills, setShowSkills] = useState(
    initialSettings?.showSkills !== false
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://contribo.org';
  const passportUrl = `${baseOrigin}/passport/${username}`;
  const badgeUrl = `${baseOrigin}/api/passport/${username}/badge.svg`;
  const markdownSnippet = `[![Contribo Readiness](${badgeUrl})](${passportUrl})`;

  const copyText = async (text: string, type: 'link' | 'badge') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedBadge(true);
        setTimeout(() => setCopiedBadge(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSaveSettings = async (
    newVisibility: 'public' | 'unlisted' | 'private',
    newShowTargetOrgs: boolean,
    newShowSkills: boolean
  ) => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/user/passport-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visibility: newVisibility,
          showTargetOrgs: newShowTargetOrgs,
          showSkills: newShowSkills,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to update passport settings', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-hairline/90 bg-surface/95 backdrop-blur-xl shadow-2xl p-6 sm:p-7 space-y-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passport-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Shield size={16} />
            </div>
            <div>
              <h3 id="passport-modal-title" className="text-base font-heading font-extrabold text-primary">
                {displayName ? `${displayName}'s Passport & Badge` : 'Contributor Passport & Badge'}
              </h3>
              <p className="text-xs text-secondary">
                Share your readiness evaluation with mentors & community
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-tertiary hover:text-primary hover:bg-surface-raised transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live SVG Badge Preview */}
        <div className="p-4 rounded-xl border border-hairline/80 bg-surface-raised/50 space-y-2.5 text-center sm:text-left">
          <span className="text-[11px] font-mono text-tertiary uppercase tracking-wider">
            Live GitHub Badge Preview
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="inline-block p-1 bg-surface rounded-lg border border-hairline shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={badgeUrl}
                alt="Contribo Readiness Badge Preview"
                className="h-5"
              />
            </div>
            <span className="text-xs text-secondary font-medium">
              Auto-updates as you complete milestones
            </span>
          </div>
        </div>

        {/* Copy Options */}
        <div className="space-y-4">
          {/* Public Link */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-primary">Public Passport URL</span>
              <Link
                href={passportUrl}
                target="_blank"
                className="text-accent hover:text-accent/80 font-medium flex items-center gap-1"
              >
                <span>View Page</span>
                <ExternalLink size={11} />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={passportUrl}
                className="flex-1 p-2 rounded-lg bg-page font-mono text-xs text-primary border border-hairline select-all"
              />
              <button
                type="button"
                onClick={() => copyText(passportUrl, 'link')}
                className="px-3 py-2 rounded-lg bg-surface-raised hover:bg-surface border border-hairline text-xs font-bold text-primary hover:text-accent flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Markdown Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-primary">GitHub Profile Markdown</span>
              <span className="text-tertiary text-[11px]">Paste into README.md</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={markdownSnippet}
                className="flex-1 p-2 rounded-lg bg-page font-mono text-xs text-primary border border-hairline select-all"
              />
              <button
                type="button"
                onClick={() => copyText(markdownSnippet, 'badge')}
                className="px-3 py-2 rounded-lg bg-primary text-page text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shrink-0 transition-opacity"
              >
                {copiedBadge ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedBadge ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visibility & Privacy Controls */}
        <div className="pt-4 border-t border-hairline space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Eye size={13} /> Passport Visibility
            </span>
            {saving ? (
              <span className="text-[11px] font-mono text-tertiary flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" /> Saving...
              </span>
            ) : savedSuccess ? (
              <span className="text-[11px] font-mono text-emerald-500 font-bold">
                Preferences saved!
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'public', label: 'Public', icon: Globe, desc: 'Visible to everyone' },
              { id: 'unlisted', label: 'Unlisted', icon: Share2, desc: 'Anyone with link' },
              { id: 'private', label: 'Private', icon: Lock, desc: 'Hidden' },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = visibility === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    const next = option.id as 'public' | 'unlisted' | 'private';
                    setVisibility(next);
                    handleSaveSettings(next, showTargetOrgs, showSkills);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/10 text-primary'
                      : 'border-hairline bg-surface-raised/40 text-secondary hover:border-hairline/90'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                    <Icon size={12} className={isSelected ? 'text-accent' : 'text-tertiary'} />
                    <span>{option.label}</span>
                  </div>
                  <div className="text-[10px] text-tertiary leading-tight">{option.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Granular Visibility Checkboxes */}
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={showTargetOrgs}
                onChange={(e) => {
                  const val = e.target.checked;
                  setShowTargetOrgs(val);
                  handleSaveSettings(visibility, val, showSkills);
                }}
                className="rounded border-hairline accent-accent"
              />
              <span>Display saved target organizations</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={showSkills}
                onChange={(e) => {
                  const val = e.target.checked;
                  setShowSkills(val);
                  handleSaveSettings(visibility, showTargetOrgs, val);
                }}
                className="rounded border-hairline accent-accent"
              />
              <span>Display technical skill stack</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-raised border border-hairline text-xs font-bold text-primary hover:bg-surface transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
