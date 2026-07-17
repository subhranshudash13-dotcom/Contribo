import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Calendar, FileText } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Contribo',
  description: 'Understand how Contribo collects, uses, and secures your personal and project tracking data.',
};

export default function PrivacyPolicyPage() {
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'collection', title: 'Information we collect' },
    { id: 'use', title: 'How we use information' },
    { id: 'sharing', title: 'Sharing information' },
    { id: 'cookies', title: 'Cookies and similar technologies' },
    { id: 'retention', title: 'Data retention' },
    { id: 'choices', title: 'Your choices' },
    { id: 'changes', title: 'Changes to this policy' },
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
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-accent">
            <Shield size={28} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary font-sans">
            Privacy Policy
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
          
          <section id="overview" className="scroll-mt-24 space-y-6">
            <p className="text-lg sm:text-xl font-medium border-l-2 border-accent pl-6 text-primary leading-relaxed tracking-wide">
              Contribo respects your privacy and is designed to help contributors discover and track opportunities in open-source mentorship programs. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using our website and services.
            </p>
          </section>

          <section id="collection" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Information we collect
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We may collect information you provide directly, such as your name, email address, profile details, saved organizations, proposal drafts, application progress, and preferences. If you sign in with GitHub or Google, we may receive account information from those providers according to the permissions you grant. We may also collect technical information such as browser type, device information, pages visited, and usage data to help improve performance and reliability.
            </p>
          </section>

          <section id="use" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              How we use information
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We use this information to provide and improve Contribo’s features, personalize your dashboard, match you with relevant projects, manage authentication, support saved progress, and maintain security. We may also use data to analyze platform usage, improve search quality, and troubleshoot issues. We do not sell your personal information.
            </p>
          </section>

          <section id="sharing" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Sharing information
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We may share information with trusted service providers that help us operate the platform, such as hosting, authentication, database, analytics, and AI-related services. We may also share information when required by law, to protect our rights, or to prevent abuse or security issues. Any service providers we use are expected to handle data responsibly and only for the purposes we authorize.
            </p>
          </section>

          <section id="cookies" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Cookies and similar technologies
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              Contribo may use cookies or similar technologies to remember sign-in sessions, improve site performance, and understand how the platform is used. You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
            </p>
          </section>

          <section id="retention" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Data retention
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We keep personal data only as long as needed to provide the service, meet legal obligations, resolve disputes, and maintain security. If you delete your account or request removal of your data, we will handle the request in line with applicable law and operational requirements.
            </p>
          </section>

          <section id="choices" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Your choices
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              You may review, update, or request deletion of your information where applicable. You can also manage your browser cookies and sign-in preferences through your device or browser settings. If you have questions about your data, you can contact the site administrator through the contact details listed on the website.
            </p>
          </section>

          <section id="changes" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Changes to this policy
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We may update this Privacy Policy from time to time to reflect product, legal, or operational changes. When we do, we will revise the “Last updated” date and make the updated version available on this page.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
