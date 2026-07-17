import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Accessibility, Calendar, FileText } from 'lucide-react';

export const metadata = {
  title: 'Accessibility Statement | Contribo',
  description: 'Understand Contribo’s commitment to web accessibility and compliance with WCAG 2.2 AA expectations.',
};

export default function AccessibilityPage() {
  const sections = [
    { id: 'approach', title: 'Our approach' },
    { id: 'status', title: 'Current status' },
    { id: 'issues', title: 'Known issues' },
    { id: 'contact', title: 'How to contact us' },
    { id: 'updates', title: 'Accessibility updates' },
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
            <Accessibility size={28} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary font-sans">
            Accessibility Statement
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
              Contribo is committed to building an accessible, keyboard-friendly platform that supports contributors with different abilities and browsing needs. Our goal is to meet WCAG 2.2 AA expectations and to improve accessibility as we add new features.
            </p>
          </section>

          <section id="approach" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Our approach
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We design Contribo with accessibility in mind from the start. That includes keyboard navigation, clear focus states, semantic page structure, readable typography, sufficient color contrast, and support for screen readers where possible. We also aim to make new content, guides, dashboards, and workflows accessible before release.
            </p>
          </section>

          <section id="status" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Current status
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              Contribo is intended to be fully or largely compliant with accessibility standards, but some parts of the site may still be improved over time as the platform grows. If any page, component, or workflow is not accessible, we will work to identify the issue, fix it within reason, or provide an alternative way to access the information.
            </p>
          </section>

          <section id="issues" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Known issues
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              At this time, some interactive or newly released features may need additional accessibility review, especially complex UI such as command palettes, dashboards, charts, and AI-driven interfaces. We continuously test these areas and prioritize fixes based on user impact. If you encounter a problem, please report it so we can investigate and improve it.
            </p>
          </section>

          <section id="contact" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              How to contact us
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              If you experience difficulty using Contribo, contact the site administrator or project maintainer through the website’s contact channel. Please include the page name, the issue you encountered, and the browser or assistive technology you were using so we can reproduce and fix the problem more quickly.
            </p>
          </section>

          <section id="updates" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Accessibility updates
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We review accessibility as part of ongoing development and expect to update this statement when major changes are made or at least once a year. We also aim to ensure that new features, content, and guides are accessible by default.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
