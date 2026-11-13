'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/app/actions/register';
import type { OAuthProviderId } from '@/lib/auth-providers';

function getInitialAuthError(errorParam: string | null): string | null {
  if (errorParam === 'OAuthAccountNotLinked') {
    return 'An account with this email already exists. Please log in with your email and password.';
  } else if (errorParam === 'CredentialsSignin') {
    return 'Invalid email or password. Please try again.';
  } else if (errorParam === 'AccessDenied') {
    return 'Access was denied. Please try again.';
  } else if (errorParam === 'Configuration') {
    return 'Social sign-in is temporarily unavailable on this deployment. Please use email and password, or contact the administrator.';
  } else if (errorParam) {
    return 'Authentication error occurred. Please try again.';
  }
  return null;
}

interface LoginFormContentProps {
  enabledProviders: OAuthProviderId[];
}

export function LoginFormContent({ enabledProviders }: LoginFormContentProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(() => getInitialAuthError(errorParam));
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }

      if (cleanPassword.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      const hasLetter = /[a-zA-Z]/.test(cleanPassword);
      const hasNumber = /[0-9]/.test(cleanPassword);
      if (!hasLetter || !hasNumber) {
        setError('Password must include both letters and numbers.');
        return;
      }

      if (!agree) {
        setError('Please agree to the Terms & Conditions and Privacy Policy to create an account.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        setSuccess('Creating your Contribo account...');
        const formData = new FormData();
        formData.append('email', cleanEmail);
        formData.append('password', cleanPassword);
        formData.append('name', name.trim());

        const result = await registerUser(formData);
        if (result?.error) {
          setError(result.error);
          setSuccess(null);
          setLoading(false);
          return;
        }

        setSuccess('Account created! Signing you in...');
      } else {
        setSuccess('Verifying credentials...');
      }

      const res = await signIn('credentials', {
        email: cleanEmail,
        password: cleanPassword,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setSuccess(null);
        if (mode === 'login') {
          setError('Invalid email or password. If you don\'t have an account yet, click "Sign Up" above.');
        } else {
          setError('Account was created, but automatic login failed. Please switch to Login to sign in.');
        }
      } else {
        setSuccess('Success! Redirecting to dashboard...');
        window.location.href = callbackUrl;
      }
    } catch {
      setSuccess(null);
      setError('Unable to authenticate right now. Please check your network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError('Failed to initialize social login.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] space-y-7 py-12 lg:py-6 animate-[fade_0.3s_ease-out_forwards]">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-secondary text-sm leading-relaxed max-w-xs mx-auto">
          {mode === 'login'
            ? 'Log in to access your matches, saved roadmaps, and tracker.'
            : 'Join Contribo to discover open-source programs and track applications.'}
        </p>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex bg-surface-raised border border-hairline p-1 rounded-xl">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 py-2 text-xs font-semibold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            mode === 'login'
              ? 'bg-surface text-accent shadow-sm border border-hairline'
              : 'text-muted hover:text-primary'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 py-2 text-xs font-semibold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            mode === 'signup'
              ? 'bg-surface text-accent shadow-sm border border-hairline'
              : 'text-muted hover:text-primary'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="flex gap-2.5 bg-red-500/10 border border-red-500/25 text-red-500 rounded-xl p-3.5 text-xs font-medium animate-[fade_0.2s_ease-out_forwards] leading-relaxed">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Notice */}
      {success && !error && (
        <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl p-3.5 text-xs font-medium animate-[fade_0.2s_ease-out_forwards]">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold font-mono uppercase tracking-wider text-secondary" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Alex Dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 bg-surface border border-hairline rounded-xl text-sm text-primary focus:outline-none focus:border-accent transition-colors"
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
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 bg-surface border border-hairline rounded-xl text-sm text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold font-mono uppercase tracking-wider text-secondary" htmlFor="password">
              Password
            </label>
            {mode === 'login' && (
              <span className="text-[10px] font-mono text-muted">
                case-sensitive
              </span>
            )}
          </div>
          <input
            id="password"
            type="password"
            maxLength={72}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-4 bg-surface border border-hairline rounded-xl text-sm text-primary focus:outline-none focus:border-accent transition-colors"
          />
          {mode === 'signup' && (
            <p className="text-[10px] text-muted font-sans mt-1">
              Must be at least 8 characters with a letter and a number.
            </p>
          )}
        </div>

        {mode === 'signup' && (
          <div className="flex items-start gap-2.5 pt-1 pb-1 animate-[fade_0.2s_ease-out_forwards]">
            <input
              id="agree"
              type="checkbox"
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
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
            </span>
          ) : mode === 'login' ? (
            'Log In'
          ) : (
            'Sign Up'
          )}
        </button>

        {/* Quick helper switcher under form */}
        <div className="text-center pt-1">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-xs text-secondary hover:text-accent transition-colors"
            >
              Don&apos;t have an account? <span className="text-accent font-semibold underline underline-offset-2">Sign up here</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs text-secondary hover:text-accent transition-colors"
            >
              Already have an account? <span className="text-accent font-semibold underline underline-offset-2">Log in here</span>
            </button>
          )}
        </div>
      </form>

      {/* Social Logins — only rendered for providers with configured credentials */}
      {enabledProviders.length > 0 && (
        <>
          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-hairline"></div>
            <span className="flex-shrink mx-4 text-[10px] font-semibold font-mono uppercase tracking-widest text-muted">or continue with</span>
            <div className="flex-grow border-t border-hairline"></div>
          </div>

          <div className={`grid gap-3.5 ${enabledProviders.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {enabledProviders.includes('github') && (
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
            )}

            {enabledProviders.includes('google') && (
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
            )}
          </div>
        </>
      )}

      <p className="text-[11px] text-muted leading-relaxed font-sans text-center">
        By continuing, you agree to our{' '}
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
  );
}
