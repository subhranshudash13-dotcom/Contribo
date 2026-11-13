import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { getConfiguredOAuthProviders } from '@/lib/auth-providers';
import { LoginFormContent } from './LoginForm';

export default function LoginPage() {
  // Server-side only: these env vars are not NEXT_PUBLIC_.
  const enabledProviders = getConfiguredOAuthProviders();

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-page">
      {/* Left Column: Visual Showcase (Tech grid + Mockup + Brand Message) */}
      <div className="hidden lg:flex lg:col-span-6 bg-surface-raised border-r border-hairline relative flex-col justify-between p-12 overflow-hidden">
        {/* Extended Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--hairline)_1px,transparent_1px),linear-gradient(to_top,var(--hairline)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_70%,transparent_100%)] z-0" />

        {/* Subtle Radial Glow */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Laptop Mockup Visual */}
        <div className="relative z-10 flex items-center justify-center my-auto translate-y-6">
          <Image
            src="/workspace_hero.png"
            alt="Developer Workspace"
            width={580}
            height={360}
            priority
            className="w-full max-w-[580px] h-auto object-contain filter drop-shadow-[0_24px_50px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_24px_50px_rgba(0,0,0,0.3)] select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Right Column: Sign-in Card Center */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Back to Home floating action */}
        <div className="absolute top-6 left-6 z-50">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-surface/85 backdrop-blur border border-hairline hover:border-accent/40 rounded-full text-xs font-mono font-bold text-primary hover:text-accent shadow-sm transition-all hover:-translate-x-0.5 cursor-pointer pointer-events-auto"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        {/* Mobile top header branding */}
        <div className="lg:hidden absolute top-6 right-6 flex items-center gap-2.5">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-lg text-primary tracking-tight font-sans">
            Contri<span className="text-accent">bo</span>
          </span>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center space-y-3 py-16">
            <Loader2 size={24} className="animate-spin text-accent" />
            <p className="text-xs text-secondary font-mono">Loading sign in...</p>
          </div>
        }>
          <LoginFormContent enabledProviders={enabledProviders} />
        </Suspense>
      </div>
    </main>
  );
}
