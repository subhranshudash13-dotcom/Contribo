import React from 'react';
import { Check } from 'lucide-react';

export function EligibilityTag({ text }: { text: string }) {
  if (!text) return null;
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised text-primary rounded-sm border border-hairline">
      <Check size={14} className="text-merge shrink-0" />
      <span className="font-mono uppercase text-xs tracking-wide">{text}</span>
    </div>
  );
}
