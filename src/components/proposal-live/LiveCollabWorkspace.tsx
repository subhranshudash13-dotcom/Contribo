'use client';

import React, { useState, useEffect } from 'react';
import type {
  LiveCollabState,
  ParticipantRole,
} from '@/lib/proposal-live/types';
import { useMinuteClock } from '@/lib/client/use-minute-clock';
import { PresenceRadar } from './PresenceRadar';
import { ReviewerPingTray } from './ReviewerPingTray';
import { RevisionHistoryTimeline } from './RevisionHistoryTimeline';
import {
  Lock,
  Unlock,
  FileText,
  Save,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface LiveCollabWorkspaceProps {
  initialState: LiveCollabState;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: ParticipantRole;
}

const SECTION_KEYS = [
  'summary',
  'problemStatement',
  'architecture',
  'deliverables',
  'timeline',
  'testing',
  'risks',
  'aboutMe',
] as const;

export function LiveCollabWorkspace({
  initialState,
  currentUserId = 'user_dev_guest',
  currentUserName = 'Developer Contributor',
  currentUserRole = 'contributor',
}: LiveCollabWorkspaceProps) {
  const [state, setState] = useState<LiveCollabState>(initialState);
  const [activeSection, setActiveSection] = useState<string>('summary');
  const [userEdits, setUserEdits] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const currentTime = useMinuteClock();

  // Periodic heartbeat registration
  useEffect(() => {
    let isMounted = true;
    const sendHeartbeat = async () => {
      try {
        const res = await fetch(`/api/proposals/${state.proposalId}/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'heartbeat',
            userId: currentUserId,
            name: currentUserName,
            role: currentUserRole,
            status: 'typing',
            activeSection,
          }),
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.participants) {
            setState((prev) => ({ ...prev, participants: data.participants }));
          }
        }
      } catch {
        // Fallback gracefully in testing / offline
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [state.proposalId, currentUserId, currentUserName, currentUserRole, activeSection]);

  const activeContent = userEdits[activeSection] ?? (state.sections[activeSection] || '');

  const activeLock = state.locks[activeSection];
  const isLockedByOther =
    currentTime > 0 &&
    Boolean(
      activeLock &&
      activeLock.lockedBy !== currentUserId &&
      Date.parse(activeLock.expiresAt) > currentTime
    );
  const isLockedByMe =
    currentTime > 0 &&
    Boolean(
      activeLock &&
      activeLock.lockedBy === currentUserId &&
      Date.parse(activeLock.expiresAt) > currentTime
    );

  const handleAcquireLock = async () => {
    setIsLocking(true);
    try {
      const res = await fetch(`/api/proposals/${state.proposalId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lock',
          sectionId: activeSection,
          userId: currentUserId,
          userName: currentUserName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.lock) {
        setState((prev) => ({
          ...prev,
          locks: { ...prev.locks, [activeSection]: data.lock },
        }));
        setStatusMessage('Lock acquired. You can now edit without conflicts.');
      } else {
        setStatusMessage(data.error || 'Failed to acquire lock.');
      }
    } catch {
      setStatusMessage('Network error acquiring lock.');
    } finally {
      setIsLocking(false);
    }
  };

  const handleReleaseLock = async () => {
    setIsLocking(true);
    try {
      const res = await fetch(`/api/proposals/${state.proposalId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release',
          sectionId: activeSection,
          userId: currentUserId,
        }),
      });
      if (res.ok) {
        setState((prev) => {
          const updatedLocks = { ...prev.locks };
          delete updatedLocks[activeSection];
          return { ...prev, locks: updatedLocks };
        });
        setStatusMessage('Lock released.');
      }
    } catch {
      setStatusMessage('Network error releasing lock.');
    } finally {
      setIsLocking(false);
    }
  };

  const handleSaveSection = async () => {
    if (isLockedByOther) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/proposals/${state.proposalId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'patch',
          sectionId: activeSection,
          content: activeContent,
          authorId: currentUserId,
          authorName: currentUserName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          sections: { ...prev.sections, [activeSection]: activeContent },
          revisions: data.revision ? [data.revision, ...prev.revisions] : prev.revisions,
        }));
        setLastSavedTime(new Date().toLocaleTimeString());
        setStatusMessage('Draft changes saved and broadcasted.');
      }
    } catch {
      setStatusMessage('Error saving draft changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = async (revisionId: string) => {
    setRollingBackId(revisionId);
    try {
      const res = await fetch(`/api/proposals/${state.proposalId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          revisionId,
          operatorId: currentUserId,
          operatorName: currentUserName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const restored = data.restoredRevision;
        if (restored) {
          setState((prev) => ({
            ...prev,
            sections: { ...prev.sections, [restored.sectionId]: restored.content },
            revisions: [restored, ...prev.revisions],
          }));
          setUserEdits((prev) => ({
            ...prev,
            [restored.sectionId]: restored.content,
          }));
          setStatusMessage(`Rollback successful to revision #${revisionId.slice(0, 8)}`);
        }
      }
    } catch {
      setStatusMessage('Error rolling back revision.');
    } finally {
      setRollingBackId(null);
    }
  };

  const handleAddPing = async (message: string, selectedText?: string) => {
    try {
      const res = await fetch(`/api/proposals/${state.proposalId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ping',
          sectionId: activeSection,
          authorId: currentUserId,
          authorName: currentUserName,
          authorRole: currentUserRole,
          selectedText,
          message,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ping) {
          setState((prev) => ({
            ...prev,
            pings: [data.ping, ...prev.pings],
          }));
        }
      }
    } catch {
      // Ignored
    }
  };

  const handleTogglePingStatus = async (pingId: string, status: 'open' | 'resolved') => {
    try {
      const res = await fetch(`/api/proposals/${state.proposalId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ping_status',
          pingId,
          status,
        }),
      });
      if (res.ok) {
        setState((prev) => ({
          ...prev,
          pings: prev.pings.map((p) => (p.id === pingId ? { ...p, status } : p)),
        }));
      }
    } catch {
      // Ignored
    }
  };

  const wordCount = activeContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = activeContent.length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <span>{state.programName}</span>
            <span>•</span>
            <span>{state.orgName}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mt-1">{state.projectTitle}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-Time Collaborative Proposal Workspace & Presence Radar
          </p>
        </div>

        <PresenceRadar participants={state.participants} currentUserId={currentUserId} />
      </div>

      {/* Status banner if present */}
      {statusMessage && (
        <div className="bg-zinc-800/80 border border-zinc-700/80 px-4 py-2 rounded-lg text-xs text-zinc-200 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-zinc-400 hover:text-zinc-100 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 pb-3">
        {SECTION_KEYS.map((sec) => {
          const isActive = activeSection === sec;
          const isSecLocked =
            currentTime > 0 &&
            state.locks[sec] &&
            Date.parse(state.locks[sec].expiresAt) > currentTime;
          return (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span>#{sec}</span>
              {isSecLocked && <Lock className="w-3 h-3 text-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* Lock Guard & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs">
          {isLockedByOther ? (
            <div className="flex items-center gap-2 text-amber-400 bg-amber-950/40 border border-amber-800/60 px-3 py-1 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              <span>Section locked by {activeLock?.lockedByName} (Read-Only)</span>
            </div>
          ) : isLockedByMe ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>You hold the edit lock for #{activeSection}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400 bg-zinc-800/60 px-3 py-1 rounded-lg">
              <Unlock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Section is unlocked for editing</span>
            </div>
          )}

          {lastSavedTime && (
            <span className="text-zinc-500 text-[11px]">Saved at {lastSavedTime}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLockedByMe ? (
            <button
              type="button"
              onClick={handleReleaseLock}
              disabled={isLocking}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Release Lock</span>
            </button>
          ) : !isLockedByOther ? (
            <button
              type="button"
              onClick={handleAcquireLock}
              disabled={isLocking}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Acquire Lock</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleSaveSection}
            disabled={isSaving || isLockedByOther}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Broadcasting...' : 'Broadcast Changes'}</span>
          </button>
        </div>
      </div>

      {/* Split Pane: Collaborative Editor & Live Markdown Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[460px]">
        {/* Left: Collaborative Editor */}
        <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Collaborative Markdown Editor</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
            </div>
          </div>
          <div className="relative flex-1 p-2">
            <textarea
              value={activeContent}
              onChange={(e) =>
                setUserEdits((prev) => ({
                  ...prev,
                  [activeSection]: e.target.value,
                }))
              }
              disabled={isLockedByOther}
              placeholder={`Drafting #${activeSection}...`}
              className="w-full h-full min-h-[400px] p-4 bg-transparent text-zinc-100 placeholder-zinc-600 font-mono text-xs leading-relaxed focus:outline-none resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Right: Live Markdown Preview */}
        <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Rendered Preview</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
              Synced
            </span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto max-h-[500px] text-zinc-300 text-xs leading-relaxed prose prose-invert max-w-none">
            {activeContent.trim() ? (
              <div className="whitespace-pre-wrap font-sans space-y-2">
                {activeContent.split('\n\n').map((para, i) => {
                  if (para.startsWith('# ')) {
                    return (
                      <h1 key={i} className="text-lg font-bold text-zinc-100 mt-2 mb-1">
                        {para.replace(/^#\s+/, '')}
                      </h1>
                    );
                  }
                  if (para.startsWith('## ')) {
                    return (
                      <h2 key={i} className="text-base font-semibold text-zinc-200 mt-2 mb-1">
                        {para.replace(/^##\s+/, '')}
                      </h2>
                    );
                  }
                  if (para.startsWith('- ') || para.startsWith('* ')) {
                    return (
                      <ul key={i} className="list-disc list-inside space-y-1 text-zinc-300 pl-2">
                        {para.split('\n').map((line, idx) => (
                          <li key={idx}>{line.replace(/^[-*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-zinc-300">
                      {para}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="text-zinc-600 italic">No content drafted for this section yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Trays: Reviewer Feedback & Revisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewerPingTray
          pings={state.pings}
          activeSectionId={activeSection}
          onAddPing={handleAddPing}
          onTogglePingStatus={handleTogglePingStatus}
        />
        <RevisionHistoryTimeline
          revisions={state.revisions}
          onRollback={handleRollback}
          rollingBackId={rollingBackId}
        />
      </div>
    </div>
  );
}
