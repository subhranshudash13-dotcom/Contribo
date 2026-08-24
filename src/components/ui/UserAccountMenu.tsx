'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { LayoutGrid, Settings, LogOut } from 'lucide-react';

interface UserAccountMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserAccountMenu({ user }: UserAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayName = user.name || user.email?.split('@')[0] || 'Contributor';
  const displayEmail = user.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-accent/40 transition-all focus:outline-none cursor-pointer"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={34}
            height={34}
            className="w-[34px] h-[34px] rounded-full border border-hairline object-cover"
            unoptimized
          />
        ) : (
          <div className="w-[34px] h-[34px] rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center font-bold text-xs text-accent shadow-2xs">
            {initials}
          </div>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-60 sm:w-64 bg-surface/95 dark:bg-[#120D0A]/95 backdrop-blur-xl border border-hairline rounded-2xl shadow-2xl p-2 z-50 animate-[fade_0.15s_ease-out_forwards]">
          {/* Header Profile Section */}
          <div className="px-3 py-2.5">
            <h4 className="font-heading font-bold text-base text-primary truncate leading-snug">
              {displayName}
            </h4>
            {displayEmail && (
              <p className="text-xs text-secondary/80 truncate mt-0.5 font-normal">
                {displayEmail}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-hairline/80 my-1.5" />

          {/* Menu Items */}
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-surface-raised transition-colors group"
            >
              <LayoutGrid size={17} className="text-secondary group-hover:text-primary transition-colors shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-surface-raised transition-colors group"
            >
              <Settings size={17} className="text-secondary group-hover:text-primary transition-colors shrink-0" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-hairline/80 my-1.5" />

          {/* Sign Out Action */}
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: '/' });
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer group"
          >
            <LogOut size={16} className="text-rose-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
