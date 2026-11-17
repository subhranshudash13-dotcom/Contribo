import {
  CountryData,
  ProgramComparisonRecord,
  getCountry,
  COMPARISON_PROGRAMS,
} from './comparison-data';

export interface RegionalStipendEstimate {
  minLocal: number;
  maxLocal: number;
  minUsd: number;
  maxUsd: number;
  currency: string;
  currencySymbol: string;
  formattedRangeLocal: string;
  formattedRangeUsd: string;
  hourlyRateEstimateUsd: number;
  hourlyRateEstimateLocal: number;
  notes: string;
  isUnpaid: boolean;
}

export function formatCurrencyAmount(amount: number, symbol: string, currency: string): string {
  if (amount === 0) return 'Free / Unpaid';
  const formattedNumber = amount.toLocaleString('en-US');
  if (currency === 'USD') return `$${formattedNumber}`;
  if (currency === 'EUR') return `€${formattedNumber}`;
  if (currency === 'GBP') return `£${formattedNumber}`;
  if (currency === 'INR') return `₹${formattedNumber}`;
  return `${symbol}${formattedNumber} ${currency}`;
}

export function calculateRegionalStipend(
  program: ProgramComparisonRecord,
  country: CountryData
): RegionalStipendEstimate {
  const { stipend, commitment } = program;
  const isUnpaid = stipend.type === 'unpaid' || stipend.maxUsd === 0;

  if (isUnpaid) {
    return {
      minLocal: 0,
      maxLocal: 0,
      minUsd: 0,
      maxUsd: 0,
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      formattedRangeLocal: 'Unpaid / Swag & Prizes',
      formattedRangeUsd: '$0 (Swag & Perks)',
      hourlyRateEstimateUsd: 0,
      hourlyRateEstimateLocal: 0,
      notes: stipend.description,
      isUnpaid: true,
    };
  }

  let minUsd = stipend.baseUsd;
  let maxUsd = stipend.maxUsd;

  if (stipend.type === 'ppp-adjusted') {
    // Adjusted by purchasing power parity
    minUsd = Math.round(stipend.baseUsd * country.pppMultiplier);
    maxUsd = Math.round(stipend.maxUsd * country.pppMultiplier);
  }

  const minLocal = Math.round(minUsd * country.exchangeRateToUsd);
  const maxLocal = Math.round(maxUsd * country.exchangeRateToUsd);

  const totalHours = Math.max(1, commitment.totalEstimatedHours || commitment.weeklyHours * commitment.durationWeeks);
  const avgUsd = (minUsd + maxUsd) / 2;
  const hourlyRateEstimateUsd = Math.round((avgUsd / totalHours) * 10) / 10;
  const hourlyRateEstimateLocal = Math.round(hourlyRateEstimateUsd * country.exchangeRateToUsd);

  const formattedRangeUsd =
    minUsd === maxUsd ? `$${minUsd.toLocaleString('en-US')}` : `$${minUsd.toLocaleString('en-US')} – $${maxUsd.toLocaleString('en-US')}`;

  const formattedRangeLocal =
    minLocal === maxLocal
      ? formatCurrencyAmount(minLocal, country.currencySymbol, country.currency)
      : `${country.currencySymbol}${minLocal.toLocaleString('en-US')} – ${country.currencySymbol}${maxLocal.toLocaleString('en-US')}`;

  let notes = stipend.description;
  if (stipend.type === 'ppp-adjusted') {
    notes += ` (Calibrated at ${(country.pppMultiplier * 100).toFixed(0)}% PPP for ${country.name}).`;
  }

  return {
    minLocal,
    maxLocal,
    minUsd,
    maxUsd,
    currency: country.currency,
    currencySymbol: country.currencySymbol,
    formattedRangeLocal,
    formattedRangeUsd,
    hourlyRateEstimateUsd,
    hourlyRateEstimateLocal,
    notes,
    isUnpaid: false,
  };
}

export interface TimelineConflict {
  id: string;
  slugA: string;
  slugB: string;
  nameA: string;
  nameB: string;
  type: 'coding_overlap' | 'workload_warning' | 'application_overlap';
  overlapDays: number;
  startDate: string;
  endDate: string;
  combinedWeeklyHours: number;
  message: string;
  severity: 'warning' | 'critical';
}

function parseDateToUtc(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatUtcDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function detectTimelineConflicts(programs: ProgramComparisonRecord[]): TimelineConflict[] {
  const conflicts: TimelineConflict[] = [];

  for (let i = 0; i < programs.length; i++) {
    for (let j = i + 1; j < programs.length; j++) {
      const pA = programs[i];
      const pB = programs[j];

      // 1. Coding period overlap check
      const startA = parseDateToUtc(pA.commitment.codingStartDate);
      const endA = parseDateToUtc(pA.commitment.codingEndDate);
      const startB = parseDateToUtc(pB.commitment.codingStartDate);
      const endB = parseDateToUtc(pB.commitment.codingEndDate);

      const overlapStart = Math.max(startA, startB);
      const overlapEnd = Math.min(endA, endB);

      if (overlapStart <= overlapEnd) {
        const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
        const combinedWeeklyHours = pA.commitment.weeklyHours + pB.commitment.weeklyHours;
        const isCritical = combinedWeeklyHours > 40 || !pA.eligibility.fullTimeEmployedAllowed || !pB.eligibility.fullTimeEmployedAllowed;

        const dateRangeStr = `${formatUtcDate(overlapStart)} – ${formatUtcDate(overlapEnd)}`;
        const message = `${pA.name} and ${pB.name} coding periods overlap for ${overlapDays} days (${dateRangeStr}). Combined workload is ${combinedWeeklyHours} hrs/week.`;

        conflicts.push({
          id: `${pA.slug}-${pB.slug}-coding`,
          slugA: pA.slug,
          slugB: pB.slug,
          nameA: pA.name,
          nameB: pB.name,
          type: 'coding_overlap',
          overlapDays,
          startDate: new Date(overlapStart).toISOString().slice(0, 10),
          endDate: new Date(overlapEnd).toISOString().slice(0, 10),
          combinedWeeklyHours,
          message,
          severity: isCritical ? 'critical' : 'warning',
        });
      }

      // 2. Application window overlap check
      const appStartA = parseDateToUtc(pA.application.applicationStartDate);
      const appEndA = parseDateToUtc(pA.application.applicationEndDate);
      const appStartB = parseDateToUtc(pB.application.applicationStartDate);
      const appEndB = parseDateToUtc(pB.application.applicationEndDate);

      const appOverlapStart = Math.max(appStartA, appStartB);
      const appOverlapEnd = Math.min(appEndA, appEndB);

      if (appOverlapStart <= appOverlapEnd) {
        const appOverlapDays = Math.ceil((appOverlapEnd - appOverlapStart) / (1000 * 60 * 60 * 24)) + 1;
        if (pA.application.requiresWrittenProposal && pB.application.requiresWrittenProposal) {
          conflicts.push({
            id: `${pA.slug}-${pB.slug}-apps`,
            slugA: pA.slug,
            slugB: pB.slug,
            nameA: pA.name,
            nameB: pB.name,
            type: 'application_overlap',
            overlapDays: appOverlapDays,
            startDate: new Date(appOverlapStart).toISOString().slice(0, 10),
            endDate: new Date(appOverlapEnd).toISOString().slice(0, 10),
            combinedWeeklyHours: 0,
            message: `Concurrent proposal deadlines: both ${pA.name} and ${pB.name} require written proposals during ${formatUtcDate(appOverlapStart)} – ${formatUtcDate(appOverlapEnd)}.`,
            severity: 'warning',
          });
        }
      }
    }
  }

  return conflicts;
}

export interface ComparisonMatrixResult {
  programs: ProgramComparisonRecord[];
  country: CountryData;
  stipends: Record<string, RegionalStipendEstimate>;
  conflicts: TimelineConflict[];
  totalCumulativeWeeklyHours: number;
  availableSlugs: string[];
}

export function buildComparisonMatrix(
  slugs: string[],
  countryCode: string = 'US'
): ComparisonMatrixResult {
  const country = getCountry(countryCode);
  const availableSlugs = Object.keys(COMPARISON_PROGRAMS);

  // Filter valid slugs or fallback to default
  const validSlugs = slugs
    .map((s) => s.trim().toLowerCase())
    .filter((s, idx, arr) => arr.indexOf(s) === idx && !!COMPARISON_PROGRAMS[s]);

  const targetSlugs = validSlugs.length > 0 ? validSlugs.slice(0, 4) : ['gsoc', 'lfx'];
  const programs = targetSlugs.map((s) => COMPARISON_PROGRAMS[s]);

  const stipends: Record<string, RegionalStipendEstimate> = {};
  for (const p of programs) {
    stipends[p.slug] = calculateRegionalStipend(p, country);
  }

  const conflicts = detectTimelineConflicts(programs);
  const totalCumulativeWeeklyHours = programs.reduce((sum, p) => sum + p.commitment.weeklyHours, 0);

  return {
    programs,
    country,
    stipends,
    conflicts,
    totalCumulativeWeeklyHours,
    availableSlugs,
  };
}
