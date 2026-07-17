import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, Calendar, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | Contribo',
  description: 'Understand the acceptable use rules, account responsibilities, and legal agreements for using Contribo.',
};

export default function TermsAndConditionsPage() {
  const sections = [
    { id: 'use', title: 'Use of the service' },
    { id: 'accounts', title: 'Accounts' },
    { id: 'content', title: 'Content and data' },
    { id: 'ai', title: 'AI and recommendations' },
    { id: 'availability', title: 'Availability and changes' },
    { id: 'liability', title: 'Limitation of liability' },
    { id: 'governing-law', title: 'Governing law' },
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
            <Scale size={28} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary font-sans">
            Terms & Conditions
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
              These Terms & Conditions govern your use of Contribo, a platform for discovering, organizing, and tracking open-source mentorship opportunities. By accessing or using the site, you agree to follow these terms.
            </p>
          </section>

          <section id="use" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Use of the service
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              You may use Contribo only for lawful purposes and in a way that does not harm the platform, its users, or its infrastructure. You are responsible for the accuracy of the information you submit, including profile details, saved projects, drafts, and application notes. You may not attempt to interfere with the service, access data without authorization, or use the platform for spam, scraping, or abusive activity.
            </p>
          </section>

          <section id="accounts" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Accounts
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              If you create an account, you are responsible for keeping your sign-in credentials and connected OAuth accounts secure. You are also responsible for activity that occurs under your account. We may suspend or terminate accounts that violate these terms, compromise security, or misuse the service.
            </p>
          </section>

          <section id="content" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Content and data
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              You retain ownership of the content you submit, but you grant Contribo the limited right to store, process, and display that content as needed to operate the service. We may remove or restrict content that is unlawful, harmful, misleading, or incompatible with the platform’s purpose. Program names, organization names, and related marks belong to their respective owners.
            </p>
          </section>

          <section id="ai" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              AI and recommendations
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              Contribo may use AI-powered matching and recommendation features to suggest projects based on your skills and interests. These results are generated automatically and may not always be complete, accurate, or suitable for every user. You should review all recommendations independently before relying on them for applications or decisions.
            </p>
          </section>

          <section id="availability" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Availability and changes
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              We aim to keep the platform available and accurate, but we do not guarantee uninterrupted service, error-free operation, or that all data will always be current. We may change, suspend, or discontinue features at any time to improve the product or maintain security. Some features may depend on third-party services that are outside our control.
            </p>
          </section>

          <section id="liability" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Limitation of liability
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              To the fullest extent permitted by law, Contribo is provided on an “as is” and “as available” basis. We are not liable for indirect, incidental, special, or consequential damages arising from your use of the platform. Your use of the service is at your own risk.
            </p>
          </section>

          <section id="governing-law" className="scroll-mt-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight border-b border-hairline pb-3">
              Governing law
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-primary tracking-wide">
              These terms are governed by the laws applicable to the website operator’s jurisdiction, without regard to conflict of law principles. Any disputes will be handled in the appropriate forum under applicable law.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}
