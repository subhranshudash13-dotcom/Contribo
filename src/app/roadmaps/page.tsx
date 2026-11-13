import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/LoadingState';
import RoadmapsClient from './RoadmapsClient';

export const metadata = {
  title: 'Contributor Roadmaps | Contribo',
};

export default function RoadmapsPage() {
  return (
    <Suspense fallback={<LoadingState title="Loading roadmaps" />}>
      <RoadmapsClient />
    </Suspense>
  );
}
