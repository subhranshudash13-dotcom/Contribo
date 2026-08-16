'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { HeroBackground } from './HeroBackground';
import { HeroContent } from './HeroContent';
import './hero.css';

// Decorative marquee is non-critical for LCP — load after main hero text paints
const HeroLogoMarquee = dynamic(
  () =>
    import('./HeroLogoMarquee').then((m) => ({ default: m.HeroLogoMarquee })),
  {
    ssr: false,
    loading: () => (
      <div
        className="lg:col-span-5 relative h-[402px] lg:h-[502px] w-full hidden lg:block mt-[57px] sm:mt-[89px]"
        aria-hidden
      />
    ),
  }
);

export function Hero() {
  return (
    <section className="hero overflow-hidden relative">
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:pl-[52px] xl:pr-8 h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 lg:pt-0">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <HeroContent />
        </div>
        <HeroLogoMarquee />
      </div>
      <HeroBackground />
    </section>
  );
}
