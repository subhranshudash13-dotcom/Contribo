import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOrganizationEcosystemReport } from '@/lib/organizations/ecosystem-analyzer';
import { EcosystemClient } from './EcosystemClient';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const resolved = await Promise.resolve(props.params);
  const slug = (resolved?.slug ?? '').trim();
  return {
    title: `${slug || 'Organization'} Ecosystem & Bus-Factor Explorer | Contribo`,
    description:
      'Analyze organization tech-stack dependency graphs, maintainer bus-factor concentration, and newcomer PR merge velocity.',
  };
}

export default async function OrganizationEcosystemPage(props: Props) {
  const resolved = await Promise.resolve(props.params);
  const slug = (resolved?.slug ?? '').trim().toLowerCase();

  if (!slug || !/^[a-z0-9_-]{1,64}$/.test(slug)) {
    notFound();
  }

  const report = getOrganizationEcosystemReport(slug);

  return (
    <main className="min-h-screen w-full px-4 sm:px-8 lg:px-12 pt-[140px] pb-24">
      <EcosystemClient report={report} />
    </main>
  );
}
