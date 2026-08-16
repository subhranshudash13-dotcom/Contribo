'use client';

import dynamic from 'next/dynamic';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { ProposalStudioProvider, useProposalStudioContext } from './context/ProposalStudioContext';
import { StudioHub } from './StudioHub';
import { StudioToast } from './ui/StudioToast';

// Workspace (panels + modals) only loads when user opens a draft
const StudioWorkspace = dynamic(
  () => import('./StudioWorkspace').then((m) => ({ default: m.StudioWorkspace })),
  {
    loading: () => (
      <div className="min-h-[60vh] w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-16 rounded-2xl border border-hairline bg-surface animate-pulse" />
        <div className="h-80 rounded-2xl border border-hairline bg-surface animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

function StudioContent() {
  const studio = useProposalStudioContext();

  return (
    <>
      <StudioToast message={studio.toastMessage} />
      {studio.isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={studio.isFeedbackModalOpen}
          onClose={() => studio.setIsFeedbackModalOpen(false)}
        />
      )}

      {studio.mode === 'hub' ? <StudioHub /> : <StudioWorkspace />}
    </>
  );
}

export default function ProposalStudioApp() {
  return (
    <ProposalStudioProvider>
      <StudioContent />
    </ProposalStudioProvider>
  );
}
