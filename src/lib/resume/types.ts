export type ResumeTheme = 'minimalist' | 'modern' | 'academic';

export interface ResumeImpactBullet {
  id: string;
  action: string; // What was accomplished [X]
  metric: string; // As measured by [Y]
  method: string; // By doing [Z]
  fullText: string;
  category: 'Full-Stack' | 'Systems' | 'Testing' | 'Performance' | 'Collaboration';
}

export interface ResumeProjectItem {
  id: string;
  title: string;
  role: string;
  organization: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
  bullets: ResumeImpactBullet[];
  technologies: string[];
}

export interface ResumeWorkExperience {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  summary: string;
  bullets: string[];
  skills: string[];
}

export interface ResumeSkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeAward {
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

export interface ResumeData {
  basics: {
    name: string;
    username: string;
    githubUsername: string;
    label: string;
    avatarUrl?: string;
    email?: string;
    location?: string;
    summary: string;
    passportUrl: string;
    readinessTier: string;
    readinessScore: number;
  };
  featuredProjects: ResumeProjectItem[];
  workExperience: ResumeWorkExperience[];
  skills: ResumeSkillCategory[];
  awards: ResumeAward[];
  theme: ResumeTheme;
  showQrCode: boolean;
  showReadinessBadge: boolean;
}

/**
 * Standard Schema.org / JSON-Resume specification interface
 */
export interface JsonResumeSchema {
  $schema?: string;
  basics: {
    name: string;
    label: string;
    image?: string;
    summary: string;
    url: string;
    profiles: Array<{
      network: string;
      username: string;
      url: string;
    }>;
  };
  work: Array<{
    name: string;
    position: string;
    startDate?: string;
    endDate?: string;
    summary: string;
    highlights: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    highlights: string[];
    keywords: string[];
    url?: string;
    roles?: string[];
  }>;
  skills: Array<{
    name: string;
    level?: string;
    keywords: string[];
  }>;
  awards: Array<{
    title: string;
    date: string;
    awarder: string;
    summary: string;
  }>;
  meta: {
    canonical?: string;
    version: string;
    lastModified: string;
    generator: string;
  };
}
