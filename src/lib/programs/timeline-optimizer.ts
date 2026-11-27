export interface ProgramWindow {
  id: string;
  name: string;
  shortName: string;
  stipendUsd: number;
  weeklyHours: number;
  applicationDeadlineWeek: number; // ISO week 1-52
  bondingStartWeek: number;
  codingStartWeek: number;
  midtermWeek: number;
  codingEndWeek: number;
  acceptsConcurrent: boolean;
}

export interface ScheduleCollision {
  programA: string;
  programB: string;
  overlapWeeks: number[];
  type: 'coding-overlap' | 'evaluation-clash' | 'exclusivity-conflict';
  severity: 'critical' | 'warning';
  message: string;
}

export interface WeeklyLoadPoint {
  week: number;
  label: string;
  totalHours: number;
  capacityHours: number;
  overflowHours: number;
  activePrograms: string[];
}

export interface RankedProgramRecommendation {
  program: ProgramWindow;
  priorityScore: number;
  hourlyValueUsd: number;
  fitsCapacityAlone: boolean;
}

export interface PortfolioOptimizationResult {
  weeklyCapacityHours: number;
  selectedPrograms: ProgramWindow[];
  collisions: ScheduleCollision[];
  weeklyLoad: WeeklyLoadPoint[];
  overflowWeeksCount: number;
  peakWeeklyHours: number;
  isConflictFree: boolean;
  safeBundleIds: string[];
  rankedPrograms: RankedProgramRecommendation[];
  recommendations: string[];
}

export const PROGRAM_WINDOWS: ProgramWindow[] = [
  {
    id: 'gsoc-2026',
    name: 'Google Summer of Code 2026',
    shortName: 'GSoC 26',
    stipendUsd: 3000,
    weeklyHours: 25,
    applicationDeadlineWeek: 13,
    bondingStartWeek: 19,
    codingStartWeek: 22,
    midtermWeek: 28,
    codingEndWeek: 34,
    acceptsConcurrent: false,
  },
  {
    id: 'lfx-spring-2026',
    name: 'LFX Mentorship Spring 2026',
    shortName: 'LFX Spring',
    stipendUsd: 3000,
    weeklyHours: 20,
    applicationDeadlineWeek: 7,
    bondingStartWeek: 9,
    codingStartWeek: 10,
    midtermWeek: 16,
    codingEndWeek: 21,
    acceptsConcurrent: true,
  },
  {
    id: 'lfx-summer-2026',
    name: 'LFX Mentorship Summer 2026',
    shortName: 'LFX Summer',
    stipendUsd: 3000,
    weeklyHours: 20,
    applicationDeadlineWeek: 20,
    bondingStartWeek: 22,
    codingStartWeek: 23,
    midtermWeek: 29,
    codingEndWeek: 35,
    acceptsConcurrent: true,
  },
  {
    id: 'outreachy-may-2026',
    name: 'Outreachy May 2026 Cohort',
    shortName: 'Outreachy',
    stipendUsd: 7000,
    weeklyHours: 35,
    applicationDeadlineWeek: 14,
    bondingStartWeek: 20,
    codingStartWeek: 21,
    midtermWeek: 27,
    codingEndWeek: 33,
    acceptsConcurrent: false,
  },
  {
    id: 'nsoc-2026',
    name: 'NSoC 2026 Open Source Track',
    shortName: 'NSoC 26',
    stipendUsd: 1500,
    weeklyHours: 12,
    applicationDeadlineWeek: 38,
    bondingStartWeek: 40,
    codingStartWeek: 41,
    midtermWeek: 45,
    codingEndWeek: 48,
    acceptsConcurrent: true,
  },
];

function getCodingWeeks(p: ProgramWindow): number[] {
  const weeks: number[] = [];
  for (let w = p.codingStartWeek; w <= p.codingEndWeek; w++) {
    weeks.push(w);
  }
  return weeks;
}

/**
 * Evaluate a candidate set of open-source mentorship programs against weekly hour capacity,
 * detecting hard coding-window overlaps, evaluation clashes, and computing a conflict-free bundle.
 */
export function optimizeApplicationPortfolio(
  selectedIds: string[],
  weeklyCapacityHours = 30,
  catalog: ProgramWindow[] = PROGRAM_WINDOWS
): PortfolioOptimizationResult {
  const capacity = Math.max(5, Math.min(Number.isFinite(weeklyCapacityHours) ? weeklyCapacityHours : 30, 80));
  const idSet = new Set(selectedIds);
  const selectedPrograms = catalog.filter((p) => idSet.has(p.id));

  const collisions: ScheduleCollision[] = [];

  for (let i = 0; i < selectedPrograms.length; i++) {
    for (let j = i + 1; j < selectedPrograms.length; j++) {
      const a = selectedPrograms[i];
      const b = selectedPrograms[j];

      const weeksA = new Set(getCodingWeeks(a));
      const overlapWeeks = getCodingWeeks(b).filter((w) => weeksA.has(w));

      if (overlapWeeks.length > 0) {
        if (!a.acceptsConcurrent || !b.acceptsConcurrent) {
          collisions.push({
            programA: a.id,
            programB: b.id,
            overlapWeeks,
            type: 'exclusivity-conflict',
            severity: 'critical',
            message: `${a.shortName} and ${b.shortName} overlap on ${overlapWeeks.length} coding weeks (W${overlapWeeks[0]}-W${overlapWeeks[overlapWeeks.length - 1]}) and prohibit concurrent participation.`,
          });
        } else {
          collisions.push({
            programA: a.id,
            programB: b.id,
            overlapWeeks,
            type: 'coding-overlap',
            severity: a.weeklyHours + b.weeklyHours > capacity ? 'critical' : 'warning',
            message: `${a.shortName} and ${b.shortName} share ${overlapWeeks.length} active coding weeks (${a.weeklyHours + b.weeklyHours}h/wk combined).`,
          });
        }
      }

      if (Math.abs(a.midtermWeek - b.midtermWeek) <= 1) {
        collisions.push({
          programA: a.id,
          programB: b.id,
          overlapWeeks: [a.midtermWeek, b.midtermWeek],
          type: 'evaluation-clash',
          severity: 'warning',
          message: `Midterm evaluations for ${a.shortName} (W${a.midtermWeek}) and ${b.shortName} (W${b.midtermWeek}) fall within 1 week of each other.`,
        });
      }
    }
  }

  // Compute weekly load across weeks 1..52 (focusing on active window 7..49)
  const weeklyLoad: WeeklyLoadPoint[] = [];
  let peakWeeklyHours = 0;
  let overflowWeeksCount = 0;

  for (let week = 7; week <= 49; week++) {
    const active = selectedPrograms.filter(
      (p) => week >= p.codingStartWeek && week <= p.codingEndWeek
    );
    const totalHours = active.reduce((sum, p) => sum + p.weeklyHours, 0);
    const overflowHours = Math.max(0, totalHours - capacity);

    if (totalHours > peakWeeklyHours) peakWeeklyHours = totalHours;
    if (overflowHours > 0) overflowWeeksCount += 1;

    weeklyLoad.push({
      week,
      label: `W${week}`,
      totalHours,
      capacityHours: capacity,
      overflowHours,
      activePrograms: active.map((p) => p.shortName),
    });
  }

  // Rank programs by stipend efficiency + capacity fit
  const rankedPrograms: RankedProgramRecommendation[] = selectedPrograms
    .map((p) => {
      const totalProgramHours = getCodingWeeks(p).length * p.weeklyHours;
      const hourlyValueUsd = Number((p.stipendUsd / Math.max(totalProgramHours, 1)).toFixed(2));
      const fitsCapacityAlone = p.weeklyHours <= capacity;
      const priorityScore = Math.round(
        (fitsCapacityAlone ? 50 : 15) + Math.min(hourlyValueUsd * 2.5, 50)
      );
      return {
        program: p,
        priorityScore,
        hourlyValueUsd,
        fitsCapacityAlone,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // Greedy conflict-free safe bundle builder
  const safeBundle: ProgramWindow[] = [];
  for (const rec of rankedPrograms) {
    const candidate = rec.program;
    if (candidate.weeklyHours > capacity) continue;

    const candidateWeeks = new Set(getCodingWeeks(candidate));
    const hasHardConflict = safeBundle.some((existing) => {
      const overlap = getCodingWeeks(existing).filter((w) => candidateWeeks.has(w));
      if (overlap.length === 0) return false;
      if (!existing.acceptsConcurrent || !candidate.acceptsConcurrent) return true;
      return existing.weeklyHours + candidate.weeklyHours > capacity;
    });

    if (!hasHardConflict) {
      safeBundle.push(candidate);
    }
  }

  const hasCriticalCollision = collisions.some((c) => c.severity === 'critical');
  const isConflictFree = !hasCriticalCollision && overflowWeeksCount === 0;

  const recommendations: string[] = [];
  if (isConflictFree) {
    recommendations.push(
      `Your selected portfolio fits within ${capacity}h/week with zero critical schedule conflicts.`
    );
  } else {
    if (overflowWeeksCount > 0) {
      recommendations.push(
        `${overflowWeeksCount} weeks exceed your ${capacity}h/week budget (peak: ${peakWeeklyHours}h/week).`
      );
    }
    if (safeBundle.length > 0) {
      recommendations.push(
        `Recommended conflict-free bundle: ${safeBundle.map((p) => p.shortName).join(' + ')}.`
      );
    }
  }

  return {
    weeklyCapacityHours: capacity,
    selectedPrograms,
    collisions,
    weeklyLoad,
    overflowWeeksCount,
    peakWeeklyHours,
    isConflictFree,
    safeBundleIds: safeBundle.map((p) => p.id),
    rankedPrograms,
    recommendations,
  };
}
