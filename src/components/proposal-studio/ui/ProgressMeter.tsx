'use client';

interface ProgressMeterProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export function ProgressMeter({
  value,
  label,
  size = 'md',
  showValue = true,
}: ProgressMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const barH = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue && (
            <span className="text-xs font-mono font-bold tabular-nums text-accent">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${barH} rounded-full bg-surface-raised border border-hairline overflow-hidden`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
