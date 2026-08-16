'use client';

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ScoreRing({
  score,
  size = 120,
  stroke = 8,
  label = 'Readiness',
}: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const tone =
    clamped >= 80
      ? 'text-success'
      : clamped >= 55
        ? 'text-accent'
        : 'text-warning';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label} score ${clamped} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-hairline"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${tone} transition-[stroke-dashoffset] duration-500 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading font-extrabold tabular-nums text-primary ${size >= 110 ? 'text-3xl' : 'text-xl'}`}>
          {clamped}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
          {label}
        </span>
      </div>
    </div>
  );
}
