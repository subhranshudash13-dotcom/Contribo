/**
 * Resolves the destination for a saved bookmark row.
 *
 * Projects in Contribo do not have a detail page — the only project surface is
 * `src/app/projects/page.tsx`, which filters its listing with query parameters.
 * A bookmarked project therefore links to the listing, pre-filtered so the saved
 * item is findable. Organizations do have `/organizations/[slug]`, so a bookmarked
 * organization links straight to it.
 *
 * If a dedicated project detail page is added later, only `savedItemHref` needs to
 * change; every caller goes through it.
 */

export type SavedItemLinkSource = {
  type?: string;
  title?: string;
  slug?: string;
  targetId?: string;
};

function clean(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Returns the href a bookmark should link to, or `null` when there is no valid
 * destination — callers must then render plain text instead of a link.
 */
export function savedItemHref(item: SavedItemLinkSource): string | null {
  if (item.type === 'project') {
    // Encoded by hand rather than with URLSearchParams.toString(), which emits
    // `+` for spaces; `%20` survives every server and proxy unambiguously.
    const params: string[] = [];

    const title = clean(item.title);
    if (title) params.push(`q=${encodeURIComponent(title)}`);

    // For project saves `slug` holds the organization slug (see ProjectCard's
    // SaveButton payload), which narrows the listing to the bookmarked project.
    const orgSlug = clean(item.slug);
    if (orgSlug) params.push(`orgSlug=${encodeURIComponent(orgSlug)}`);

    return params.length > 0 ? `/projects?${params.join('&')}` : '/projects';
  }

  if (item.type === 'organization') {
    const slug = clean(item.slug);
    return slug ? `/organizations/${encodeURIComponent(slug)}` : null;
  }

  return null;
}
