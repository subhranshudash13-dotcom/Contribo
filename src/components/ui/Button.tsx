'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  href?: string;
  analyticsId?: string;
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  href,
  analyticsId,
  children,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:brightness-[0.96] hover:shadow-sm';
  
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white border border-transparent',
    secondary: 'bg-surface hover:bg-surface-raised text-primary border border-hairline',
    outline: 'bg-transparent text-primary border border-hairline hover:bg-surface-raised',
    ghost: 'bg-transparent text-muted hover:text-primary hover:bg-surface-raised border border-transparent shadow-none hover:shadow-none',
  };

  const sizes = {
    sm: 'h-8 px-4 text-sm',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (analyticsId) {
      console.log(`[Analytics] Tracked click: ${analyticsId}`);
    }
    onClick?.(e);
  };

  const content = (
    <>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={handleClick as any}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      className={classes} 
      disabled={isLoading || disabled} 
      onClick={handleClick}
      data-analytics-id={analyticsId}
      {...props}
    >
      {content}
    </button>
  );
}
