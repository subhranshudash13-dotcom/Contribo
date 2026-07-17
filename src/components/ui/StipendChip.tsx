import React from 'react';
import { Banknote } from 'lucide-react';

export function StipendChip({ amount }: { amount: string }) {
  if (!amount) return null;
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-raised text-brass rounded-sm text-xs font-mono font-medium border border-hairline">
      <Banknote size={14} className="shrink-0" />
      <span>{amount}</span>
    </div>
  );
}
