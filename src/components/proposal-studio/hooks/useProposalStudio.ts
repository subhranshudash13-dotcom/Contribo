'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

function computeProgress(sections: Record<string, string>) {
  const filledCount = BUILDER_SECTIONS.filter((s) =>
    sectionFilled(sections[s.id], s.minChars)
  ).length;
  return Math.round((filledCount / BUILDER_SECTIONS.length) * 100);
}

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
    // showToast is stable enough; omit to avoid re-bootstrap loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                updatedAt: 'Just now',
              }
            : d
        );
      });
    },
    [activeDraftId, persistSectionEdit]
  );


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
            ? { ...d, sections: updated, progress, updatedAt: 'Just now' }
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
        updatedAt: 'Just now',
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
    const fullText =
      `# Proposal: ${activeDraft.projectTitle} (${activeDraft.programName})\n` +
      `**Organization**: ${activeDraft.orgName}\n` +
      `**Deadline**: ${activeDraft.deadline}\n\n` +
      BUILDER_SECTIONS.map(
        (s) =>
          `## ${s.title}\n\n${sectionsState[s.id] || '(Not specified)'}\n`
      ).join('\n---\n\n');

    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal_${activeDraft.projectSlug || 'draft'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Markdown downloaded');
  }, [activeDraft, sectionsState, showToast]);

  const downloadPdfFile = useCallback(async () => {
    if (!activeDraft) return;
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
        throw new Error(`PDF generation failed: ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proposal_${activeDraft.projectSlug || 'draft'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export PDF via Python engine');
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
    [activeDraftId, showToast]
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
