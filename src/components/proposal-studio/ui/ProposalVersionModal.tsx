'use client';

import React, { useState } from 'react';
import { Clock, History, RotateCcw, X } from 'lucide-react';
import type { ProposalDraft } from '@/lib/proposal-studio/data';
import { BUILDER_SECTIONS } from '../constants';

interface ProposalVersionModalProps {
  draft: ProposalDraft;
  onClose: () => void;
  onRestore: (sections: Record<string, string>) => void;
}

export function ProposalVersionModal({
  draft,
  onClose,
  onRestore,
}: ProposalVersionModalProps) {
  // Generate synthetic timeline snapshots based on active draft
  const snapshots = [
    {
      id: 'snap-now',
      label: 'Current Live State',
      time: 'Just now',
      sections: draft.sections,
    },
    {
      id: 'snap-1',
      label: 'AI Audit Snapshot',
      time: '2 hours ago',
      sections: {
        ...draft.sections,
        stretchGoals: 'Added WebGL streaming and latency metrics buffer.',
      },
    },
    {
      id: 'snap-2',
      label: 'Initial Architecture Outline',
      time: 'Yesterday',
      sections: {
        ...draft.sections,
        summary: 'Initial project draft proposal for mentor feedback.',
        architecture: 'Modular TypeScript interfaces with backend REST endpoints.',
      },
    },
  ];

  const [selectedSnapId, setSelectedSnapId] = useState<string>(snapshots[0].id);
  const selectedSnap = snapshots.find((s) => s.id === selectedSnapId) || snapshots[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-2.5">
            <History size={20} className="text-accent" />
            <div>
              <h3 className="font-heading text-xl font-bold text-primary">
                Proposal Version History
              </h3>
              <p className="font-mono text-xs text-muted">
                {draft.projectTitle} · Auto-saved checkpoints
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-page text-muted hover:text-primary cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Snapshots Timeline Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {snapshots.map((snap) => {
            const active = snap.id === selectedSnapId;
            return (
              <button
                key={snap.id}
                type="button"
                onClick={() => setSelectedSnapId(snap.id)}
                className={`p-3.5 rounded-2xl border text-left space-y-1 transition-all cursor-pointer ${
                  active
                    ? 'border-accent bg-accent/10 shadow-sm'
                    : 'border-hairline bg-page hover:bg-surface-raised'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                  <span className={active ? 'text-accent' : 'text-primary'}>
                    {snap.label}
                  </span>
                  <Clock size={12} className="text-muted" />
                </div>
                <p className="font-mono text-[10px] text-muted">{snap.time}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Snapshot Preview */}
        <div className="space-y-4 rounded-2xl border border-hairline bg-page p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
              Snapshot Preview: {selectedSnap.label}
            </span>

            {selectedSnapId !== 'snap-now' && (
              <button
                type="button"
                onClick={() => {
                  onRestore(selectedSnap.sections);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-accent-hover transition-all shadow-sm cursor-pointer"
              >
                <RotateCcw size={13} /> Restore Version
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {BUILDER_SECTIONS.map((s) => (
              <div key={s.id} className="rounded-xl border border-hairline bg-surface p-3 space-y-1">
                <p className="font-mono text-[11px] font-bold text-accent">{s.title}</p>
                <p className="font-mono text-xs text-primary leading-relaxed">
                  {selectedSnap.sections[s.id] || '(empty)'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
