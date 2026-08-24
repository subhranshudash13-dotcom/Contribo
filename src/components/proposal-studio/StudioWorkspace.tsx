'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Download,
  FolderArchive,
  History,
  MessageSquarePlus,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react';
import { STUDIO_NAV } from './constants';
import { useProposalStudioContext } from './context/ProposalStudioContext';

function PanelFallback() {
  return (
    <div
      role="status"
      aria-label="Loading panel"
      className="min-h-[320px] rounded-3xl border border-hairline bg-surface animate-pulse"
    />
  );
}

// Lazy-load only the active 4 panels
const BuilderPanel = dynamic(
  () => import('./panels/BuilderPanel').then((m) => ({ default: m.BuilderPanel })),
  { loading: () => <PanelFallback /> }
);
const ArchivePanel = dynamic(
  () => import('./panels/ArchivePanel').then((m) => ({ default: m.ArchivePanel })),
  { loading: () => <PanelFallback /> }
);
const GuidePanel = dynamic(
  () => import('./panels/GuidePanel').then((m) => ({ default: m.GuidePanel })),
  { loading: () => <PanelFallback /> }
);
const ExportPanel = dynamic(
  () => import('./panels/ExportPanel').then((m) => ({ default: m.ExportPanel })),
  { loading: () => <PanelFallback /> }
);
const ProposalVersionModal = dynamic(
  () =>
    import('./ui/ProposalVersionModal').then((m) => ({
      default: m.ProposalVersionModal,
    })),
  { ssr: false }
);

export function StudioWorkspace() {
  const studio = useProposalStudioContext();
  const draft = studio.activeDraft;
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  if (!draft) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center space-y-4 bg-noise">
        <p className="text-base text-secondary font-medium">No draft selected or loading drafts...</p>
        <button
          type="button"
          onClick={() => void studio.createDraft()}
          className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase text-white hover:bg-accent-hover shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} /> Create a new draft
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-noise flex flex-col">
      {/* Sticky Studio Top Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-surface/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
          <div className="flex h-16 sm:h-18 items-center justify-between gap-4">
            {/* Left: Active Draft Selector + New Draft Button */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="min-w-0 flex items-center gap-2">
                <select
                  id="draft-switcher"
                  value={studio.activeDraftId}
                  onChange={(e) => studio.setActiveDraftId(e.target.value)}
                  className="h-10 truncate max-w-[240px] sm:max-w-[360px] rounded-2xl border border-hairline bg-page px-3.5 text-xs sm:text-sm font-mono font-bold text-primary focus:outline-none focus:border-accent cursor-pointer shadow-xs"
                >
                  {studio.drafts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.projectTitle} ({d.programName})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void studio.createDraft()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-white hover:bg-accent-hover transition-colors shadow-xs cursor-pointer"
                  title="Create new proposal draft"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Right Actions: History + Sync status + Feedback */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-hairline bg-page px-3.5 font-mono text-xs sm:text-sm font-bold text-secondary hover:text-primary hover:bg-surface-raised transition-all cursor-pointer"
                title="View version history snapshots"
              >
                <History size={15} className="text-accent" />
                <span className="hidden xl:inline">Snapshots</span>
              </button>

              <span className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-hairline bg-page px-3.5 py-2 font-mono text-xs font-semibold text-muted">
                {studio.saveStatus === 'saving' ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-accent" />
                    <span>Saving…</span>
                  </>
                ) : studio.saveStatus === 'offline' ? (
                  <>
                    <RefreshCw size={12} className="text-alert" />
                    <span className="text-alert">Offline</span>
                  </>
                ) : studio.saveStatus === 'error' ? (
                  <>
                    <RefreshCw size={12} className="text-alert" />
                    <span className="text-alert">Save failed</span>
                  </>
                ) : (
                  <>
                    <Save size={12} className="text-success" />
                    <span>Autosaved</span>
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={() => studio.setIsFeedbackModalOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-hairline bg-page px-4 font-mono text-xs sm:text-sm font-bold text-primary hover:bg-surface-raised transition-all cursor-pointer"
              >
                <MessageSquarePlus size={14} className="text-accent" />
                <span className="hidden lg:inline">Feedback</span>
              </button>
            </div>
          </div>

          {/* Clean 4 Core Studio Tabs */}
          <nav className="-mb-px flex space-x-2 overflow-x-auto pt-1 pb-3" aria-label="Proposal Studio navigation">
            {STUDIO_NAV.map((nav) => {
              const Icon = nav.icon;
              const active =
                studio.activeTab === nav.id ||
                (nav.id === 'archive' && studio.activeTab === 'examples') ||
                (nav.id === 'builder' && (studio.activeTab === 'overview' || studio.activeTab === 'review'));

              let badge: string | undefined = undefined;
              if (nav.id === 'builder') badge = `${studio.calculatedProgress}%`;

              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => studio.selectTab(nav.id)}
                  className={`inline-flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-2.5 font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-accent text-white shadow-md scale-[1.01]'
                      : 'text-secondary hover:text-primary hover:bg-surface-raised border border-transparent hover:border-hairline'
                  }`}
                >
                  <Icon size={15} />
                  <span>{nav.label}</span>
                  {badge && (
                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs tabular-nums font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'border border-hairline bg-page text-muted'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Studio Canvas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
        {(studio.activeTab === 'builder' || studio.activeTab === 'overview' || studio.activeTab === 'review') && (
          <BuilderPanel />
        )}
        {(studio.activeTab === 'archive' || studio.activeTab === 'examples') && (
          <ArchivePanel />
        )}
        {studio.activeTab === 'guide' && <GuidePanel />}
        {studio.activeTab === 'export' && <ExportPanel />}
      </main>

      {/* Version History Snapshot Modal */}
      {showHistoryModal && draft && (
        <ProposalVersionModal
          draft={draft}
          onClose={() => setShowHistoryModal(false)}
          onRestore={(sections) => {
            Object.entries(sections).forEach(([secId, val]) => {
              studio.handleSectionChange(secId, val);
            });
            studio.showToast('Restored proposal snapshot');
          }}
        />
      )}
    </div>
  );
}
