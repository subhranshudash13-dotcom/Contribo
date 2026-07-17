import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Contribo',
  description: 'Understand how Contribo collects, uses, and secures your personal and project tracking data.',
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="font-mono text-muted" style={{ fontSize: '20px' }}>
          Last updated: July 12, 2026
        </p>
      </div>

      {/* Content Card Wrapper */}
      <div className="bg-surface border border-hairline rounded-2xl p-6 sm:p-10 shadow-sm text-left w-full">
        <main className="space-y-10 font-sans w-full">
          
          <section id="overview" className="space-y-4">
            <p className="leading-relaxed tracking-wide border-l-2 border-accent pl-4" style={{ fontSize: '19px', color: 'var(--primary)' }}>
              Contribo respects your privacy and is designed to help contributors discover and track opportunities in open-source mentorship programs. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using our website and services.
            </p>
          </section>

          <section id="collection" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Information we collect
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We may collect information you provide directly, such as your name, email address, profile details, saved organizations, proposal drafts, application progress, and preferences. If you sign in with GitHub or Google, we may receive account information from those providers according to the permissions you grant. We may also collect technical information such as browser type, device information, pages visited, and usage data to help improve performance and reliability.
            </p>
          </section>

          <section id="use" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              How we use information
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We use this information to provide and improve Contribo’s features, personalize your dashboard, match you with relevant projects, manage authentication, support saved progress, and maintain security. We may also use data to analyze platform usage, improve search quality, and troubleshoot issues. We do not sell your personal information.
            </p>
          </section>

          <section id="sharing" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Sharing information
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We may share information with trusted service providers that help us operate the platform, such as hosting, authentication, database, analytics, and AI-related services. We may also share information when required by law, to protect our rights, or to prevent abuse or security issues. Any service providers we use are expected to handle data responsibly and only for the purposes we authorize.
            </p>
          </section>

          <section id="cookies" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Cookies and similar technologies
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              Contribo may use cookies or similar technologies to remember sign-in sessions, improve site performance, and understand how the platform is used. You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
            </p>
          </section>

          <section id="retention" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Data retention
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We keep personal data only as long as needed to provide the service, meet legal obligations, resolve disputes, and maintain security. If you delete your account or request removal of your data, we will handle the request in line with applicable law and operational requirements.
            </p>
          </section>

          <section id="choices" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Your choices
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              You may review, update, or request deletion of your information where applicable. You can also manage your browser cookies and sign-in preferences through your device or browser settings. If you have questions about your data, you can contact the site administrator through the contact details listed on the website.
            </p>
          </section>

          <section id="changes" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              Changes to this policy
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We may update this Privacy Policy from time to time to reflect product, legal, or operational changes. When we do, we will revise the “Last updated” date and make the updated version available on this page.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
