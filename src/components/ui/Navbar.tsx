'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
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
  { href: '/matcher', label: 'Orbit AI' },
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

  // Auto-close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-2 left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none flex justify-center">
      <div className={`w-full max-w-[1380px] bg-surface/80 backdrop-blur-md border border-hairline rounded-full px-4.5 sm:px-6 py-0.5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all pointer-events-auto relative z-50 ${isScrolled ? 'border-hairline/90 shadow-[0_12px_40px_rgba(0,0,0,0.05)]' : ''}`}>
        
        {/* Logo with Branch Monogram (Left) */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 mr-4 group">
            <Logo className="w-[63px] h-[63px] transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-xl text-primary font-sans tracking-tight group-hover:text-accent transition-colors">
              Contri<span className="text-accent">bo</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation Links (Center) */}
        <nav className="hidden xl:flex items-center justify-center flex-1 gap-6 text-[15px]">
          {LINKS.map(link => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`relative py-1.5 transition-all duration-200 hover:text-accent ${isActive ? 'text-accent font-medium after:absolute after:-bottom-2.5 after:left-1.5 after:right-1.5 after:h-0.5 after:bg-accent after:rounded-full' : 'text-secondary hover:text-primary font-normal'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Right Controls (Theme Toggle & AuthButton) */}
        <div className="hidden xl:flex items-center gap-3.5 flex-shrink-0">
          {/* Professional Segmented Theme Toggle */}
          {mounted ? (
            <div 
              role="radiogroup" 
              aria-label="Theme switcher"
              className="flex items-center p-1 rounded-full border border-hairline/80 bg-surface-raised/70 shadow-2xs backdrop-blur-xs gap-0.5"
            >
              <button
                onClick={() => setTheme('light')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  !isDark
                    ? 'bg-surface text-amber-500 shadow-xs border border-hairline/70 scale-105'
                    : 'text-muted hover:text-primary hover:scale-105'
                }`}
                aria-label="Switch to light mode"
                title="Light mode"
              >
                <Sun size={16} className="transition-transform duration-200" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isDark
                    ? 'bg-surface text-sky-400 shadow-xs border border-hairline/70 scale-105'
                    : 'text-muted hover:text-primary hover:scale-105'
                }`}
                aria-label="Switch to dark mode"
                title="Dark mode"
              >
                <Moon size={15} className="transition-transform duration-200" />
              </button>
            </div>
          ) : (
            <div className="w-[76px] h-9 rounded-full border border-hairline/50 bg-surface-raised/40 animate-pulse" />
          )}
          
          {authButton && <div className="ml-1 pl-3.5 border-l border-hairline">{authButton}</div>}
        </div>

        {/* Global search command palette */}
        <CommandPalette hideTrigger={true} />
        
        {/* Mobile menu button & Controls */}
        <div className="flex xl:hidden items-center gap-2 flex-shrink-0">
          {mounted ? (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-11 h-11 flex items-center justify-center border border-hairline rounded-full bg-surface/70 hover:bg-surface-raised transition-all duration-200 cursor-pointer shadow-2xs text-secondary hover:text-primary active:scale-95"
              aria-label="Toggle theme"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun size={19} className="text-amber-400 transition-transform duration-300" />
              ) : (
                <Moon size={18} className="text-secondary transition-transform duration-300" />
              )}
            </button>
          ) : (
            <div className="w-11 h-11 rounded-full border border-hairline bg-surface-raised/40 animate-pulse" />
          )}
          
          {authButton && <div>{authButton}</div>}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-raised/50 border border-hairline rounded-full transition-all focus:outline-none cursor-pointer shadow-2xs active:scale-95"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay to dismiss on tap */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="xl:hidden fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-xs z-40 pointer-events-auto"
        />
      )}

      {/* Mobile & Tablet Dropdown Card */}
      {isOpen && (
        <div className="xl:hidden fixed top-[72px] left-4 right-4 z-50 pointer-events-auto border border-hairline bg-surface/98 dark:bg-[#18110D]/98 backdrop-blur-xl rounded-2xl shadow-2xl p-2.5 animate-[fade_0.2s_ease-out_forwards]">
          <div className="flex flex-col gap-1">
            {LINKS.map(link => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all pointer-events-auto cursor-pointer ${
                    isActive 
                      ? 'text-accent bg-accent/10 font-bold border border-accent/20' 
                      : 'text-primary hover:bg-surface-raised active:bg-surface-raised'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
