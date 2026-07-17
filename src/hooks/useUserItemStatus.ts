'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchUserItemStatus } from '@/lib/client/api';

/**
 * Hydrate save/track state for visible cards via POST /api/user/status.
 * Prefer SSR initial* props when available; this fills gaps after client navigation.
 */
export function useUserItemStatus(options: {
  projectIds?: string[];
  organizationIds?: string[];
  enabled?: boolean;
  /** When true, skip network if SSR already provided complete initial sets */
  skipIfEmpty?: boolean;
}) {
  const projectIds = options.projectIds || [];
  const organizationIds = options.organizationIds || [];
  const enabled = options.enabled !== false;

  const key = useMemo(
    () =>
      `${projectIds.slice(0, 50).join(',')}|${organizationIds.slice(0, 50).join(',')}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectIds.join(','), organizationIds.join(',')]
  );

  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());
  const [savedOrgs, setSavedOrgs] = useState<Set<string>>(new Set());
  const [trackedProjects, setTrackedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (projectIds.length === 0 && organizationIds.length === 0) return;

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const status = await fetchUserItemStatus(
          { projectIds, organizationIds },
          controller.signal
        );
        if (cancelled) return;
        setSavedProjects(new Set(status.savedProjectIds));
        setSavedOrgs(new Set(status.savedOrganizationIds));
        setTrackedProjects(new Set(status.trackedProjectIds));
      } catch (e) {
        if (cancelled || (e instanceof Error && e.name === 'AbortError')) return;
        setError(e instanceof Error ? e.message : 'Failed to load status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // key encodes ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return {
    savedProjects,
    savedOrgs,
    trackedProjects,
    loading,
    error,
    isSavedProject: (id: string) => savedProjects.has(id),
    isSavedOrg: (id: string) => savedOrgs.has(id),
    isTrackedProject: (id: string) => trackedProjects.has(id),
  };
}
