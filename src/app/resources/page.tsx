import React from 'react';
import { Metadata } from 'next';
import { ResourcesClient } from './ResourcesClient';

export const metadata: Metadata = {
  title: 'Open Source Contributor Resources: PR, Issue & Fellowship Guides | Contribo',
  description:
    'Curated open-source guides with real-life examples: how to open a great pull request, pick and claim issues, handle code review, and prepare for GSoC, Outreachy and other fellowship programs.',
  keywords: [
    'open source',
    'open source guides',
    'pull request',
    'first pull request',
    'good first issue',
    'code review',
    'GSoC',
    'Outreachy',
    'open source fellowship',
    'mentorship programs',
  ],
  openGraph: {
    title: 'Open Source Contributor Resources | Contribo',
    description:
      'Guides and real-life examples for pull requests, issues, code reviews and open-source fellowship programs.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Open Source Contributor Resources | Contribo',
    description:
      'Guides and real-life examples for pull requests, issues, code reviews and open-source fellowship programs.',
  },
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-background mt-16 sm:mt-20">
      <ResourcesClient />
    </main>
  );
}
