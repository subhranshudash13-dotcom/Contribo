export type IssueDifficulty = 'easy' | 'medium' | 'hard';
export type IssueScope = 'quick-fix' | 'feature-slice' | 'deep-dive';
export type ContributionStatus = 'discovered' | 'claimed' | 'in-progress' | 'pr-submitted' | 'merged';

export interface IssueRecord {
  id: string;
  title: string;
  description: string;
  repo: string;
  orgSlug: string;
  orgName: string;
  program: string;
  issueUrl: string;
  number: number;
  labels: string[];
  languages: string[];
  difficulty: IssueDifficulty;
  scope: IssueScope;
  estimatedHours: number;
  commentsCount: number;
  createdAt: string;
  hasMentorAssigned: boolean;
  mentorGuideText?: string;
  matchScore?: number;
  matchReasons?: string[];
}

export interface IssueListFilter {
  search?: string | null;
  language?: string | null;
  program?: string | null;
  difficulty?: string | null;
  scope?: string | null;
  hasMentor?: boolean | null;
  sortBy?: 'recommended' | 'newest' | 'comments-asc' | 'effort-asc' | null;
  page?: number;
  limit?: number;
}

export interface UserSkillProfile {
  skills: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  availableHoursPerWeek?: number;
}

export interface TrackedTask {
  issueId: string;
  issue: IssueRecord;
  status: ContributionStatus;
  updatedAt: string;
  prUrl?: string;
  notes?: string;
}

export interface IssueQueryResult {
  issues: IssueRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: {
    languages: Record<string, number>;
    programs: Record<string, number>;
    difficulties: Record<string, number>;
  };
}
