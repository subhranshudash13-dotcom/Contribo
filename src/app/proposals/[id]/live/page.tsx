import React from 'react';
import type { Metadata } from 'next';
import { LiveCollabWorkspace } from '@/components/proposal-live/LiveCollabWorkspace';
import { getLiveState } from '@/lib/repositories/proposal-live';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Live Collaborative Proposal Studio (#${id}) | Contribo`,
    description:
      'Real-Time WebSocket Collaborative Proposal Editing, Active Presence Radar, Soft Section Write-Locks, and Inline Mentor Annotations.',
  };
}

export default async function ProposalLivePage({ params }: Props) {
  const { id } = await params;
  const state = await getLiveState(id);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-16">
      <LiveCollabWorkspace
        initialState={state}
        currentUserId="contributor_trunal"
        currentUserName="Trunal Patil (Contributor)"
        currentUserRole="contributor"
      />
    </main>
  );
}
