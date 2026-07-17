'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CommandPalette } from './CommandPalette';
import { Logo } from './Logo';

const LINKS = [
  { href: '/programs', label: 'Programs' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/projects', label: 'Projects' },
  { href: '/roadmaps', label: 'Roadmaps' },
  { href: '/resources', label: 'Resources' },
  { href: '/matcher', label: 'Orbit AI' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar({ authButton }: { authButton?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-2 left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none flex justify-center">
      <div className={`w-full max-w-[1380px] bg-surface/80 backdrop-blur-md border border-hairline rounded-full px-4.5 sm:px-6 py-0.5 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all pointer-events-auto relative ${isScrolled ? 'border-hairline/90 shadow-[0_12px_40px_rgba(0,0,0,0.05)]' : ''}`}>
        
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
        <div className="hidden xl:flex items-center gap-4 flex-shrink-0">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 border border-hairline rounded-full font-mono text-[10px] uppercase text-muted hover:text-primary hover:bg-surface-raised/40 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          )}
          
          {authButton && <div className="ml-2 pl-4 border-l border-hairline">{authButton}</div>}
        </div>

        {/* Global search command palette */}
        <CommandPalette hideTrigger={true} />
        
        {/* Mobile menu button & Controls */}
        <div className="flex xl:hidden items-center gap-2.5 flex-shrink-0">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-11 h-11 flex items-center justify-center border border-hairline rounded-full font-mono text-xs uppercase text-muted hover:text-primary hover:bg-surface-raised/50 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'L' : 'D'}
            </button>
          )}
          {authButton && <div>{authButton}</div>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-11 h-11 flex items-center justify-center text-muted hover:text-primary hover:bg-surface-raised/50 border border-hairline rounded-full transition-all focus:outline-none cursor-pointer shadow-sm"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Card */}
      {isOpen && (
        <div className="xl:hidden fixed top-[72px] left-4 right-4 z-50 border border-hairline bg-surface/95 backdrop-blur-md rounded-2xl shadow-lg p-2 animate-[fade_0.2s_ease-out_forwards]">
          <div className="flex flex-col gap-1">
            {LINKS.map(link => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive ? 'text-accent bg-accent/5 font-bold' : 'text-primary hover:bg-surface-raised'}`}
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
