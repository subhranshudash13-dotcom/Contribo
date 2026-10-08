'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const isFirstRender = useRef(true);

  // When pathname or searchParams change, mark navigation as complete
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const completeTimer = setTimeout(() => {
      setProgress(100);
    }, 0);

    const resetTimer = setTimeout(() => {
      setProgress(0);
    }, 300);

    return () => {
      clearTimeout(completeTimer);
      clearTimeout(resetTimer);
    };
  }, [pathname, searchParams]);

  // Intercept standard link clicks
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');

      if (
        !anchor ||
        anchor.target === '_blank' ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.defaultPrevented
      ) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Check if same URL
      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
        ) {
          setProgress(25);
          setTimeout(() => setProgress((prev) => (prev > 0 ? Math.min(prev + 40, 85) : 0)), 150);
        }
      } catch {
        // invalid URL ignore
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => document.removeEventListener('click', handleAnchorClick, { capture: true });
  }, []);

  if (progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-accent via-[#FF8A50] to-accent transition-all duration-300 ease-out shadow-[0_0_12px_rgba(230,92,40,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'width 150ms ease-out, opacity 250ms ease-in 100ms' : 'width 350ms cubic-bezier(0.1, 0.9, 0.2, 1)',
        }}
      />
    </div>
  );
}
