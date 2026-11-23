'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileText,
  X,
} from 'lucide-react';

interface ChangelogExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelogMarkdown: string;
  versionA: string;
  versionB: string;
}

export function ChangelogExportModal({
  isOpen,
  onClose,
  changelogMarkdown,
  versionA,
  versionB,
}: ChangelogExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(changelogMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = changelogMarkdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([changelogMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal-changelog-${versionA.replace(/\s+/g, '_')}-to-${versionB.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-hairline bg-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-hairline bg-surface-raised/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="changelog-modal-title" className="font-heading text-lg font-bold text-primary">
                Export Revision Changelog
              </h3>
              <p className="text-xs font-mono text-muted">
                Structured Markdown changelog ready for mentor updates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-hairline bg-page text-muted hover:text-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Markdown Textarea */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="relative">
            <textarea
              readOnly
              value={changelogMarkdown}
              className="w-full h-80 rounded-2xl border border-hairline bg-page p-4 font-mono text-xs text-primary leading-relaxed focus:outline-none resize-none selection:bg-accent/30"
            />
          </div>
          <p className="text-xs font-mono text-muted">
            Tip: You can paste this changelog into Google Summer of Code, LFX, or GitHub pull request reviews to give mentors an instant executive summary of your changes.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-hairline bg-surface-raised/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-hairline bg-page font-mono text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-hairline bg-page font-mono text-xs text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent font-mono text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
