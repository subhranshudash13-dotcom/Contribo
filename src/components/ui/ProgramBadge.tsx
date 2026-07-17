import React from 'react';

interface ProgramBadgeProps {
  name: string;
  accentColor?: string;
}

export function ProgramBadge({ name, accentColor }: ProgramBadgeProps) {
  return (
    <div 
      className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-mono uppercase tracking-wider"
      style={{
        backgroundColor: accentColor ? `color-mix(in srgb, ${accentColor} 15%, transparent)` : 'var(--color-program-accent-transparent)',
        color: accentColor || 'var(--color-program-accent)',
        border: `1px solid ${accentColor ? `color-mix(in srgb, ${accentColor} 30%, transparent)` : 'transparent'}`
      }}
    >
      {name}
    </div>
  );
}
