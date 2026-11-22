'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Eye, Sliders, Printer, Check, Copy } from 'lucide-react';
import { ResumeData } from '@/lib/resume/types';
import { ResumeCustomizerPanel } from '@/components/resume/ResumeCustomizerPanel';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { resumeToMarkdown } from '@/lib/resume/synthesizer';

interface ResumeClientProps {
  initialData: ResumeData;
}

export function ResumeClient({ initialData }: ResumeClientProps) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const md = resumeToMarkdown(data);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 sm:px-6 shadow-xs no-print">
        <div className="flex items-center gap-3">
          <Link
            href={`/passport/${data.basics.username}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Passport</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-bold text-slate-900">
              Verifiable Resume Builder
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Google XYZ Standard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Mobile view toggle */}
          <div className="flex lg:hidden rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setMobileView('editor')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                mobileView === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                mobileView === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Side-by-Side (Desktop) or View Toggled (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customizer & Bullet Polisher */}
        <div
          className={`lg:col-span-5 space-y-4 no-print ${
            mobileView === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <ResumeCustomizerPanel data={data} onChange={setData} />
        </div>

        {/* Right Column: Live Document Preview */}
        <div
          className={`lg:col-span-7 ${
            mobileView === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          <ResumeDocument data={data} />
        </div>
      </div>
    </div>
  );
}
