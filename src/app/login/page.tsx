'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { registerUser } from '@/app/actions/register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && !agree) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('name', name);
        
        const result = await registerUser(formData);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        // Extract and clarify NextAuth credential errors
        if (res.error.includes('No user found')) {
          setError('No account found with this email. Switch to Sign Up to create one.');
        } else if (res.error.includes('Invalid password')) {
          setError('Incorrect password. Please try again.');
        } else {
          setError('Authentication failed. Please check your credentials.');
        }
      } else {
        // Successful login, redirect to dashboard using hard navigation to guarantee cookies are set
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login error: [REDACTED]');
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setError(null);
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err) {
      console.error('Social login error: [REDACTED]');
      setError('Failed to initialize social login.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-base">

      {/* Left Column: Visual Showcase (Tech grid + Mockup + Brand Message) */}
      <div className="hidden lg:flex lg:col-span-6 bg-surface-raised border-r border-hairline relative flex-col justify-between p-12 overflow-hidden">
        {/* Extended Tech Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--hairline)_1px,transparent_1px),linear-gradient(to_top,var(--hairline)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_70%,transparent_100%)] z-0" />
        
        {/* Subtle Radial Glow */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Branding header block */}
        <div className="relative z-10 flex items-center gap-2.5">
          <Logo className="w-9 h-9" />
          <span className="font-bold text-xl text-primary tracking-tight font-sans">
            Contri<span className="text-accent">bo</span>
          </span>
        </div>

        {/* Laptop Mockup Visual */}
        <div className="relative z-10 flex items-center justify-center my-auto translate-y-6">
          <img 
            src="/workspace_hero.png" 
            alt="Developer Workspace" 
            className="w-full max-w-[580px] h-auto object-contain filter drop-shadow-[0_24px_50px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_24px_50px_rgba(0,0,0,0.3)] select-none pointer-events-none"
          />
        </div>

        {/* Brand visual text footer */}
        <div className="relative z-10 space-y-3 max-w-md">
          <h2 className="text-2xl font-bold text-primary tracking-tight leading-tight">
            Find your match in open source.
          </h2>
          <p className="text-secondary text-sm leading-relaxed">
            Track stipends, explore structures, and access detailed contribution pathways for GSoC, Outreachy, LFX, and more.
          </p>
        </div>
      </div>

      {/* Right Column: Sign-in Card Center */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Back to Home floating action - now relative to Right Column */}
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

        <div className="w-full max-w-[400px] space-y-8 py-12 lg:py-6 animate-[fade_0.3s_ease-out_forwards]">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-secondary text-sm leading-relaxed max-w-xs mx-auto">
              {mode === 'login' 
                ? 'Log in to access your matches and saved roadmaps.' 
                : 'Join Contribo to find open-source programs and track contributions.'}
            </p>
          </div>

          <div className="flex bg-surface-raised border border-hairline p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setAgree(false); }}
              className={`flex-1 py-2 text-xs font-semibold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-surface text-accent shadow-sm border border-hairline' : 'text-muted hover:text-primary'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setAgree(false); }}
              className={`flex-1 py-2 text-xs font-semibold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-surface text-accent shadow-sm border border-hairline' : 'text-muted hover:text-primary'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex gap-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 text-xs font-medium animate-[fade_0.2s_ease-out_forwards]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold font-mono uppercase tracking-wider text-secondary" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Alex Dev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-surface border border-hairline rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold font-mono uppercase tracking-wider text-secondary" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 bg-surface border border-hairline rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold font-mono uppercase tracking-wider text-secondary" htmlFor="password">
                  Password
                </label>
                {mode === 'login' && (
                  <Link href="#" className="text-[10px] font-semibold font-mono uppercase tracking-wider text-accent hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <input
                id="password"
                type="password"
                required
                maxLength={72}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 bg-surface border border-hairline rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {mode === 'signup' && (
              <div className="flex items-start gap-2.5 pt-1 pb-2 animate-[fade_0.2s_ease-out_forwards]">
                <input
                  id="agree"
                  type="checkbox"
                  required
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-hairline bg-surface text-accent focus:ring-accent accent-accent cursor-pointer"
                />
                <label htmlFor="agree" className="text-xs text-secondary leading-normal select-none cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-accent hover:underline font-medium">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" className="text-accent hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center bg-accent text-white hover:bg-accent/90 disabled:bg-accent/50 font-semibold text-sm rounded-xl transition-all shadow-md shadow-accent/15 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : mode === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-hairline"></div>
            <span className="flex-shrink mx-4 text-[10px] font-semibold font-mono uppercase tracking-widest text-muted">or</span>
            <div className="flex-grow border-t border-hairline"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading}
              className="h-11 flex items-center justify-center gap-2.5 bg-surface hover:bg-surface-raised border border-hairline hover:border-primary/20 text-primary font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="h-11 flex items-center justify-center gap-2.5 bg-surface hover:bg-surface-raised border border-hairline hover:border-primary/20 text-primary font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>

          <p className="text-[11px] text-muted leading-relaxed font-sans text-center">
            By logging in or signing up, you agree to our{' '}
            <Link href="/terms" className="text-accent hover:underline font-medium">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-accent hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

    </main>
  );
}
