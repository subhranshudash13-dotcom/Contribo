'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';

export function StudioToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-2xl border border-hairline bg-surface px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-start gap-3"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <Sparkles size={15} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium text-primary leading-snug">{message}</p>
        <p className="mt-0.5 text-[11px] font-mono text-muted flex items-center gap-1">
          <CheckCircle2 size={11} /> Proposal Studio
        </p>
      </div>
    </div>
  );
}
