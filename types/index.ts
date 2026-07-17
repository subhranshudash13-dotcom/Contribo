import { ObjectId } from 'mongodb';

export interface Program {
  _id?: ObjectId | string;
  name: string;
  slug: string;
  organizer: string;
  stipendRange: string;
  durationWeeks: number;
  tier: number;
  accentColor: string;
  eligibilitySummary: string;
  timeline: {
    event: string;
    date: Date | string;
  }[];
  lastVerifiedAt: Date | string;
  officialWebsite?: string;
  applicationSteps?: string[];
  difficulty?: string;
  pastStats?: {
    year: string;
    contributors: number;
    projects?: number;
    orgs?: number;
  }[];
  resources?: {
    title: string;
    url: string;
  }[];
}

export interface Organization {
  _id?: ObjectId | string;
  programId: ObjectId | string;
  name: string;
  slug: string;
  logoUrl?: string;
  backgroundColor?: string;
  description: string;
  websiteUrl?: string;
  category?: string;
  ideasUrl?: string;
  projectsUrl?: string;
  technologies: string[];
  topics: string[];
  years: number[];
  is2026?: boolean;
  projectCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Project {
  _id?: ObjectId | string;
  programId: ObjectId | string;
  org: string;
  orgSlug: string;
  title: string;
  description: string;
  difficulty?: string;
  techStack: string[];
  githubUrl?: string;
  applicationDeadline?: Date | string;
  thumbnail?: string;
  stars?: number;
  location?: string;
  orgSize?: string;
  mentors: string[];
  topics: string[];
  year: number;
  /** Optional denormalized program fields for matcher/UI */
  programName?: string;
  programColor?: string;
  createdAt?: Date | string;
}

export type ApplicationStatus =
  | 'saved'
  | 'researching'
  | 'drafting'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  projectId?: ObjectId | string;
  projectTitle: string;
  orgName: string;
  orgSlug?: string;
  programId?: ObjectId | string;
  programSlug?: string;
  programName?: string;
  status: ApplicationStatus;
  notes?: string;
  deadline?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type SavedItemType = 'project' | 'organization';

export interface SavedItem {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  type: SavedItemType;
  /** Target document id (project or organization) */
  targetId: ObjectId | string;
  /** Denormalized display fields */
  title: string;
  subtitle?: string;
  slug?: string;
  programSlug?: string;
  techStack?: string[];
  createdAt: Date | string;
}

export interface UserProfile {
  _id?: ObjectId | string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  skills?: string[];
  interests?: string[];
  experience?: string;
  availabilityHours?: number;
  location?: string;
  githubUsername?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  /** Never expose password hashes to clients */
  password?: never;
}

export interface PlatformStats {
  projects: number;
  organizations: number;
  programs: number;
  contributors: number;
}

export interface IngestionPayload {
  program: Program;
  organizations: Omit<Organization, '_id' | 'programId'>[];
  projects: Omit<Project, '_id' | 'programId'>[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
