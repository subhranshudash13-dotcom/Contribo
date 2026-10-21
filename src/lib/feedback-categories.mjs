export const FEEDBACK_CATEGORIES = [
  {
    value: 'Feature Request',
    label: '✨ Feature Request',
    showInContributorForm: true,
  },
  {
    value: 'New Program Proposal',
    label: '🚀 Suggest New Mentorship Program (GSoC/LFX/C4GT/etc.)',
    showInContributorForm: false,
  },
  {
    value: 'Proposal Library Addition',
    label: '📚 Suggest Proposal Sample for Library',
    showInContributorForm: false,
  },
  {
    value: 'Bug Report',
    label: '🐛 Bug Report',
    showInContributorForm: true,
  },
  {
    value: 'General Feedback',
    label: '💬 General Feedback',
    showInContributorForm: true,
  },
  {
    value: 'UI/UX',
    label: 'UI/UX',
    showInContributorForm: true,
  },
  {
    value: 'Data Issue',
    label: 'Data Issue',
    showInContributorForm: true,
  },
  {
    value: 'Other',
    label: 'Other',
    showInContributorForm: true,
  },
];

export const CONTRIBUTOR_FEEDBACK_CATEGORIES =
  FEEDBACK_CATEGORIES.filter((category) => category.showInContributorForm);

const FEEDBACK_CATEGORY_VALUES = new Set(
  FEEDBACK_CATEGORIES.map((category) => category.value)
);

export function isFeedbackCategory(value) {
  return typeof value === 'string' && FEEDBACK_CATEGORY_VALUES.has(value);
}

export function normalizeFeedbackCategory(value) {
  if (value === undefined) return 'Feature Request';
  if (typeof value !== 'string') return null;

  const category = value.trim();
  return isFeedbackCategory(category) ? category : null;
}
