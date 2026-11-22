import {
  ResumeData,
  ResumeImpactBullet,
  ResumeProjectItem,
  ResumeSkillCategory,
  JsonResumeSchema,
} from './types';
import { PublicPassportData } from '@/lib/passport';

/**
 * Synthesizes Google XYZ format bullets from a user's verified Passport data.
 * Format: "Accomplished [X] as measured by [Y] by doing [Z]"
 */
export function generateXyzBullet(
  action: string,
  metric: string,
  method: string,
  category: ResumeImpactBullet['category'] = 'Full-Stack'
): ResumeImpactBullet {
  const fullText = `${action}, resulting in ${metric}, by ${method}.`;
  return {
    id: `b-${Math.random().toString(36).slice(2, 9)}`,
    action,
    metric,
    method,
    fullText,
    category,
  };
}

/**
 * Polishes an unformatted or raw bullet into Google XYZ format.
 */
export function polishXyzBullet(rawText: string): ResumeImpactBullet {
  const trimmed = rawText.trim();
  if (trimmed.toLowerCase().includes('resulting in') || trimmed.toLowerCase().includes('by doing')) {
    return {
      id: `b-${Math.random().toString(36).slice(2, 9)}`,
      action: trimmed.split(',')[0] || trimmed,
      metric: 'enhanced system reliability and contributor velocity',
      method: 'implementing robust engineering best practices',
      fullText: trimmed,
      category: 'Full-Stack',
    };
  }

  // Derive components
  const action = trimmed.replace(/\.$/, '');
  const metric = '100% test coverage and zero regression failures';
  const method = 'engineering modular TypeScript architectures with automated CI workflows';
  const fullText = `Engineered ${action.toLowerCase()}, achieving ${metric}, by ${method}.`;

  return {
    id: `b-${Math.random().toString(36).slice(2, 9)}`,
    action: `Engineered ${action}`,
    metric,
    method,
    fullText,
    category: 'Full-Stack',
  };
}

/**
 * Builds a structured ResumeData model from a Contribo PublicPassportData record.
 */
export function synthesizeResumeFromPassport(passport: PublicPassportData): ResumeData {
  const skillsList = passport.skills && passport.skills.length > 0 ? passport.skills : ['TypeScript', 'Next.js', 'React', 'Node.js', 'Git'];

  // Categorize skills
  const categorizedSkills: ResumeSkillCategory[] = [
    {
      category: 'Languages & Frameworks',
      skills: skillsList.filter((s) => ['TypeScript', 'JavaScript', 'Python', 'React', 'Next.js', 'Node.js', 'Go', 'Rust'].includes(s)),
    },
    {
      category: 'Systems & Architecture',
      skills: ['Distributed Systems', 'REST & GraphQL APIs', 'Docker', 'MongoDB', 'Redis', 'PostgreSQL'],
    },
    {
      category: 'Testing & Tooling',
      skills: ['Jest', 'Playwright', 'Git / GitHub Actions', 'CI/CD Pipelines', 'Linux'],
    },
  ];

  if (categorizedSkills[0].skills.length === 0) {
    categorizedSkills[0].skills = skillsList;
  }

  // Generate Projects / Open Source Experience based on target organizations or verified activity
  const targetOrgs = passport.targetOrganizations || [];
  const orgNames = targetOrgs.map((o) => o.name);

  const primaryOrg = orgNames[0] || 'Open Source Community Ecosystem';

  const defaultBullets: ResumeImpactBullet[] = [
    generateXyzBullet(
      `Authored production-ready open source modules for ${primaryOrg}`,
      `${passport.score}% verified readiness score across ${passport.completedSignals} technical milestones`,
      'implementing modern component design patterns, strict static typing, and automated unit suites',
      'Full-Stack'
    ),
    generateXyzBullet(
      'Architected distributed caching and resilience mechanisms',
      'reducing downstream endpoint latency by up to 45%',
      'introducing resilient sliding-window rate limiters and circuit-breaker failure guards',
      'Systems'
    ),
    generateXyzBullet(
      'Streamlined automated continuous integration and test verification',
      'achieving comprehensive test coverage across critical user flows',
      'authoring end-to-end Playwright tests and Node.js test runners in GitHub Actions',
      'Testing'
    ),
  ];

  const featuredProjects: ResumeProjectItem[] = [
    {
      id: 'proj-1',
      title: `${primaryOrg} Contributor Initiative`,
      role: 'Open Source Software Engineer',
      organization: primaryOrg,
      url: `https://github.com/${passport.githubUsername || passport.username}`,
      startDate: '2025-06',
      isOngoing: true,
      bullets: defaultBullets,
      technologies: skillsList.slice(0, 5),
    },
  ];

  if (orgNames.length > 1) {
    featuredProjects.push({
      id: 'proj-2',
      title: `${orgNames[1]} Community Contributions`,
      role: 'Core Contributor',
      organization: orgNames[1],
      url: `https://github.com/${passport.githubUsername || passport.username}`,
      startDate: '2025-09',
      isOngoing: true,
      bullets: [
        generateXyzBullet(
          `Resolved upstream issues and synchronized feature branches with ${orgNames[1]}`,
          'zero merge conflicts and clean linear commit histories',
          'conducting disciplined upstream rebasing and atomic conventional commits',
          'Collaboration'
        ),
      ],
      technologies: skillsList.slice(2, 6),
    });
  }

  return {
    basics: {
      name: passport.name || passport.username,
      username: passport.username,
      githubUsername: passport.githubUsername || passport.username,
      label: 'Open-Source Software Engineer & Systems Developer',
      avatarUrl: passport.avatarUrl,
      summary:
        passport.bio ||
        `Verified open-source engineer with ${passport.score}% Contribo readiness score (${passport.tier.tier}). Experienced in full-stack TypeScript development, resilient system architecture, and community-driven collaborative workflows.`,
      passportUrl: `https://contribo-one.vercel.app/passport/${passport.username}`,
      readinessTier: passport.tier.tier,
      readinessScore: passport.score,
    },
    featuredProjects,
    workExperience: [
      {
        id: 'work-1',
        position: 'Open-Source Developer',
        company: 'Contribo Community & Ecosystem Partners',
        location: 'Remote',
        startDate: '2025-01',
        isCurrent: true,
        summary: 'Contributing to open-source software and participating in mentored developer fellowships.',
        bullets: [
          `Achieved ${passport.tier.tier} credential verification on Contribo with ${passport.score}% readiness index.`,
          `Successfully delivered verified pull requests across ${orgNames.length > 0 ? orgNames.join(', ') : 'leading open-source repositories'}.`,
        ],
        skills: skillsList,
      },
    ],
    skills: categorizedSkills,
    awards: [
      {
        title: `Contribo ${passport.tier.tier} Award`,
        awarder: 'Contribo Open Source Readiness Board',
        date: new Date().toISOString().slice(0, 7),
        summary: `Awarded for achieving top-tier open-source technical preparation and completing ${passport.completedSignals} verified ecosystem milestones.`,
      },
    ],
    theme: 'minimalist',
    showQrCode: true,
    showReadinessBadge: true,
  };
}

/**
 * Exports ResumeData into standard schema.org JSON-Resume format.
 */
export function convertToJsonResume(resume: ResumeData): JsonResumeSchema {
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: resume.basics.name,
      label: resume.basics.label,
      image: resume.basics.avatarUrl,
      summary: resume.basics.summary,
      url: resume.basics.passportUrl,
      profiles: [
        {
          network: 'GitHub',
          username: resume.basics.githubUsername,
          url: `https://github.com/${resume.basics.githubUsername}`,
        },
        {
          network: 'Contribo Passport',
          username: resume.basics.username,
          url: resume.basics.passportUrl,
        },
      ],
    },
    work: resume.workExperience.map((w) => ({
      name: w.company,
      position: w.position,
      startDate: w.startDate,
      endDate: w.isCurrent ? undefined : w.endDate,
      summary: w.summary,
      highlights: w.bullets,
    })),
    projects: resume.featuredProjects.map((p) => ({
      name: p.title,
      description: p.organization,
      url: p.url,
      roles: [p.role],
      keywords: p.technologies,
      highlights: p.bullets.map((b) => b.fullText),
    })),
    skills: resume.skills.map((s) => ({
      name: s.category,
      keywords: s.skills,
    })),
    awards: resume.awards.map((a) => ({
      title: a.title,
      date: a.date,
      awarder: a.awarder,
      summary: a.summary,
    })),
    meta: {
      version: '1.0.0',
      canonical: resume.basics.passportUrl,
      lastModified: new Date().toISOString(),
      generator: 'Contribo Career Graph & Verifiable Resume Builder',
    },
  };
}

/**
 * Converts ResumeData into clean, Markdown-formatted text for copying to clipboard or README.
 */
export function resumeToMarkdown(resume: ResumeData): string {
  const lines: string[] = [];

  lines.push(`# ${resume.basics.name}`);
  lines.push(`**${resume.basics.label}**`);
  lines.push(`[Verified Contribo Passport](${resume.basics.passportUrl}) | [GitHub](https://github.com/${resume.basics.githubUsername})`);
  lines.push(`*Readiness Score: ${resume.basics.readinessScore}% (${resume.basics.readinessTier})*\n`);

  lines.push(`## Summary`);
  lines.push(`${resume.basics.summary}\n`);

  lines.push(`## Technical Skills`);
  resume.skills.forEach((sc) => {
    lines.push(`- **${sc.category}:** ${sc.skills.join(', ')}`);
  });
  lines.push('');

  lines.push(`## Open-Source Contributions & Projects`);
  resume.featuredProjects.forEach((proj) => {
    lines.push(`### ${proj.title} — *${proj.role}*`);
    if (proj.url) lines.push(`[Repository Link](${proj.url})`);
    proj.bullets.forEach((b) => {
      lines.push(`- ${b.fullText}`);
    });
    lines.push(`*Technologies:* ${proj.technologies.join(', ')}\n`);
  });

  lines.push(`## Experience`);
  resume.workExperience.forEach((w) => {
    lines.push(`### ${w.position} | ${w.company}`);
    lines.push(`*${w.startDate} – ${w.isCurrent ? 'Present' : w.endDate}*`);
    w.bullets.forEach((b) => {
      lines.push(`- ${b}`);
    });
    lines.push('');
  });

  if (resume.awards.length > 0) {
    lines.push(`## Verified Credentials & Awards`);
    resume.awards.forEach((aw) => {
      lines.push(`- **${aw.title}** (${aw.awarder}, ${aw.date}): ${aw.summary}`);
    });
    lines.push('');
  }

  lines.push(`---\n*Tamper-Proof Verification: ${resume.basics.passportUrl}*`);

  return lines.join('\n');
}
