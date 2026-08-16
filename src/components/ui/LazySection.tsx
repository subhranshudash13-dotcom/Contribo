'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';

type LazySectionProps = {
  children: ReactNode;
  /** Shown until the section nears the viewport */
  fallback?: ReactNode;
  /** IntersectionObserver rootMargin — load slightly before visible */
  rootMargin?: string;
  /** Reserve space to avoid layout shift while deferred */
  minHeight?: string | number;
  className?: string;
  /** Optional id for a11y / deep links */
  id?: string;
};

/**
 * Defers mounting (and therefore hydration + dynamic imports) of children
 * until the block is near the viewport. Cuts main-thread work on first paint.
 */
export function LazySection({
  children,
  fallback = null,
  rootMargin = '320px 0px',
  minHeight,
  className = '',
  id,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return true;
    }
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    return Boolean(conn?.saveData);
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || ready) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={
        !ready && minHeight != null
          ? { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }
          : undefined
      }
    >
      {ready ? children : fallback}
    </div>
  );
}
