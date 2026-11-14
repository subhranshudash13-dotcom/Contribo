export type ReadinessTier =
  | 'Foundational Contributor'
  | 'Active Explorer'
  | 'Program Ready'
  | 'Distinguished Fellow';

export interface ReadinessTierInfo {
  tier: ReadinessTier;
  label: string;
  color: string;
  bgClass: string;
  badgeColor: string;
  description: string;
}

export interface PassportTargetOrg {
  name: string;
  slug: string;
  logoUrl?: string;
  programSlug?: string;
}

export interface PublicPassportData {
  isPrivate: boolean;
  username: string;
  name: string;
  githubUsername: string;
  avatarUrl: string;
  bio: string;
  score: number;
  completedSignals: number;
  totalSignals: number;
  ready: boolean;
  hint: string;
  tier: ReadinessTierInfo;
  skills: string[];
  targetOrganizations: PassportTargetOrg[];
  applicationsCount: number;
  visibility: 'public' | 'unlisted' | 'private';
  updatedAt?: string | Date;
}

export interface ReadinessSignalItem {
  id: string;
  title: string;
  description: string;
  weight: number;
  completed: boolean;
}

/**
 * Sanitize raw username input for lookup and URL routing.
 * Strips whitespace, leading '@', non-alphanumeric chars (allowing - and _), bounded to 39 chars.
 */
export function sanitizeUsername(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 39);
}

/**
 * Map readiness score (0-100) to standard Contribo tiers.
 */
export function getReadinessTier(score: number): ReadinessTierInfo {
  const bounded = Math.min(Math.max(Number.isFinite(score) ? score : 0, 0), 100);

  if (bounded >= 90) {
    return {
      tier: 'Distinguished Fellow',
      label: 'Distinguished',
      color: '#8b5cf6',
      bgClass: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      badgeColor: '#8b5cf6',
      description: 'Top-tier open-source applicant with verified milestones and end-to-end readiness.',
    };
  }

  if (bounded >= 70) {
    return {
      tier: 'Program Ready',
      label: 'Program Ready',
      color: '#10b981',
      bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badgeColor: '#10b981',
      description: 'Fully prepared for application cycles with tracked proposals and target orgs.',
    };
  }

  if (bounded >= 40) {
    return {
      tier: 'Active Explorer',
      label: 'Active Explorer',
      color: '#f59e0b',
      bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badgeColor: '#f59e0b',
      description: 'Actively researching projects, bookmarking organizations, and developing skills.',
    };
  }

  return {
    tier: 'Foundational Contributor',
    label: 'Foundational',
    color: '#64748b',
    bgClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badgeColor: '#64748b',
    description: 'Setting up development environment and exploring open-source programs.',
  };
}

/**
 * Breakdown 4 product signals into structured checklist items.
 */
export function getReadinessSignals(
  displayName?: string | null,
  skills?: string[] | null,
  savedCount = 0,
  applicationCount = 0
): ReadinessSignalItem[] {
  const name = typeof displayName === 'string' ? displayName.trim() : '';
  const hasRealName = name.length > 0 && name !== 'Contributor';
  const hasSkills = Array.isArray(skills)
    ? skills.some((s) => typeof s === 'string' && s.trim().length > 0)
    : false;
  const hasSavedOrg = savedCount > 0;
  const hasApplication = applicationCount > 0;

  return [
    {
      id: 'profile-name',
      title: 'Identity & Display Name',
      description: 'Public profile configured with personal identity',
      weight: 10,
      completed: hasRealName,
    },
    {
      id: 'skills-stack',
      title: 'Technical Skills Matrix',
      description: 'Programming languages and frameworks registered',
      weight: 25,
      completed: hasSkills,
    },
    {
      id: 'target-orgs',
      title: 'Target Organizations',
      description: 'At least one target open-source organization bookmarked',
      weight: 30,
      completed: hasSavedOrg,
    },
    {
      id: 'active-application',
      title: 'Application Milestones',
      description: 'Active application or proposal draft tracked',
      weight: 35,
      completed: hasApplication,
    },
  ];
}

/**
 * XML entity escaping helper for SVG generation.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface BadgeOptions {
  score?: number;
  tierLabel?: string;
  isPrivate?: boolean;
  notFound?: boolean;
  leftLabel?: string;
}

/**
 * Generates an SVG badge modeled after Shields.io standards.
 * Guaranteed valid XML, responsive font scaling, and accessible metadata.
 */
export function generatePassportBadgeSvg({
  score = 0,
  tierLabel,
  isPrivate = false,
  notFound = false,
  leftLabel = 'Contribo Readiness',
}: BadgeOptions = {}): string {
  const boundedScore = Math.min(Math.max(Number.isFinite(score) ? score : 0, 0), 100);
  const tier = getReadinessTier(boundedScore);

  let rightValue = `${boundedScore}% · ${tierLabel || tier.label}`;
  let rightBgColor = tier.badgeColor;

  if (notFound) {
    rightValue = 'not found';
    rightBgColor = '#ef4444';
  } else if (isPrivate) {
    rightValue = 'private';
    rightBgColor = '#6b7280';
  }

  // Calculate widths based on character lengths
  const leftWidth = Math.max(leftLabel.length * 7 + 16, 120);
  const rightWidth = Math.max(rightValue.length * 7 + 16, 70);
  const totalWidth = leftWidth + rightWidth;

  const leftTextX = (leftWidth / 2) * 10;
  const rightTextX = (leftWidth + rightWidth / 2) * 10;

  const safeLeft = escapeXml(leftLabel);
  const safeRight = escapeXml(rightValue);
  const title = `aria-label="${safeLeft}: ${safeRight}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" ${title}>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="#24292f"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${rightBgColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${leftTextX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${safeLeft}</text>
    <text x="${leftTextX}" y="140" transform="scale(.1)" fill="#fff">${safeLeft}</text>
    <text aria-hidden="true" x="${rightTextX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)">${safeRight}</text>
    <text x="${rightTextX}" y="140" transform="scale(.1)" fill="#fff">${safeRight}</text>
  </g>
</svg>`;
}
