import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie, Calendar, FileText } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy | Contribo',
  description: 'Understand how Contribo uses cookies to handle user sessions and preferences.',
};

export default function CookiePolicyPage() {
  const sections = [
    { id: 'definition', title: 'What cookies are' },
    { id: 'usage', title: 'How we use cookies' },
    { id: 'types', title: 'Types of cookies' },
    { id: 'management', title: 'Managing cookies' },
    { id: 'updates', title: 'Updates to this policy' },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 bg-base">
      
      {/* Breadcrumb / Back Button */}
      <div className="mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold font-mono uppercase tracking-wider text-primary hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-all"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* Header Section */}
      <div className="border-b border-hairline pb-10 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent">
            <Cookie size={28} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary font-sans">
            Cookie Policy
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-primary">
          <span className="flex items-center gap-2 bg-surface border border-hairline px-3 py-1.5 rounded-lg shadow-sm">
            <Calendar size={14} className="text-accent" /> Last Updated: July 12, 2026
          </span>
          <span className="flex items-center gap-2 bg-surface border border-hairline px-3 py-1.5 rounded-lg shadow-sm">
            <FileText size={14} className="text-accent" /> Version: 1.0
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-surface border border-hairline rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary font-mono border-b border-hairline pb-3">
              Table of Contents
            </h2>
            <nav className="space-y-2">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-2.5 px-3.5 text-sm text-primary hover:text-accent hover:bg-surface-raised rounded-xl transition-all font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-accent font-medium"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Legal Text Body */}
        <main className="lg:col-span-8 space-y-16 text-primary font-sans max-w-none">
          
          <section className="scroll-mt-24 space-y-6">
            <p className="text-lg sm:text-xl font-medium border-l-2 border-accent pl-6 text-primary leading-relaxed tracking-wide">
              Contribo uses cookies and similar technologies to support essential features, improve performance, and understand how the platform is used. This page explains what cookies are, how we use them, and how you can manage them.
            </p>
          </section>

          <section id="definition" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              What cookies are
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, such as sign-in status, preferences, and session activity.
            </p>
          </section>

          <section id="usage" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              How we use cookies
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We may use cookies for authentication, session management, security, remembering preferences, and measuring site usage. We may also use analytics tools to understand which pages are used most often and where the experience can be improved. If we use embedded or third-party services, those providers may set their own cookies according to their policies.
            </p>
          </section>

          <section id="types" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Types of cookies
            </h2>
            <div className="space-y-4">
              <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">We categorize the cookies we use as follows:</p>
              <ul className="list-disc list-inside pl-2 space-y-3 text-base sm:text-lg leading-relaxed text-primary tracking-wide">
                <li className="text-primary">
                  <strong className="text-primary">Essential cookies:</strong> Required for core functionality such as login and secure session handling.
                </li>
                <li className="text-primary">
                  <strong className="text-primary">Preference cookies:</strong> Help remember settings such as theme or interface preferences.
                </li>
                <li className="text-primary">
                  <strong className="text-primary">Analytics cookies:</strong> Help us understand site usage and improve the product.
                </li>
                <li className="text-primary">
                  <strong className="text-primary">Security cookies:</strong> Help detect fraud, abuse, or unauthorized activity.
                </li>
              </ul>
            </div>
          </section>

          <section id="management" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Managing cookies
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              You can control or delete cookies through your browser settings. You may also set your browser to block certain cookies, but doing so may affect sign-in, saved progress, or other features. Where required, we will ask for consent before using non-essential cookies.
            </p>
          </section>

          <section id="updates" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Updates to this policy
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We may update this Cookie Policy as our platform or legal requirements change. The updated version will always be posted on this page with a revised date.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
