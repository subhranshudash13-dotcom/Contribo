import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ConflictsClient } from './ConflictsClient';

export const metadata: Metadata = {
  title: 'Program Calendar Conflict Detector | Contribo',
  description:
    'Check deadline pinches, coding window overlaps and exclusivity risks across open-source mentorship programs, with a suggested drafting schedule.',
};

export default function CalendarConflictsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-secondary">Loading calendar...</p>}>
      <ConflictsClient />
    </Suspense>
  );
}
