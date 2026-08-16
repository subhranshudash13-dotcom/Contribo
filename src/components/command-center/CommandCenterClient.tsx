'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Library, 
  GraduationCap,
  ChevronRight
} from 'lucide-react';

import { ProposalBuilder } from './ProposalBuilder';
import { LivePreview } from './LivePreview';
import { ReadinessSidebar } from './ReadinessSidebar';
import { ResourceLibrary } from './ResourceLibrary';
import { MentorPlaybook } from './MentorPlaybook';

export type ProgramType = 'GSoC' | 'Outreachy' | 'LFX' | 'General';

export interface ProposalDraft {
  program: ProgramType;
  org: string;
  techSpec: string;
  contributions: string;
  timeline: string;
  bio: string;
  risks: string;
}

export type TabMode = 'dashboard' | 'builder' | 'library' | 'playbook';

export function CommandCenterClient() {
  const [activeTab, setActiveTab] = useState<TabMode>('builder');
  
  // Draft State (with local storage hydration)
  const [draft, setDraft] = useState<ProposalDraft>({
    program: 'GSoC',
    org: '',
    techSpec: '',
    contributions: '',
    timeline: '',
    bio: '',
    risks: ''
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('contribo_proposal_draft');
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('contribo_proposal_draft', JSON.stringify(draft));
    }
  }, [draft, mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Level Sticky Nav */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-hairline px-4 sm:px-6 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-surface-raised text-primary' : 'text-secondary hover:text-primary hover:bg-surface-raised/50'}`}
        >
          <LayoutDashboard size={16} /> My Progress
        </button>
        <button 
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'builder' ? 'bg-accent/10 text-accent' : 'text-secondary hover:text-primary hover:bg-surface-raised/50'}`}
        >
          <PenTool size={16} /> Proposal Builder
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'library' ? 'bg-surface-raised text-primary' : 'text-secondary hover:text-primary hover:bg-surface-raised/50'}`}
        >
          <Library size={16} /> Resource Library
        </button>
        <button 
          onClick={() => setActiveTab('playbook')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'playbook' ? 'bg-surface-raised text-primary' : 'text-secondary hover:text-primary hover:bg-surface-raised/50'}`}
        >
          <GraduationCap size={16} /> Mentor Playbook
        </button>
      </div>

      <div className="flex-1 w-full max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Proposal Builder Mode (Hero Experience) */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            
            {/* Left Rail: Readiness & Nav (2 cols) */}
            <div className="hidden lg:block lg:col-span-2 overflow-y-auto pr-2 no-scrollbar">
              <ReadinessSidebar draft={draft} />
            </div>

            {/* Middle: Outline Builder (5 cols) */}
            <div className="lg:col-span-5 flex flex-col h-full bg-surface border border-hairline rounded-2xl overflow-hidden shadow-sm">
              <ProposalBuilder draft={draft} setDraft={setDraft} />
            </div>

            {/* Right: Live Preview (5 cols) */}
            <div className="lg:col-span-5 h-full bg-surface-raised border border-hairline rounded-2xl overflow-hidden shadow-sm">
              <LivePreview draft={draft} />
            </div>

          </div>
        )}

        {/* Other Tabs placeholders */}
        {activeTab === 'dashboard' && (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Diagnostic & Progress Dashboard</h2>
            <p className="text-secondary">Track your saved organizations, overall readiness, and application timelines here.</p>
            <button 
              onClick={() => setActiveTab('builder')}
              className="mt-6 px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90"
            >
              Start Your Proposal
            </button>
          </div>
        )}

        {activeTab === 'library' && <ResourceLibrary />}
        
        {activeTab === 'playbook' && <MentorPlaybook />}

      </div>
    </div>
  );
}
