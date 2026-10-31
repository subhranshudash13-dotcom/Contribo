'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculateProposalProgress as computeProgress } from '@/lib/proposal-studio/sections';
import {
  DRAFT_PROPOSALS,
  ORG_PROPOSALS_CATALOG,
  calculateProposalScore,
  type AcceptedProposal,
  type ProposalDraft,
} from '@/lib/proposal-studio/data';
import {
  aiImproveSectionApi,
  createProposalDraft,
  deleteProposalDraft,
  fetchProposals,
  friendlyApiMessage,
  isApiError,
  updateProposalDraft,
} from '@/lib/client/api';
import {
  BUILDER_SECTIONS,
  type ProgramTagFilter,
  type StudioMode,
  type StudioTab,
} from '../constants';
import { useProposalAutoSave } from './useProposalAutoSave';
import {
  clearLocalSnapshot,
  formatLocalSaveClock,
  hasNewerLocalWork,
  isoToDate,
  readLocalSnapshot,
  sectionsSignature,
  type LocalDraftSnapshot,
} from '@/lib/client/proposal-autosave';

const VALID_TABS: StudioTab[] = [
  'builder',
  'archive',
  'guide',
  'export',
  'overview',
  'examples',
  'review',
];

function isStudioTab(value: string | null): value is StudioTab {
  return !!value && (VALID_TABS as string[]).includes(value);
}

function normalizeTab(value: string | null): StudioTab {
  if (value === 'archive' || value === 'examples') return 'archive';
  if (value === 'guide') return 'guide';
  if (value === 'export') return 'export';
  return 'builder';
}

function sectionFilled(value: string | undefined, minChars: number) {
  return (value || '').trim().length >= minChars;
}

/**
 * What the header pill is allowed to claim. `cloud` only after a PATCH has
 * actually resolved; `local` means the text is safe in this browser but has
 * not been confirmed by the server.
 */
export type StudioSyncState = 'idle' | 'saving' | 'cloud' | 'local' | 'offline' | 'error';

export function useProposalStudio() {
  const searchParams = useSearchParams();
  const draftParam = searchParams.get('draft');
  const modeParam = searchParams.get('mode');
  const tabParam = searchParams.get('tab');
  const projectParam = searchParams.get('project');
  const orgParam = searchParams.get('org');

  const initialTab: StudioTab = normalizeTab(tabParam);
  const initialMode: StudioMode =
    draftParam || modeParam === 'workspace' || isStudioTab(tabParam)
      ? 'workspace'
      : 'workspace'; // Default straight to workspace for a seamless single-page experience

  const [mode, setMode] = useState<StudioMode>(initialMode);
  const [drafts, setDrafts] = useState<ProposalDraft[]>(DRAFT_PROPOSALS);
  const [activeDraftId, setActiveDraftId] = useState<string>(
    draftParam || DRAFT_PROPOSALS[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    BUILDER_SECTIONS[0].id
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedProgramTag, setSelectedProgramTag] =
    useState<ProgramTagFilter>('ALL');
  const [selectedProposalPreview, setSelectedProposalPreview] =
    useState<AcceptedProposal | null>(null);
  const [downloadQuota] = useState(2);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'offline'>(
    'saved'
  );
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seededFromQuery = useRef(false);
  // Latest draft list, readable from effects that must not re-run on every
  // keystroke (the recovery check compares against the cloud copy on it).
  const draftsRef = useRef(drafts);
  // Text that survived in this browser but never reached MongoDB, plus the
  // moment the last cloud save was confirmed.
  const [recoveryCandidate, setRecoveryCandidate] = useState<LocalDraftSnapshot | null>(null);
  const [recoveryCheckedFor, setRecoveryCheckedFor] = useState<string | null>(null);
  // Signature of the exact text a PATCH confirmed on the server, or null while
  // nothing has been saved in this session.
  const [cloudSyncedSignature, setCloudSyncedSignature] = useState<string | null>(null);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const activeDraft = useMemo(() => {
    return drafts.find((d) => d.id === activeDraftId) || drafts[0];
  }, [drafts, activeDraftId]);

  // Single source of truth: sections live on the active draft
  const sectionsState = useMemo(
    () => activeDraft?.sections ?? {},
    [activeDraft?.sections]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      let loaded = DRAFT_PROPOSALS;
      setBootstrapError(null);
      setIsOfflineMode(false);

      try {
        const res = await fetchProposals();
        if (!cancelled && res?.proposals && res.proposals.length > 0) {
          loaded = res.proposals;
          setDrafts(res.proposals);
          if (!draftParam) {
            setActiveDraftId(res.proposals[0].id);
          }
        }
      } catch (e) {
        if (!cancelled) {
          const offline = isApiError(e) && e.isOffline;
          setIsOfflineMode(offline);
          if (isApiError(e) && e.status === 401) {
            // Unauthenticated — local seed drafts are fine
            setBootstrapError(null);
          } else {
            setBootstrapError(
              friendlyApiMessage(
                e,
                offline
                  ? 'Working offline with local drafts until you reconnect.'
                  : 'Could not load cloud drafts — showing local copies.'
              )
            );
          }
        }
      }

      // Deep-link from matcher / project cards (?project=&org=)
      if (
        !cancelled &&
        !seededFromQuery.current &&
        (projectParam || orgParam)
      ) {
        seededFromQuery.current = true;
        const title = projectParam || 'Matched Project Proposal';
        const org = orgParam || 'Open Source Organization';
        const match = loaded.find(
          (d) =>
            d.projectTitle.toLowerCase() === title.toLowerCase() &&
            d.orgName.toLowerCase() === org.toLowerCase()
        );

        if (match) {
          setActiveDraftId(match.id);
          setMode('workspace');
          setActiveTab('builder');
        } else {
          try {
            const created = await createProposalDraft({
              projectTitle: title,
              orgName: org,
              programName: 'Google Summer of Code',
            });
            if (!cancelled && created?.proposal) {
              setDrafts((prev) => [created.proposal, ...prev]);
              setActiveDraftId(created.proposal.id);
              setMode('workspace');
              setActiveTab('builder');
              setToastMessage(`Draft started for ${title}`);
            }
          } catch (e) {
            if (!cancelled) {
              if (isApiError(e) && e.isOffline) {
                setIsOfflineMode(true);
                setToastMessage('Offline — draft will sync when you reconnect.');
              } else if (isApiError(e) && e.status === 401) {
                setToastMessage('Sign in to save proposal drafts to the cloud.');
              } else {
                setToastMessage(friendlyApiMessage(e, 'Could not create draft'));
              }
            }
          }
        }
      }

      if (!cancelled) setIsBootstrapping(false);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [draftParam, projectParam, orgParam]);

  const filteredCatalog = useMemo(() => {
    return ORG_PROPOSALS_CATALOG.filter((group) => {
      const matchesTag =
        selectedProgramTag === 'ALL' || group.programTag === selectedProgramTag;
      const q = librarySearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        group.orgName.toLowerCase().includes(q) ||
        group.proposals.some(
          (p) =>
            p.projectTitle.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q)
        );
      return matchesTag && matchesSearch;
    });
  }, [selectedProgramTag, librarySearch]);

  const calculatedProgress = useMemo(
    () => computeProgress(sectionsState),
    [sectionsState]
  );

  const scoreData = useMemo(
    () => calculateProposalScore(sectionsState),
    [sectionsState]
  );

  const sectionStatus = useMemo(() => {
    return BUILDER_SECTIONS.map((s) => ({
      id: s.id,
      filled: sectionFilled(sectionsState[s.id], s.minChars),
      chars: (sectionsState[s.id] || '').length,
      words: (sectionsState[s.id] || '').split(/\s+/).filter(Boolean).length,
    }));
  }, [sectionsState]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3200);
  }, []);

  const persistSectionEdit = useCallback(
    async (
      draftId: string,
      updatedSections: Record<string, string>,
      progress: number
    ) => {
      // Local seed drafts (no cloud id pattern from API) still try PATCH;
      // failures are surfaced via saveStatus without blocking typing.
      setSaveStatus('saving');
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          setSaveStatus('offline');
          setIsOfflineMode(true);
          return;
        }
        await updateProposalDraft(draftId, {
          sections: updatedSections,
          progress,
        });
        setSaveStatus('saved');
        setIsOfflineMode(false);
        // Only a resolved PATCH backs the "Cloud synced" claim.
        setCloudSyncedSignature(sectionsSignature(draftId, updatedSections));
      } catch (e) {
        if (isApiError(e) && e.isOffline) {
          setSaveStatus('offline');
          setIsOfflineMode(true);
        } else if (isApiError(e) && e.status === 401) {
          // Keep local edits; user not signed in
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      }
    },
    []
  );

  const handleSectionChange = useCallback(
    (sectionId: string, value: string) => {
      const draftId = activeDraftId;

      setDrafts((prevDrafts) => {
        const current = prevDrafts.find((d) => d.id === draftId);
        if (!current) return prevDrafts;

        const updated = { ...current.sections, [sectionId]: value };
        const progress = computeProgress(updated);

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          void persistSectionEdit(draftId, updated, progress);
        }, 450);

        return prevDrafts.map((d) =>
          d.id === draftId
            ? {
                ...d,
                sections: updated,
                progress,
                updatedAt: new Date().toISOString(),
              }
            : d
        );
      });
    },
    [activeDraftId, persistSectionEdit]
  );


  // Look for a local buffer worth offering once per draft, after the cloud
  // copy has finished loading. Deferred a tick so the read never runs during
  // the same effect that mounted the panel.
  useEffect(() => {
    if (isBootstrapping || !activeDraftId) return;
    const draftIdAtCheck = activeDraftId;
    let cancelled = false;
    const check = window.setTimeout(() => {
      if (cancelled) return;
      const cloud = draftsRef.current.find((d) => d.id === draftIdAtCheck);
      const local = readLocalSnapshot(draftIdAtCheck);
      setRecoveryCandidate(
        hasNewerLocalWork(local, cloud?.sections, cloud?.updatedAt) ? local : null
      );
      setRecoveryCheckedFor(draftIdAtCheck);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(check);
    };
  }, [isBootstrapping, activeDraftId]);

  const {
    lastLocalSaveAt,
    flushNow: flushLocalDraft,
    discardPending: discardPendingLocalSave,
  } = useProposalAutoSave({
    draftId: activeDraftId,
    sections: sectionsState,
    // Disabled until the recovery check for this draft has run and come up
    // empty: writing while a prompt is open would destroy the buffer on offer.
    enabled:
      !isBootstrapping &&
      recoveryCheckedFor === activeDraftId &&
      recoveryCandidate === null,
  });

  const restoreLocalDraft = useCallback(() => {
    const snapshot = recoveryCandidate;
    if (!snapshot || snapshot.draftId !== activeDraftId || !activeDraft) return;
    const merged = { ...activeDraft.sections, ...snapshot.sections };
    const progress = computeProgress(merged);
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === activeDraftId ? { ...d, sections: merged, progress } : d
      )
    );
    setRecoveryCandidate(null);
    void persistSectionEdit(activeDraftId, merged, progress);
    showToast('Restored your locally saved text');
  }, [recoveryCandidate, activeDraft, activeDraftId, persistSectionEdit, showToast]);

  const discardLocalDraft = useCallback(() => {
    const snapshot = recoveryCandidate;
    if (!snapshot) return;
    clearLocalSnapshot(snapshot.draftId);
    setRecoveryCandidate(null);
    showToast('Discarded the locally saved copy');
  }, [recoveryCandidate, showToast]);

  const insertMarkdownFormatting = useCallback(
    (sectionId: string, format: 'bold' | 'italic' | 'code' | 'list') => {
      const current = sectionsState[sectionId] || '';
      let inserted = '';
      if (format === 'bold') inserted = '**bold text**';
      else if (format === 'italic') inserted = '*italic text*';
      else if (format === 'code')
        inserted = '\n```typescript\n// implementation detail\n```\n';
      else if (format === 'list') inserted = '\n- Item 1\n- Item 2\n- Item 3\n';

      handleSectionChange(
        sectionId,
        current ? `${current}\n${inserted}` : inserted
      );
    },
    [sectionsState, handleSectionChange]
  );

  const handleAiImprove = useCallback(
    async (sectionId: string) => {
      if (!activeDraft) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        showToast('You are offline — reconnect to use AI improve.');
        return;
      }
      setAiLoading(sectionId);
      try {
        const current = sectionsState[sectionId] || '';
        const res = await aiImproveSectionApi(activeDraft.id, {
          sectionId,
          currentContent: current,
        });
        if (res?.improvedContent) {
          handleSectionChange(sectionId, res.improvedContent);
          const title =
            BUILDER_SECTIONS.find((s) => s.id === sectionId)?.title || sectionId;
          showToast(res.rationale || `Improved “${title}”`);
        }
      } catch (e) {
        showToast(
          friendlyApiMessage(e, 'Could not reach AI improve — try again shortly.')
        );
      } finally {
        setAiLoading(null);
      }
    },
    [activeDraft, sectionsState, handleSectionChange, showToast]
  );

  const handleAutoImproveAll = useCallback(async () => {
    setAiLoading('all');
    try {
      const updated = { ...sectionsState };
      if (!updated.stretchGoals || updated.stretchGoals.length < 20) {
        updated.stretchGoals =
          'Support for WebGL vector tile streaming and offline map canvas exporting (PNG/SVG).';
      }
      if (
        !updated.architecture ||
        !updated.architecture.toLowerCase().includes('benchmark')
      ) {
        updated.architecture =
          (updated.architecture || '') +
          '\n\nBenchmarking: automated load tests to verify cache latency under concurrent load.';
      }
      if (!updated.architecture?.toLowerCase().includes('test')) {
        updated.architecture =
          (updated.architecture || '') +
          '\n\nTesting: unit coverage for new modules plus integration checks on the critical path.';
      }

      const progress = computeProgress(updated);
      setDrafts((prevDrafts) =>
        prevDrafts.map((d) =>
          d.id === activeDraftId
            ? { ...d, sections: updated, progress, updatedAt: new Date().toISOString() }
            : d
        )
      );
      await persistSectionEdit(activeDraftId, updated, progress);
      showToast('Applied readiness fixes to weak sections');
    } finally {
      setAiLoading(null);
    }
  }, [sectionsState, activeDraftId, persistSectionEdit, showToast]);

  const cloneProposalToWorkspace = useCallback(
    (proposal: AcceptedProposal) => {
      const newId = `draft-${Date.now()}`;
      const newDraft: ProposalDraft = {
        id: newId,
        projectTitle: proposal.projectTitle,
        projectSlug: proposal.projectTitle.toLowerCase().replace(/\s+/g, '-'),
        orgName: proposal.orgName,
        orgSlug: proposal.orgName.toLowerCase().replace(/\s+/g, '-'),
        programName: proposal.programName,
        programSlug: proposal.programName.toLowerCase().includes('lfx')
          ? 'lfx'
          : 'gsoc',
        progress: 35,
        deadline: '30 April 2026',
        daysLeft: 45,
        mentorName: 'Core Maintainer',
        mentorRole: 'Project Lead',
        techStack: ['Python', 'TypeScript', 'React'],
        difficulty: 'Intermediate',
        acceptedExamplesCount: 4,
        communityContributionsCount: 2,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        sections: {
          summary: proposal.summary,
          problemStatement: `Based on accepted proposal structure:\n${proposal.summary}`,
          architecture: proposal.contentSnippet,
          timeline:
            'Phase 1 (Weeks 1-4): Setup & core design.\nPhase 2 (Weeks 5-8): Primary implementation.\nPhase 3 (Weeks 9-12): Testing & documentation.',
          deliverables:
            '1. Production implementation.\n2. Unit & integration tests.\n3. Documentation.',
          stretchGoals: 'Performance optimization and benchmark metrics.',
          communityContributions: 'PR #101 (Merged): Fixed starter issue.',
          aboutMe:
            'Computer Science undergrad passionate about open source collaboration.',
        },
      };

      setDrafts((prev) => [newDraft, ...prev]);
      setActiveDraftId(newId);
      setSelectedProposalPreview(null);
      setMode('workspace');
      setActiveTab('builder');
      setActiveSectionId(BUILDER_SECTIONS[0].id);
      showToast(`Cloned structure from ${proposal.projectTitle}`);
    },
    [showToast]
  );

  const copyProposalToClipboard = useCallback(() => {
    if (!activeDraft) return;
    const fullText = BUILDER_SECTIONS.map(
      (s) => `## ${s.title}\n\n${sectionsState[s.id] || '(Not specified)'}\n`
    ).join('\n---\n\n');
    void navigator.clipboard.writeText(fullText);
    showToast('Proposal markdown copied');
  }, [activeDraft, sectionsState, showToast]);

  const downloadMarkdownFile = useCallback(() => {
    if (!activeDraft) return;
    const author = 'Contributor';
    const dateStr = new Date().toISOString().split('T')[0];

    const yamlFrontmatter =
      `---\n` +
      `title: "${activeDraft.projectTitle.replace(/"/g, '\\"')}"\n` +
      `program: "${activeDraft.programName.replace(/"/g, '\\"')}"\n` +
      `organization: "${activeDraft.orgName.replace(/"/g, '\\"')}"\n` +
      `author: "${author}"\n` +
      `date: "${dateStr}"\n` +
      `deadline: "${(activeDraft.deadline || '').replace(/"/g, '\\"')}"\n` +
      `---\n\n`;

    const fullText =
      yamlFrontmatter +
      `# Proposal: ${activeDraft.projectTitle} (${activeDraft.programName})\n\n` +
      `**Organization**: ${activeDraft.orgName}\n\n` +
      `**Deadline**: ${activeDraft.deadline}\n\n` +
      BUILDER_SECTIONS.map(
        (s) =>
          `## ${s.title}\n\n${sectionsState[s.id] || '(Not specified)'}\n`
      ).join('\n---\n\n');

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal_${activeDraft.projectSlug || 'draft'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Markdown downloaded with YAML frontmatter');
  }, [activeDraft, sectionsState, showToast]);

  const downloadPdfFile = useCallback(async (): Promise<boolean> => {
    if (!activeDraft) return false;
    try {
      showToast('Generating PDF via Python ReportLab engine...');
      const payload = {
        title: activeDraft.projectTitle || 'Open Source Project Proposal',
        program: activeDraft.programName || 'Google Summer of Code',
        targetOrg: activeDraft.orgName || 'Open Source Organization',
        year: new Date().getFullYear(),
        author: 'Contributor',
        status: calculatedProgress >= 100 ? 'Ready for Submission' : 'Draft in Progress',
        sections: {
          summary: sectionsState.summary || '',
          problem: sectionsState.problemStatement || '',
          solution: sectionsState.architecture || '',
          deliverables: sectionsState.deliverables || '',
          timeline: sectionsState.timeline || '',
          testing: sectionsState.testing || '',
          risks: sectionsState.risks || '',
          aboutMe: sectionsState.aboutMe || '',
        },
      };

      const res = await fetch('/api/proposals/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMessage = res.statusText;
        try {
          const errJson = await res.json();
          if (errJson?.error) errMessage = errJson.error;
        } catch {
          // ignore json parse error
        }
        throw new Error(errMessage || `Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proposal_${activeDraft.projectSlug || 'draft'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully!');
      return true;
    } catch (err) {
      console.error(err);
      showToast('PDF engine unavailable — use Print to PDF (Ctrl+P) or download Markdown (.md).');
      return false;
    }
  }, [activeDraft, sectionsState, calculatedProgress, showToast]);

  const createDraft = useCallback(
    async (payload?: {
      projectTitle?: string;
      orgName?: string;
      programName?: string;
    }) => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          showToast('You are offline — reconnect to create a cloud draft.');
          setIsOfflineMode(true);
          return null;
        }
        const created = await createProposalDraft({
          projectTitle: payload?.projectTitle || 'New Project Proposal',
          orgName: payload?.orgName || 'Open Source Org',
          programName: payload?.programName || 'GSoC 2026',
        });
        if (created?.proposal) {
          setDrafts((prev) => [created.proposal, ...prev]);
          setActiveDraftId(created.proposal.id);
          setMode('workspace');
          setActiveTab('builder');
          setActiveSectionId(BUILDER_SECTIONS[0].id);
          setIsOfflineMode(false);
          showToast('New draft created');
          return created.proposal as ProposalDraft;
        }
      } catch (e) {
        if (isApiError(e) && e.isOffline) setIsOfflineMode(true);
        showToast(friendlyApiMessage(e, 'Could not create draft'));
      }
      return null;
    },
    [showToast]
  );

  const deleteDraft = useCallback(
    async (draftId: string) => {
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          showToast('You are offline — reconnect to delete cloud drafts.');
          return;
        }
        await deleteProposalDraft(draftId);
        // The draft is gone; its local buffer must not resurface as a
        // recovery prompt, and a still-running debounce must not rewrite it.
        if (draftId === activeDraftId) discardPendingLocalSave();
        clearLocalSnapshot(draftId);
        if (recoveryCandidate?.draftId === draftId) setRecoveryCandidate(null);
        setDrafts((prev) => {
          const next = prev.filter((d) => d.id !== draftId);
          if (activeDraftId === draftId && next.length > 0) {
            setActiveDraftId(next[0].id);
          }
          return next;
        });
        showToast('Draft deleted');
      } catch (e) {
        showToast(friendlyApiMessage(e, 'Failed to delete draft'));
      }
    },
    [activeDraftId, recoveryCandidate, discardPendingLocalSave, showToast]
  );

  const openWorkspace = useCallback(
    (draftId?: string, tab: StudioTab = 'builder') => {
      if (draftId) setActiveDraftId(draftId);
      setActiveTab(tab);
      setMode('workspace');
      setMobileNavOpen(false);
    },
    []
  );

  const goHub = useCallback(() => {
    setMode('hub');
    setMobileNavOpen(false);
  }, []);

  const selectTab = useCallback((tab: StudioTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  }, []);

  const localSavedAtMs = isoToDate(lastLocalSaveAt)?.getTime() ?? null;

  // Content, not clock order, decides whether the screen matches the server:
  // the local buffer is written after a successful PATCH by design, so a
  // timestamp comparison would drop a perfectly synced draft to "local".
  const currentSignature = useMemo(
    () => sectionsSignature(activeDraftId, sectionsState),
    [activeDraftId, sectionsState]
  );

  const syncState: StudioSyncState = useMemo(() => {
    if (saveStatus === 'saving') return 'saving';
    // Outage and failure outrank "safe on this device": the first thing worth
    // saying is that the cloud copy is behind, even though the text is saved.
    if (saveStatus === 'offline') return 'offline';
    if (saveStatus === 'error') return 'error';
    if (cloudSyncedSignature !== null && cloudSyncedSignature === currentSignature)
      return 'cloud';
    if (localSavedAtMs !== null) return 'local';
    return 'idle';
  }, [saveStatus, cloudSyncedSignature, currentSignature, localSavedAtMs]);

  const localSaveLabel = formatLocalSaveClock(lastLocalSaveAt);

  return {
    mode,
    drafts,
    activeDraft,
    activeDraftId,
    activeTab,
    activeSectionId,
    sidebarOpen,
    mobileNavOpen,
    librarySearch,
    selectedProgramTag,
    selectedProposalPreview,
    downloadQuota,
    isFeedbackModalOpen,
    sectionsState,
    saveStatus,
    syncState,
    localSaveLabel,
    recoveryCandidate,
    restoreLocalDraft,
    discardLocalDraft,
    flushLocalDraft,
    aiLoading,
    toastMessage,
    isBootstrapping,
    bootstrapError,
    isOfflineMode,
    filteredCatalog,
    calculatedProgress,
    scoreData,
    sectionStatus,
    setActiveDraftId,
    setActiveSectionId,
    setSidebarOpen,
    setMobileNavOpen,
    setLibrarySearch,
    setSelectedProgramTag,
    setSelectedProposalPreview,
    setIsFeedbackModalOpen,
    showToast,
    handleSectionChange,
    insertMarkdownFormatting,
    handleAiImprove,
    handleAutoImproveAll,
    cloneProposalToWorkspace,
    copyProposalToClipboard,
    downloadMarkdownFile,
    downloadPdfFile,
    createDraft,
    deleteDraft,
    openWorkspace,
    goHub,
    selectTab,
  };
}

export type ProposalStudioController = ReturnType<typeof useProposalStudio>;
