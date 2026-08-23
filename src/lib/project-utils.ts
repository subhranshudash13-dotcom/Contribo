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

  const isGSoC =
    prog.includes('gsoc') ||
    prog.includes('google summer of code') ||
    (!prog && (t.includes('gsoc') || d.includes('gsoc') || true)); // Default open source project heuristic

  const isLFX = prog.includes('lfx') || prog.includes('linux foundation');
  const isOutreachy = prog.includes('outreachy');
  const isSummerOfBitcoin = prog.includes('bitcoin');
  const isESoC = prog.includes('esoc');

  // 1. Check for explicit 90 hours / Small project signals
  if (
    t.includes('90h') ||
    t.includes('90 hour') ||
    t.includes('90-hour') ||
    d.includes('90h') ||
    d.includes('90 hour') ||
    d.includes('small (90') ||
    d.includes('project size: small') ||
    diff.includes('beginner') ||
    diff.includes('easy')
  ) {
    return {
      size: 'small',
      sizeLabel: '90h (Small)',
      hours: 90,
      durationWeeks: 8,
      stipendRange: '$1,500 – $3,300 USD',
      shortStipend: '$1.5k–$3.3k',
      isGSoC,
      tooltip: isGSoC
        ? 'GSoC Small Project (~90 hours): $1,500 – $3,300 USD adjusted by contributor country PPP rate.'
        : 'Small Project (~90 hours commitment).',
      badgeTone: 'emerald',
    };
  }

  // 2. Check for explicit 350 hours / Large / Advanced project signals
  if (
    t.includes('350h') ||
    t.includes('350 hour') ||
    t.includes('350-hour') ||
    d.includes('350h') ||
    d.includes('350 hour') ||
    d.includes('large (350') ||
    d.includes('project size: large') ||
    diff.includes('advanced') ||
    diff.includes('hard')
  ) {
    return {
      size: 'large',
      sizeLabel: '350h (Large)',
      hours: 350,
      durationWeeks: 22,
      stipendRange: '$6,000 – $13,200 USD',
      shortStipend: '$6k–$13.2k',
      isGSoC,
      tooltip: isGSoC
        ? 'GSoC Large Project (~350 hours): $6,000 – $13,200 USD adjusted by contributor country PPP rate.'
        : isLFX
        ? 'LFX Full-Time Mentorship (~350h): $3,000 – $6,600 USD location-adjusted stipend.'
        : 'Large Project (~350 hours commitment).',
      badgeTone: 'purple',
    };
  }

  // 3. Program-specific overrides
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

  // 4. Default: Standard GSoC Medium Project (~175 hours)
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
