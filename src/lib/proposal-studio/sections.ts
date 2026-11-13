/** Current editor sections and their completion thresholds; safe on server and client. */
export const PROPOSAL_SECTION_MIN_CHARS = {
  summary: 40,
  problemStatement: 60,
  architecture: 80,
  deliverables: 40,
  timeline: 50,
  testing: 40,
  risks: 30,
  aboutMe: 40,
} as const;

export type ProposalSectionId = keyof typeof PROPOSAL_SECTION_MIN_CHARS;

export const PROPOSAL_SECTION_IDS = Object.keys(
  PROPOSAL_SECTION_MIN_CHARS
) as ProposalSectionId[];

export function calculateProposalProgress(sections: Record<string, string>): number {
  const filled = PROPOSAL_SECTION_IDS.filter(
    (id) => (sections[id] || '').trim().length >= PROPOSAL_SECTION_MIN_CHARS[id]
  ).length;
  return Math.round((filled / PROPOSAL_SECTION_IDS.length) * 100);
}
