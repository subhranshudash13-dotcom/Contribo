import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getDashboardSummary } from '@/lib/repositories/dashboard';
import { getUserProfile } from '@/lib/repositories/users';
import {
  DashboardClient,
  type DashboardApp,
  type DashboardSaved,
} from '@/components/dashboard/DashboardClient';
import type { ApplicationStatus } from '@/../types';

export const metadata = {
  title: 'Dashboard | Contribo',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [summary, profile] = await Promise.all([
    getDashboardSummary(session.user.id),
    getUserProfile(session.user.id),
  ]);

  const displayName =
    profile?.name || session.user.name || session.user.email?.split('@')[0] || 'Contributor';

  const applications = (summary.applications as Array<{
    _id?: string;
    programName?: string;
    programSlug?: string;
    projectTitle: string;
    orgName: string;
    status: ApplicationStatus | string;
    deadline?: string | Date | null;
    notes?: string;
  }>).map(
    (a): DashboardApp => ({
      _id: a._id,
      programName: a.programName,
      programSlug: a.programSlug,
      projectTitle: a.projectTitle,
      orgName: a.orgName,
      status: a.status,
      deadline: a.deadline,
      notes: a.notes,
    })
  );

  const savedItems = (summary.savedItems as Array<{
    _id?: string;
    type: string;
    title: string;
    subtitle?: string;
    slug?: string;
    techStack?: string[];
    targetId?: string;
  }>).map(
    (item): DashboardSaved => ({
      _id: item._id,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      slug: item.slug,
      techStack: item.techStack,
      targetId: item.targetId ? String(item.targetId) : undefined,
    })
  );

  return (
    <DashboardClient
      displayName={displayName}
      initialApplications={applications}
      initialSaved={savedItems}
      skills={profile?.skills}
    />
  );
}
