/**
 * Browser-side API helpers for Contribo.
 * Prefer server repositories for SSR; use these for client interactivity.
 */

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

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof (data as { error?: string }).error === 'string'
        ? (data as { error: string }).error
        : res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}

/** GET /api/meta/filters — cached by browser for a short period via Cache-Control. */
export async function fetchFilterFacets(options?: {
  program?: string;
  signal?: AbortSignal;
}): Promise<FilterFacetsResponse> {
  const qs = new URLSearchParams();
  if (options?.program) qs.set('program', options.program);
  const path = qs.toString() ? `/api/meta/filters?${qs}` : '/api/meta/filters';
  const res = await fetch(path, { signal: options?.signal });
  return parseJson(res);
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
  const res = await fetch(`/api/trending?${qs}`, { signal: options?.signal });
  return parseJson(res);
}

/** POST /api/user/status — batch saved/tracked lookup (requires session cookie). */
export async function fetchUserItemStatus(
  body: { projectIds?: string[]; organizationIds?: string[] },
  signal?: AbortSignal
): Promise<UserStatusResponse> {
  const res = await fetch('/api/user/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
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
  return parseJson(res);
}
