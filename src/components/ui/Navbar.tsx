'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Logo } from './Logo';

// Command palette is keyboard-driven and heavy — load after shell paints
const CommandPalette = dynamic(
  () => import('./CommandPalette').then((m) => ({ default: m.CommandPalette })),
  { ssr: false }
);

const LINKS = [
  { href: '/programs', label: 'Programs' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/projects', label: 'Projects' },
  { href: '/proposal-studio', label: 'Proposal Studio' },
  { href: '/resources', label: 'Resources' },
  { href: '/matcher', label: 'Orbit AI', isAi: true },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar({ authButton }: { authButton?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isDark = (resolvedTheme || theme) === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu when navigation changes.
  const [previousPathname, setPreviousPathname] = useState(pathname);

  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setIsOpen(false);
  }

  return (
    <header className="print:hidden fixed left-0 right-0 top-2.5 z-50 flex justify-center px-2.5 pointer-events-none sm:top-3 sm:px-4 lg:px-6">
      <div
        className={`relative z-50 flex w-full max-w-[1400px] items-center justify-between gap-2 rounded-full border border-hairline bg-surface/85 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all pointer-events-auto dark:bg-[#18110D]/85 dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] sm:px-5 sm:py-1.5 lg:px-5 ${
          isScrolled
            ? 'border-hairline shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
            : ''
        }`}
      >
        {/* Logo */}
        <div className="flex min-w-0 flex-shrink-0 items-center">
          <Link
            href="/"
            className="group mr-1.5 flex min-w-0 items-center gap-2 sm:mr-2 lg:mr-3 xl:mr-5"
          >
            <Logo className="h-10 w-10 shrink-0 transition-transform group-hover:scale-105" />

            <span className="truncate font-sans text-lg font-extrabold tracking-tight text-primary transition-colors group-hover:text-accent sm:text-xl">
              Contri<span className="text-accent">bo</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-1 text-[13px] font-medium lg:flex xl:gap-2.5 xl:text-[14px] 2xl:gap-4 2xl:text-[14.5px]">
          {LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname?.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 transition-all duration-150 xl:px-3 ${
                  isActive
                    ? 'border border-accent/25 bg-accent/10 font-semibold text-accent shadow-2xs dark:bg-accent/15'
                    : 'font-medium text-secondary hover:bg-surface-raised/80 hover:text-primary'
                }`}
              >
                {link.isAi && (
                  <Sparkles
                    size={13}
                    className="shrink-0 animate-pulse text-accent"
                  />
                )}

                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Theme and Authentication Controls */}
        <div className="hidden flex-shrink-0 items-center gap-2 lg:flex xl:gap-3">
          {mounted ? (
            <>
              {/* Theme switcher on large screens */}
              <div
                role="group"
                aria-label="Theme switcher"
                className="hidden items-center gap-0.5 rounded-full border border-hairline/80 bg-surface-raised/70 p-1 shadow-2xs backdrop-blur-xs xl:flex"
              >
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
                    !isDark
                      ? 'scale-105 border border-hairline/70 bg-surface text-amber-500 shadow-xs'
                      : 'text-muted hover:scale-105 hover:text-primary'
                  }`}
                  aria-label="Switch to light mode"
                  aria-pressed={!isDark}
                  title="Light mode"
                >
                  <Sun size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ${
                    isDark
                      ? 'scale-105 border border-hairline/70 bg-surface text-sky-400 shadow-xs'
                      : 'text-muted hover:scale-105 hover:text-primary'
                  }`}
                  aria-label="Switch to dark mode"
                  aria-pressed={isDark}
                  title="Dark mode"
                >
                  <Moon size={14} />
                </button>
              </div>

              {/* Single theme toggle on laptop screens */}
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-hairline/80 bg-surface-raised/60 transition-all hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent xl:hidden"
                aria-label="Toggle theme"
                aria-pressed={isDark}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun size={16} className="text-amber-400" />
                ) : (
                  <Moon size={15} className="text-secondary" />
                )}
              </button>
            </>
          ) : (
            <div className="h-9 w-9 animate-pulse rounded-full border border-hairline/50 bg-surface-raised/40" />
          )}

          {authButton && (
            <div className="ml-0.5 border-l border-hairline/80 pl-2.5 xl:pl-3">
              {authButton}
            </div>
          )}
        </div>

        {/* Global Search Command Palette */}
        <CommandPalette hideTrigger={true} />

        {/* Mobile and Tablet Controls */}
        <div className="flex flex-shrink-0 items-center gap-1.5 lg:hidden sm:gap-2">
          {mounted ? (
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-hairline bg-surface/70 shadow-2xs transition-all duration-200 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Toggle theme"
              aria-pressed={isDark}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun size={19} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-secondary" />
              )}
            </button>
          ) : (
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full border border-hairline bg-surface-raised/40" />
          )}

          {authButton && (
            <div className="flex min-h-11 shrink-0 items-center">
              {authButton}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-hairline text-muted transition-all hover:bg-surface-raised/50 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs pointer-events-auto dark:bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="fixed left-2.5 right-2.5 top-[76px] z-50 max-h-[calc(100vh-88px)] overflow-y-auto rounded-2xl border border-hairline bg-surface/98 p-2.5 shadow-2xl backdrop-blur-xl pointer-events-auto dark:bg-[#18110D]/98 sm:left-4 sm:right-4 sm:top-[72px] sm:max-h-[calc(100vh-84px)] lg:hidden"
        >
          <nav
            className="flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname?.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-h-11 cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'border border-accent/20 bg-accent/10 font-bold text-accent'
                      : 'text-primary hover:bg-surface-raised active:bg-surface-raised'
                  }`}
                >
                  <span>{link.label}</span>

                  {link.isAi && (
                    <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                      AI Powered
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
