import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { IssuesClient } from './IssuesClient';

export const metadata: Metadata = {
  title: 'Good First Issues & Contributor Task Radar | Contribo',
  description:
    'Discover curated beginner-friendly open-source issues across GSoC, LFX Mentorship, Outreachy, and NSoC with Orbit AI skill vector matching and real-time task radar tracking.',
  alternates: {
    canonical: '/issues',
  },
  openGraph: {
    title: 'Good First Issues & Contributor Task Radar | Contribo',
    description:
      'Curated starter issues for open source contributors across top organizations with automated skill matching and Kanban workflow tracking.',
    url: '/issues',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Good First Issues & Contributor Task Radar | Contribo',
    description:
      'Find and claim beginner-friendly open source tickets tailored to your programming tech stack.',
  },
};

function IssuesFallback() {
  return (
    <main className="min-h-screen w-full bg-noise">
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <div className="space-y-4">
          <div className="h-6 w-48 rounded-xl border border-hairline bg-surface animate-pulse" />
          <div className="h-12 w-96 rounded-2xl border border-hairline bg-surface animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="h-96 w-full lg:w-72 rounded-2xl border border-hairline bg-surface animate-pulse" />
          <div className="flex-1 space-y-4">
            <div className="h-12 w-full rounded-2xl border border-hairline bg-surface animate-pulse" />
            <div className="h-44 w-full rounded-2xl border border-hairline bg-surface animate-pulse" />
            <div className="h-44 w-full rounded-2xl border border-hairline bg-surface animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function IssuesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Good First Issues & Contributor Task Radar',
    description:
      'Curated directory of open source beginner issues across GSoC, LFX, and Outreachy programs with AI matching.',
    url: 'https://contribo-one.vercel.app/issues',
    publisher: {
      '@type': 'Organization',
      name: 'Contribo',
      url: 'https://contribo-one.vercel.app',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<IssuesFallback />}>
        <IssuesClient />
      </Suspense>
    </>
  );
}
