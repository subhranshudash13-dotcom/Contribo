/**
 * Browser-side API helpers for Contribo.
 * Prefer server repositories for SSR; use these for client interactivity.
 *
 * All calls go through apiJson/apiFetch which handle:
 * - offline pre-check
 * - timeouts
 * - stable ApiError codes for UI (offline, timeout, unauthorized, …)
 */

import { ApiError, friendlyApiMessage, isApiError } from './errors';
import { apiFetch, apiJson, jsonBody, parseJsonResponse } from './request';

import type { ProposalDraft, AcceptedProposal, ProjectGuide } from '@/lib/proposal-studio/data';

export { ApiError, friendlyApiMessage, isApiError };
export type { ApiErrorCode } from './errors';

export type FilterFacetsResponse = {
  technologies: string[];
  difficulties: string[];
  years: number[];
  topics: string[];
  orgCategories: string[];
  meta?: { generatedAt?: string };
};

export type TrendingResponse = {
  projects: Array<{
    _id?: string;
    title?: string;
    org?: string;
    orgSlug?: string;
    difficulty?: string;
    techStack?: string[];
    stars?: number;
    description?: string;
    programId?: string;
    programName?: string;
    year?: number;
  }>;
  total: number;
  domain: string;
};

export type UserStatusResponse = {
  savedProjectIds: string[];
  savedOrganizationIds: string[];
  trackedProjectIds: string[];
  savedProjects?: Record<string, boolean>;
  savedOrganizations?: Record<string, boolean>;
  trackedProjects?: Record<string, boolean>;
};

export type MatchRequest = {
  skills: string[];
  experience?: string;
  location?: string;
  availability?: number;
  difficulty?: string;
  programSlugs?: string[];
};

export type MatchResult = {
  id?: string;
  projectId?: string;
  title: string;
  orgName: string;
  orgSlug?: string;
  techStack: string[];
  description: string;
  matchPercentage: number;
  reasoning: string;
  programName: string;
  programColor: string;
  programSlug?: string;
  difficulty?: string;
  year?: number;
  matchedSkills?: string[];
  githubUrl?: string;
  orgLogoUrl?: string;
  orgWebsiteUrl?: string;
  orgGithubUrl?: string;
  orgCategory?: string;
  orgDescription?: string;
  orgIdeasUrl?: string;
  orgTopics?: string[];
  yearlyStats?: Array<{ year: number; count: number }>;
  stars?: number;
  mentors?: string[];
};

export type MatchResponse = {
  matches: MatchResult[];
  meta?: {
    candidateCount?: number;
    resultCount?: number;
    mode?: string;
  };
};

export type SaveItemPayload = {
  type: 'project' | 'organization';
  targetId: string;
  title: string;
  subtitle?: string;
  slug?: string;
  programSlug?: string;
  techStack?: string[];
};

export type TrackApplicationPayload = {
  projectId?: string;
  projectTitle: string;
  orgName: string;
  orgSlug?: string;
  programId?: string;
  programSlug?: string;
  programName?: string;
  status?: string;
  notes?: string;
  deadline?: string | null;
};

export type ConnectivityResponse = {
  online: boolean;
  clientOnline: boolean;
  serverReachable: boolean;
  mongodb?: 'up' | 'down' | 'unknown';
  /** 'ok' | 'degraded' when the API responded */
  status?: 'ok' | 'degraded' | 'error';
  latencyMs?: number;
  timestamp: string;
};

// ─── Connectivity ───────────────────────────────────────────────────────────

/**
 * GET /api/connectivity — lightweight probe used by offline UI.
 * Always attempts the request so we can detect "browser online but API down".
 * Does not throw on degraded (HTTP 200 with mongodb:down) — only network failure
 * marks serverReachable=false.
 */
export async function checkConnectivity(
  signal?: AbortSignal
): Promise<ConnectivityResponse> {
  const clientOnline =
    typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  const started = Date.now();

  try {
    const res = await apiFetch('/api/connectivity', {
      signal,
      timeoutMs: 8_000,
      allowOfflineAttempt: true,
    });

    // Parse body even on non-2xx (legacy 503 responses) so we still classify state.
    const text = await res.text().catch(() => '');
    let data: {
      status?: string;
      online?: boolean;
      mongodb?: 'up' | 'down' | 'unknown';
      latencyMs?: number;
      timestamp?: string;
    } = {};
    if (text) {
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        // non-JSON body
      }
    }

    const serverReachable = res.ok || res.status === 503;
    const mongodb = data.mongodb ?? (res.ok ? 'unknown' : 'down');
    const status: ConnectivityResponse['status'] =
      data.status === 'degraded' || mongodb === 'down'
        ? 'degraded'
        : res.ok
          ? 'ok'
          : 'error';

    return {
      // "online" for UI banners = browser + API process reachable (DB may be degraded)
      online: clientOnline && serverReachable,
      clientOnline,
      serverReachable,
      mongodb,
      status,
      latencyMs: data.latencyMs ?? Date.now() - started,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch {
    return {
      online: false,
      clientOnline,
      serverReachable: false,
      mongodb: 'unknown',
      status: 'error',
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    };
  }
}

// ─── Public catalog ─────────────────────────────────────────────────────────

/** GET /api/meta/filters */
export async function fetchFilterFacets(options?: {
  program?: string;
  signal?: AbortSignal;
}): Promise<FilterFacetsResponse> {
  const qs = new URLSearchParams();
  if (options?.program) qs.set('program', options.program);
  const path = qs.toString() ? `/api/meta/filters?${qs}` : '/api/meta/filters';
  return apiJson(path, { signal: options?.signal });
}

/** GET /api/trending */
export async function fetchTrending(options?: {
  domain?: string;
  program?: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<TrendingResponse> {
  const qs = new URLSearchParams();
  if (options?.domain) qs.set('domain', options.domain);
  if (options?.program) qs.set('program', options.program);
  if (options?.limit) qs.set('limit', String(options.limit));
  return apiJson(`/api/trending?${qs}`, { signal: options?.signal });
}

/** GET /api/search */
export async function fetchSearch(
  query: string,
  options?: { type?: string; limit?: number; signal?: AbortSignal }
) {
  const qs = new URLSearchParams({ q: query });
  if (options?.type) qs.set('type', options.type);
  if (options?.limit) qs.set('limit', String(options.limit));
  return apiJson<{
    programs: unknown[];
    organizations: unknown[];
    projects: unknown[];
    meta: { query: string; total: number; type?: string };
  }>(`/api/search?${qs}`, { signal: options?.signal, timeoutMs: 15_000 });
}

/** GET /api/organizations */
export async function fetchOrganizations(
  params: Record<string, string | number | undefined | null>,
  signal?: AbortSignal
) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).length > 0) {
      qs.set(k, String(v));
    }
  }
  return apiJson<{
    organizations: unknown[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }>(`/api/organizations?${qs}`, { signal });
}

/** GET /api/projects */
export async function fetchProjects(
  params: Record<string, string | number | undefined | null>,
  signal?: AbortSignal
) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).length > 0) {
      qs.set(k, String(v));
    }
  }
  return apiJson<{
    projects: unknown[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }>(`/api/projects?${qs}`, { signal });
}

/** GET /api/programs */
export async function fetchPrograms(signal?: AbortSignal) {
  return apiJson<{ programs: unknown[]; total?: number }>('/api/programs', {
    signal,
  });
}

/** GET /api/stats */
export async function fetchStats(signal?: AbortSignal) {
  return apiJson<Record<string, unknown>>('/api/stats', { signal });
}

/** GET /api/guidelines */
export async function fetchGuidelines(options?: {
  program?: string;
  signal?: AbortSignal;
}) {
  const qs = new URLSearchParams();
  if (options?.program) qs.set('program', options.program);
  const path = qs.toString() ? `/api/guidelines?${qs}` : '/api/guidelines';
  return apiJson<{
    guideline?: unknown;
    guidelines: unknown[];
    total?: number;
  }>(path, { signal: options?.signal });
}

/** GET /api/health */
export async function fetchHealth(signal?: AbortSignal) {
  return apiJson<{
    status: string;
    mongodb?: string;
    latencyMs?: number;
    timestamp?: string;
  }>('/api/health', { signal, timeoutMs: 8_000, allowOfflineAttempt: true });
}

/** POST /api/match — AI + heuristic project matcher */
export async function runMatcher(
  body: MatchRequest,
  signal?: AbortSignal
): Promise<MatchResponse> {
  return apiJson(
    '/api/match',
    jsonBody('POST', body, { signal, timeoutMs: 60_000 })
  );
}

// ─── Authenticated user APIs ────────────────────────────────────────────────

/** POST /api/user/status — batch saved/tracked lookup (requires session cookie). */
export async function fetchUserItemStatus(
  body: { projectIds?: string[]; organizationIds?: string[] },
  signal?: AbortSignal
): Promise<UserStatusResponse> {
  try {
    const res = await apiFetch(
      '/api/user/status',
      jsonBody('POST', body, { signal, timeoutMs: 12_000 })
    );
    if (res.status === 401) {
      return {
        savedProjectIds: [],
        savedOrganizationIds: [],
        trackedProjectIds: [],
        savedProjects: {},
        savedOrganizations: {},
        trackedProjects: {},
      };
    }
    return parseJsonResponse(res);
  } catch (error) {
    // Soft-fail status hydration so cards still render when offline/unauth.
    if (isApiError(error) && (error.status === 401 || error.isOffline)) {
      return {
        savedProjectIds: [],
        savedOrganizationIds: [],
        trackedProjectIds: [],
        savedProjects: {},
        savedOrganizations: {},
        trackedProjects: {},
      };
    }
    throw error;
  }
}

/** GET /api/user */
export async function fetchCurrentUser(signal?: AbortSignal) {
  return apiJson<{ user: Record<string, unknown> }>('/api/user', { signal });
}

/** PATCH /api/user */
export async function updateCurrentUser(
  body: {
    name?: string;
    skills?: string[];
    interests?: string[];
    experience?: string;
    availabilityHours?: number;
    location?: string;
    githubUsername?: string;
  },
  signal?: AbortSignal
) {
  return apiJson<{ user: Record<string, unknown> }>(
    '/api/user',
    jsonBody('PATCH', body, { signal })
  );
}

/** DELETE /api/user — purge account (requires explicit confirm token). */
export async function deleteCurrentUser(signal?: AbortSignal) {
  return apiJson<{ success: boolean; message?: string }>(
    '/api/user',
    jsonBody('DELETE', { confirm: 'DELETE' }, { signal })
  );
}

/** GET /api/user/dashboard */
export async function fetchUserDashboard(signal?: AbortSignal) {
  return apiJson<{
    savedCount: number;
    applicationCount: number;
    activeDeadlineCount: number;
    applications: unknown[];
    savedItems: unknown[];
  }>('/api/user/dashboard', { signal });
}

/** POST /api/user/saved */
export async function saveUserItem(payload: SaveItemPayload, signal?: AbortSignal) {
  return apiJson<{ item: Record<string, unknown> }>(
    '/api/user/saved',
    jsonBody('POST', payload, { signal })
  );
}

/** DELETE /api/user/saved */
export async function unsaveUserItem(
  options: { id?: string; type?: string; targetId?: string },
  signal?: AbortSignal
) {
  const qs = new URLSearchParams();
  if (options.id) qs.set('id', options.id);
  if (options.type) qs.set('type', options.type);
  if (options.targetId) qs.set('targetId', options.targetId);
  try {
    return await apiJson<{ success: boolean }>(`/api/user/saved?${qs}`, {
      method: 'DELETE',
      signal,
    });
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return { success: true };
    }
    throw error;
  }
}

/** POST /api/user/applications */
export async function createUserApplication(
  payload: TrackApplicationPayload,
  signal?: AbortSignal
) {
  return apiJson<{ application: Record<string, unknown>; created: boolean }>(
    '/api/user/applications',
    jsonBody('POST', payload, { signal })
  );
}

/** PATCH /api/user/applications */
export async function updateUserApplication(
  body: {
    id: string;
    status?: string;
    notes?: string;
    deadline?: string | null;
    projectTitle?: string;
  },
  signal?: AbortSignal
) {
  return apiJson<{ application: Record<string, unknown> }>(
    '/api/user/applications',
    jsonBody('PATCH', body, { signal })
  );
}

/** DELETE /api/user/applications */
export async function deleteUserApplication(id: string, signal?: AbortSignal) {
  return apiJson<{ success: boolean }>(
    `/api/user/applications?id=${encodeURIComponent(id)}`,
    { method: 'DELETE', signal }
  );
}

// ─── Proposal Studio APIs ──────────────────────────────────────────────────

/** GET /api/proposals */
export async function fetchProposals(signal?: AbortSignal) {
  return apiJson<{ proposals: ProposalDraft[] }>('/api/proposals', { signal });
}

/** GET /api/proposals/[id] */
export async function fetchProposalById(id: string, signal?: AbortSignal) {
  return apiJson<{ proposal: ProposalDraft }>(
    `/api/proposals/${encodeURIComponent(id)}`,
    { signal }
  );
}

/** POST /api/proposals */
export async function createProposalDraft(
  payload: {
    projectTitle: string;
    orgName: string;
    programName?: string;
    mentorName?: string;
    techStack?: string[];
  },
  signal?: AbortSignal
) {
  return apiJson<{ proposal: ProposalDraft }>(
    '/api/proposals',
    jsonBody('POST', payload, { signal })
  );
}

/** PATCH /api/proposals/[id] */
export async function updateProposalDraft(
  id: string,
  body: {
    sections?: Record<string, string>;
    progress?: number;
    projectTitle?: string;
  },
  signal?: AbortSignal
) {
  return apiJson<{ proposal: ProposalDraft }>(
    `/api/proposals/${encodeURIComponent(id)}`,
    jsonBody('PATCH', body, { signal })
  );
}

/** POST /api/proposals/[id]/ai-improve */
export async function aiImproveSectionApi(
  id: string,
  body: { sectionId: string; currentContent: string },
  signal?: AbortSignal
) {
  return apiJson<{
    sectionId: string;
    improvedContent: string;
    rationale: string;
  }>(
    `/api/proposals/${encodeURIComponent(id)}/ai-improve`,
    jsonBody('POST', body, { signal, timeoutMs: 45_000 })
  );
}

/** DELETE /api/proposals/[id] */
export async function deleteProposalDraft(id: string, signal?: AbortSignal) {
  return apiJson<{ success: boolean }>(
    `/api/proposals/${encodeURIComponent(id)}`,
    { method: 'DELETE', signal }
  );
}

/** GET /api/proposals/examples */
export async function fetchProposalExamples(project?: string, signal?: AbortSignal) {
  const qs = project ? `?project=${encodeURIComponent(project)}` : '';
  return apiJson<{ examples: AcceptedProposal[] }>(`/api/proposals/examples${qs}`, { signal });
}

/** GET /api/proposals/guide */
export async function fetchProposalGuide(
  project?: string,
  org?: string,
  signal?: AbortSignal
) {
  const qs = new URLSearchParams();
  if (project) qs.set('project', project);
  if (org) qs.set('org', org);
  return apiJson<{ guide: ProjectGuide }>(`/api/proposals/guide?${qs}`, { signal });
}

/** POST /api/feedback */
export async function submitUserFeedback(
  body: {
    type?: string;
    subject?: string;
    message: string;
    userEmail?: string;
  },
  signal?: AbortSignal
) {
  return apiJson<{ success: boolean; message: string }>(
    '/api/feedback',
    jsonBody('POST', body, { signal })
  );
}
