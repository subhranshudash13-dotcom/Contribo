import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Contribo',
  description: 'Understand the acceptable use rules, account responsibilities, and legal agreements for using Contribo.',
};

export default function TermsAndConditionsPage() {
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
          Terms of Service
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
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Contribo website, services, and applications (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section id="use" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              1. Agreement to Terms
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              You may use Contribo only for lawful purposes and in a way that does not harm the platform, its users, or its infrastructure. You are responsible for the accuracy of the information you submit, including profile details, saved projects, drafts, and application notes. You may not attempt to interfere with the service, access data without authorization, or use the platform for spam, scraping, or abusive activity.
            </p>
          </section>

          <section id="accounts" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              2. Accounts
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              If you create an account, you are responsible for keeping your sign-in credentials and connected OAuth accounts secure. You are also responsible for activity that occurs under your account. We may suspend or terminate accounts that violate these terms, compromise security, or misuse the service.
            </p>
          </section>

          <section id="content" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              3. Content and data
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              You retain ownership of the content you submit, but you grant Contribo the limited right to store, process, and display that content as needed to operate the service. We may remove or restrict content that is unlawful, harmful, misleading, or incompatible with the platform’s purpose. Program names, organization names, and related marks belong to their respective owners.
            </p>
          </section>

          <section id="ai" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              4. AI and recommendations
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              Contribo may use AI-powered matching and recommendation features to suggest projects based on your skills and interests. These results are generated automatically and may not always be complete, accurate, or suitable for every user. You should review all recommendations independently before relying on them for applications or decisions.
            </p>
          </section>

          <section id="availability" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              5. Availability and changes
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              We aim to keep the platform available and accurate, but we do not guarantee uninterrupted service, error-free operation, or that all data will always be current. We may change, suspend, or discontinue features at any time to improve the product or maintain security. Some features may depend on third-party services that are outside our control.
            </p>
          </section>

          <section id="liability" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              6. Limitation of liability
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              To the fullest extent permitted by law, Contribo is provided on an “as is” and “as available” basis. We are not liable for indirect, incidental, special, or consequential damages arising from your use of the platform. Your use of the service is at your own risk.
            </p>
          </section>

          <section id="governing-law" className="space-y-3">
            <h2 className="font-bold tracking-tight" style={{ fontSize: '27px', color: 'var(--accent)' }}>
              7. Governing law
            </h2>
            <p className="leading-relaxed tracking-wide" style={{ fontSize: '17px', color: 'var(--primary)' }}>
              These terms are governed by the laws applicable to the website operator’s jurisdiction, without regard to conflict of law principles. Any disputes will be handled in the appropriate forum under applicable law.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
