function slugPart(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'step';
}

export function createApplicationMilestones(programSlug, steps) {
  if (!Array.isArray(steps)) return [];

  const programKey = slugPart(
    typeof programSlug === 'string' && programSlug.trim()
      ? programSlug.trim()
      : 'program'
  );
  const occurrences = new Map();
  const milestones = [];

  for (const rawStep of steps) {
    if (typeof rawStep !== 'string' || !rawStep.trim()) continue;

    const label = rawStep.trim();
    const stepKey = slugPart(label);
    const occurrence = occurrences.get(stepKey) || 0;
    occurrences.set(stepKey, occurrence + 1);

    milestones.push({
      id: `${programKey}:${stepKey}:${occurrence}`,
      label,
    });
  }

  return milestones;
}

export function normalizeCompletedMilestoneIds(value, validIds) {
  if (!Array.isArray(value) || value.length > 100) return null;
  if (value.some((id) => typeof id !== 'string' || id.length > 300)) return null;

  const allowed = new Set(validIds);
  const unique = [...new Set(value)];

  if (unique.some((id) => !allowed.has(id))) return null;
  return unique;
}
