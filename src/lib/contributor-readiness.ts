export type ContributorReadiness = {
  score: number;
  completed: number;
  total: number;
  hint: string;
  ready: boolean;
};

type ReadinessInput = {
  displayName?: string | null;
  skills?: string[] | null;
  savedCount: number;
  applicationCount: number;
};

const TOTAL_SIGNALS = 4;
const SIGNAL_POINTS = {
  displayName: 10,
  skills: 25,
  savedOrganization: 30,
  application: 35,
} as const;

/**
 * Four onboarding signals with the product weights from issue #41. The score
 * is derived from the current dashboard state and only moves up as steps are
 * completed.
 */
export function calculateContributorReadiness({
  displayName,
  skills,
  savedCount,
  applicationCount,
}: ReadinessInput): ContributorReadiness {
  const name = typeof displayName === 'string' ? displayName.trim() : '';
  const hasRealName = name.length > 0 && name !== 'Contributor';
  const hasSkills = Array.isArray(skills)
    ? skills.some((skill) => typeof skill === 'string' && skill.trim().length > 0)
    : false;
  const hasSavedOrganization = savedCount > 0;
  const hasApplication = applicationCount > 0;

  const completed = [
    hasRealName,
    hasSkills,
    hasSavedOrganization,
    hasApplication,
  ].filter(Boolean).length;
  const score =
    (hasRealName ? SIGNAL_POINTS.displayName : 0) +
    (hasSkills ? SIGNAL_POINTS.skills : 0) +
    (hasSavedOrganization ? SIGNAL_POINTS.savedOrganization : 0) +
    (hasApplication ? SIGNAL_POINTS.application : 0);

  let hint = 'Complete your profile to get started';
  if (completed === TOTAL_SIGNALS) {
    hint = 'Profile active & ready';
  } else if (completed > 0) {
    if (!hasRealName) hint = 'Set your display name';
    else if (!hasSkills) hint = 'Add skills to your profile';
    else if (!hasSavedOrganization) hint = 'Save a target organization';
    else if (!hasApplication) hint = 'Track your first application';
  }

  return {
    score,
    completed,
    total: TOTAL_SIGNALS,
    hint,
    ready: score === 100,
  };
}
