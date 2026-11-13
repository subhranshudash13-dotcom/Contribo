/**
 * Project scope, duration, and stipend calculator for GSoC and open-source mentorship programs.
 * Based on official Google Summer of Code, LFX Mentorship, and Outreachy compensation guidelines.
 */

export interface ProjectScopeInfo {
  size: 'small' | 'medium' | 'large' | 'standard';
  sizeLabel: string;
  hours: number;
  durationWeeks: number;
  stipendRange: string;
  shortStipend: string;
  isGSoC: boolean;
  tooltip: string;
  badgeTone: 'emerald' | 'amber' | 'purple' | 'blue';
}

export function getProjectScopeAndStipend(project: {
  title?: string;
  description?: string;
  difficulty?: string;
  programName?: string;
  programSlug?: string;
}): ProjectScopeInfo {
  const t = (project.title || '').toLowerCase();
  const d = (project.description || '').toLowerCase();
  const diff = (project.difficulty || '').toLowerCase();
  const prog = (project.programSlug || project.programName || '').toLowerCase();

  // Only claim GSoC when the program is explicit or the project text names it.
  // A missing program is unknown, not a GSoC project.
  const isGSoC =
    prog.includes('gsoc') ||
    prog.includes('google summer of code') ||
    (!prog && (t.includes('gsoc') || d.includes('gsoc')));

  const isLFX = prog.includes('lfx') || prog.includes('linux foundation');
  const isOutreachy = prog.includes('outreachy');
  const isSummerOfBitcoin = prog.includes('bitcoin');
  const isESoC = prog.includes('esoc');

  const isSmall =
    t.includes('90h') ||
    t.includes('90 hour') ||
    t.includes('90-hour') ||
    d.includes('90h') ||
    d.includes('90 hour') ||
    d.includes('small (90') ||
    d.includes('project size: small') ||
    diff.includes('beginner') ||
    diff.includes('easy');

  const isLarge =
    t.includes('350h') ||
    t.includes('350 hour') ||
    t.includes('350-hour') ||
    d.includes('350h') ||
    d.includes('350 hour') ||
    d.includes('large (350') ||
    d.includes('project size: large') ||
    diff.includes('advanced') ||
    diff.includes('hard');

  // Known programs always win over a generic difficulty label. A contributor
  // looking at an Outreachy or LFX project must not be shown GSoC compensation.
  if (isOutreachy) {
    return {
      size: 'standard',
      sizeLabel: 'Full-Time (~350h)',
      hours: 350,
      durationWeeks: 13,
      stipendRange: '$7,000 USD + $500 Travel',
      shortStipend: '$7,000',
      isGSoC: false,
      tooltip: 'Outreachy standard internship: $7,000 USD total stipend plus $500 travel stipend.',
      badgeTone: 'purple',
    };
  }

  if (isSummerOfBitcoin) {
    return {
      size: 'standard',
      sizeLabel: 'Standard (~175h)',
      hours: 175,
      durationWeeks: 12,
      stipendRange: '$3,000 – $5,000 USD in BTC',
      shortStipend: '$3k–$5k',
      isGSoC: false,
      tooltip: 'Summer of Bitcoin: $3,000 – $5,000 USD paid in Bitcoin upon milestone completions.',
      badgeTone: 'amber',
    };
  }

  if (isESoC) {
    return {
      size: 'standard',
      sizeLabel: 'Standard (~175h)',
      hours: 175,
      durationWeeks: 12,
      stipendRange: '€2,000 – €4,000 EUR',
      shortStipend: '€2k–€4k',
      isGSoC: false,
      tooltip: 'European Summer of Code: €2,000 – €4,000 EUR stipend.',
      badgeTone: 'blue',
    };
  }

  if (isLFX) {
    return {
      size: 'standard',
      sizeLabel: 'LFX Mentorship (~350h)',
      hours: 350,
      durationWeeks: 12,
      stipendRange: '$3,000 – $6,600 USD',
      shortStipend: '$3k–$6.6k',
      isGSoC: false,
      tooltip: 'LFX Full-Time Mentorship (~350h): $3,000 – $6,600 USD location-adjusted stipend.',
      badgeTone: 'blue',
    };
  }

  if (isGSoC) {
    if (isSmall) {
      return {
        size: 'small',
        sizeLabel: '90h (Small)',
        hours: 90,
        durationWeeks: 8,
        stipendRange: '$1,500 – $3,300 USD',
        shortStipend: '$1.5k–$3.3k',
        isGSoC: true,
        tooltip:
          'GSoC Small Project (~90 hours): $1,500 – $3,300 USD adjusted by contributor country PPP rate.',
        badgeTone: 'emerald',
      };
    }

    if (isLarge) {
      return {
        size: 'large',
        sizeLabel: '350h (Large)',
        hours: 350,
        durationWeeks: 22,
        stipendRange: '$6,000 – $13,200 USD',
        shortStipend: '$6k–$13.2k',
        isGSoC: true,
        tooltip:
          'GSoC Large Project (~350 hours): $6,000 – $13,200 USD adjusted by contributor country PPP rate.',
        badgeTone: 'purple',
      };
    }

    return {
      size: 'medium',
      sizeLabel: '175h (Medium)',
      hours: 175,
      durationWeeks: 12,
      stipendRange: '$3,000 – $6,600 USD',
      shortStipend: '$3k–$6.6k',
      isGSoC: true,
      tooltip:
        'GSoC Medium Project (~175 hours / 12 weeks): $3,000 – $6,600 USD adjusted by contributor country PPP rate.',
      badgeTone: 'amber',
    };
  }

  // Unknown or unlisted program: describe the scope without borrowing GSoC money.
  if (isSmall) {
    return {
      size: 'small',
      sizeLabel: '90h (Small)',
      hours: 90,
      durationWeeks: 8,
      stipendRange: 'Varies by program',
      shortStipend: 'Varies',
      isGSoC: false,
      tooltip:
        'Small project scope (about 90 hours). Stipend and eligibility depend on the hosting program.',
      badgeTone: 'emerald',
    };
  }

  if (isLarge) {
    return {
      size: 'large',
      sizeLabel: '350h (Large)',
      hours: 350,
      durationWeeks: 22,
      stipendRange: 'Varies by program',
      shortStipend: 'Varies',
      isGSoC: false,
      tooltip:
        'Large project scope (about 350 hours). Stipend and eligibility depend on the hosting program.',
      badgeTone: 'purple',
    };
  }

  return {
    size: 'medium',
    sizeLabel: '175h (Medium)',
    hours: 175,
    durationWeeks: 12,
    stipendRange: 'Varies by program',
    shortStipend: 'Varies',
    isGSoC: false,
    tooltip:
      'Standard project scope (about 175 hours). Stipend and eligibility depend on the hosting program.',
    badgeTone: 'amber',
  };
}
