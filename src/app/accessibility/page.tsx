import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Accessibility Statement | Contribo',
  description: 'Understand Contribo’s commitment to web accessibility and compliance with WCAG 2.2 AA expectations.',
};

export default function AccessibilityPage() {
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
          Accessibility Statement
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
              Contribo is committed to building an accessible, keyboard-friendly platform that supports contributors with different abilities and browsing needs. Our goal is to meet WCAG 2.2 AA expectations and to improve accessibility as we add new features.
            </p>
          </section>

          <section id="approach" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Our approach
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We design Contribo with accessibility in mind from the start. That includes keyboard navigation, clear focus states, semantic page structure, readable typography, sufficient color contrast, and support for screen readers where possible. We also aim to make new content, guides, dashboards, and workflows accessible before release.
            </p>
          </section>

          <section id="status" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Current status
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              Contribo is intended to be fully or largely compliant with accessibility standards, but some parts of the site may still be improved over time as the platform grows. If any page, component, or workflow is not accessible, we will work to identify the issue, fix it within reason, or provide an alternative way to access the information.
            </p>
          </section>

          <section id="issues" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Known issues
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              At this time, some interactive or newly released features may need additional accessibility review, especially complex UI such as command palettes, dashboards, charts, and AI-driven interfaces. We continuously test these areas and prioritize fixes based on user impact. If you encounter a problem, please report it so we can investigate and improve it.
            </p>
          </section>

          <section id="contact" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              How to contact us
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              If you experience difficulty using Contribo, contact the site administrator or project maintainer through the website’s contact channel. Please include the page name, the issue you encountered, and the browser or assistive technology you were using so we can reproduce and fix the problem more quickly.
            </p>
          </section>

          <section id="updates" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Accessibility updates
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We review accessibility as part of ongoing development and expect to update this statement when major changes are made or at least once a year. We also aim to ensure that new features, content, and guides are accessible by default.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
