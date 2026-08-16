'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useProposalStudio, ProposalStudioController } from '../hooks/useProposalStudio';

const ProposalStudioContext = createContext<ProposalStudioController | null>(null);

export function ProposalStudioProvider({ children }: { children: ReactNode }) {
  const studio = useProposalStudio();
  return (
    <ProposalStudioContext.Provider value={studio}>
      {children}
    </ProposalStudioContext.Provider>
  );
}

export function useProposalStudioContext(): ProposalStudioController {
  const context = useContext(ProposalStudioContext);
  if (!context) {
    throw new Error('useProposalStudioContext must be used within a ProposalStudioProvider');
  }
  return context;
}
