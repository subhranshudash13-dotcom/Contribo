import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CompareClient } from './CompareClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compare Open Source Programs & Regional Stipends | Contribo',
  description:
    'Side-by-side comparison matrix for Google Summer of Code, LFX Mentorship, Outreachy, Summer of Bitcoin and more. Compare regional PPP stipends, eligibility rules, and timeline overlaps.',
  keywords: [
    'gsoc vs lfx',
    'open source program comparison',
    'gsoc stipend calculator',
    'regional stipend ppp',
    'outreachy vs gsoc',
    'open source mentorship timeline',
  ],
  openGraph: {
    title: 'Multi-Program Comparison Matrix & Regional Stipend Engine | Contribo',
    description:
      'Compare regional PPP stipends, eligibility constraints, weekly workloads, and timeline clashes across open-source mentorship programs.',
    type: 'website',
  },
};

export default function ProgramComparePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Contribo Program Comparison Matrix',
    applicationCategory: 'EducationalApplication',
    description:
      'Interactive multi-program comparison matrix for open-source fellowships and mentorship programs, featuring regional PPP stipend calculations and timeline collision detection.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center p-8 bg-background">
            <div className="flex flex-col items-center gap-3 text-muted-foreground text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Loading Program Comparison Matrix...</span>
            </div>
          </div>
        }
      >
        <CompareClient />
      </Suspense>
    </>
  );
}
