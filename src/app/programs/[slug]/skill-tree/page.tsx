import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProgramSkillTree } from '@/lib/repositories/skill-tree';
import { SkillTreeClient } from './SkillTreeClient';

interface SkillTreePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  props: SkillTreePageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const graph = await getProgramSkillTree(slug);

  if (!graph) {
    return {
      title: 'Skill Tree Not Found | Contribo',
    };
  }

  return {
    title: `${graph.programName} Contributor Skill-Tree & Learning Pathway | Contribo`,
    description: graph.description,
    openGraph: {
      title: `${graph.programName} Skill-Tree | Contribo`,
      description: graph.description,
      type: 'website',
    },
  };
}

export default async function SkillTreePage(props: SkillTreePageProps) {
  const { slug } = await props.params;
  const graph = await getProgramSkillTree(slug);

  if (!graph) {
    notFound();
  }

  return <SkillTreeClient initialGraph={graph} slug={slug} />;
}
