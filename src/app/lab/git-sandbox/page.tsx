import { Metadata } from 'next';
import { SandboxClient } from './SandboxClient';

export const metadata: Metadata = {
  title: 'Interactive Git DAG Simulator & Merge Conflict Sandbox | Contribo Lab',
  description:
    'Practice Git branching, interactive rebasing, upstream synchronization, and merge conflict resolution in an interactive in-browser terminal with real-time animated SVG DAG visualization.',
  keywords: [
    'Git DAG simulator',
    'Git interactive rebase sandbox',
    'Merge conflict resolution tutorial',
    'Open source git workflows',
    'GSoC Git preparation',
    'Contribo Git Lab',
  ],
  openGraph: {
    title: 'Interactive Git DAG Simulator & Merge Conflict Sandbox | Contribo Lab',
    description:
      'Learn Git muscle memory without risk of breaking your codebase. Interactive terminal, real-time SVG graph visualizer, and guided merge conflict challenges.',
    type: 'website',
    url: 'https://contribo-one.vercel.app/lab/git-sandbox',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Git DAG Simulator & Merge Conflict Sandbox',
    description:
      'Practice Git branching, upstream rebasing, and merge conflicts safely in your browser.',
  },
};

export default function GitSandboxPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Interactive Git DAG Simulator & Merge Conflict Sandbox',
    description:
      'A hands-on, zero-risk virtual Git command-line interface paired with an animated SVG Directed Acyclic Graph (DAG) visualizer for open-source contributors.',
    educationalLevel: 'Intermediate',
    learningResourceType: 'Simulation',
    provider: {
      '@type': 'Organization',
      name: 'Contribo',
      url: 'https://contribo-one.vercel.app',
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        <SandboxClient />
      </div>
    </div>
  );
}
