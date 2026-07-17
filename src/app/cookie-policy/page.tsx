import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy | Contribo',
  description: 'Understand how Contribo uses cookies to handle user sessions and preferences.',
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 md:pt-10 md:pb-20 bg-base mt-12">
      
      {/* Breadcrumb / Back Button */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-semibold font-mono uppercase tracking-wider text-muted hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-all"
          style={{ fontSize: '17px' }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      {/* Header Section */}
      <div className="pb-6 mb-8">
        <h1 className="font-bold tracking-tight font-sans mb-2" style={{ fontSize: '46px', color: 'var(--accent)' }}>
          Cookie Policy
        </h1>
        <p className="font-mono text-muted" style={{ fontSize: '20px' }}>
          Last updated: July 12, 2026
        </p>
      </div>

      {/* Content Card Wrapper */}
      <div className="bg-surface border border-hairline rounded-2xl p-6 sm:p-10 shadow-sm text-left w-full">
        <main className="space-y-10 font-sans w-full">
          
          <section className="space-y-4">
            <p className="leading-relaxed tracking-wide border-l-2 border-accent pl-4" style={{ fontSize: '19px', color: 'var(--primary)' }}>
              Contribo uses cookies and similar technologies to support essential features, improve performance, and understand how the platform is used. This page explains what cookies are, how we use them, and how you can manage them.
            </p>
          </section>

          <section id="definition" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              What cookies are
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, such as sign-in status, preferences, and session activity.
            </p>
          </section>

          <section id="usage" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              How we use cookies
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We may use cookies for authentication, session management, security, remembering preferences, and measuring site usage. We may also use analytics tools to understand which pages are used most often and where the experience can be improved. If we use embedded or third-party services, those providers may set their own cookies according to their policies.
            </p>
          </section>

          <section id="types" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Types of cookies
            </h2>
            <div className="space-y-3">
              <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
                We categorize the cookies we use as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed tracking-wide pl-2 text-primary" style={{ fontSize: '17px', color: 'var(--primary)' }}>
                <li>
                  <strong style={{ color: 'var(--primary)' }}>Essential cookies:</strong> Required for core functionality such as login and secure session handling.
                </li>
                <li>
                  <strong style={{ color: 'var(--primary)' }}>Preference cookies:</strong> Help remember settings such as theme or interface preferences.
                </li>
                <li>
                  <strong style={{ color: 'var(--primary)' }}>Analytics cookies:</strong> Help us understand site usage and improve the product.
                </li>
                <li>
                  <strong style={{ color: 'var(--primary)' }}>Security cookies:</strong> Help detect fraud, abuse, or unauthorized activity.
                </li>
              </ul>
            </div>
          </section>

          <section id="management" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Managing cookies
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              You can control or delete cookies through your browser settings. You may also set your browser to block certain cookies, but doing so may affect sign-in, saved progress, or other features. Where required, we will ask for consent before using non-essential cookies.
            </p>
          </section>

          <section id="updates" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Updates to this policy
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We may update this Cookie Policy as our platform or legal requirements change. The updated version will always be posted on this page with a revised date.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
