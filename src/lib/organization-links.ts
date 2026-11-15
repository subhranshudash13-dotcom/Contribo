type OrganizationLinkSource = {
  githubUrl?: string;
  websiteUrl?: string;
  projectsUrl?: string;
};

type ProjectLinkSource = {
  githubUrl?: string;
};

const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

function normalizeGithubUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  try {
    const url = new URL(value.trim());

    if (
      url.protocol !== 'https:' ||
      !GITHUB_HOSTS.has(url.hostname.toLowerCase()) ||
      url.username ||
      url.password ||
      (url.port && url.port !== '443')
    ) {
      return undefined;
    }

    const [owner] = url.pathname.split('/').filter(Boolean);
    if (!owner || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)) {
      return undefined;
    }

    return `https://github.com/${owner}`;
  } catch {
    return undefined;
  }
}

export function getOrganizationGithubUrl(
  organization: OrganizationLinkSource,
  projects: ProjectLinkSource[] = [],
): string | undefined {
  const directUrls = [
    organization.githubUrl,
    organization.websiteUrl,
    organization.projectsUrl,
  ];

  for (const value of directUrls) {
    const githubUrl = normalizeGithubUrl(value);

    if (githubUrl) {
      return githubUrl;
    }
  }

  const ownerCounts = new Map<string, number>();

  for (const project of projects) {
    const githubUrl = normalizeGithubUrl(project.githubUrl);

    if (!githubUrl) {
      continue;
    }

    const owner = githubUrl.replace('https://github.com/', '');
    ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1);
  }

  const inferredOwner = [...ownerCounts.entries()].sort(
    ([leftOwner, leftCount], [rightOwner, rightCount]) =>
      rightCount - leftCount || leftOwner.localeCompare(rightOwner),
  )[0]?.[0];

  return inferredOwner
    ? `https://github.com/${inferredOwner}`
    : undefined;
}
