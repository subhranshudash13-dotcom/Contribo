import React from 'react';
import { Metadata } from 'next';
import { ResourcesClient } from './ResourcesClient';

export const metadata: Metadata = {
  title: 'Resources | Contribo',
  description: 'Curated guides and real-life examples to help you level up your open-source contributions.',
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-background">
      <ResourcesClient />
    </main>
  );
}
