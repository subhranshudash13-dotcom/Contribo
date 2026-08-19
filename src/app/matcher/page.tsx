import MatcherLoader from './MatcherLoader';

export const metadata = {
  title: 'Orbit AI Matcher | Contribo',
  description:
    'Match your skills to open-source mentorship projects across GSoC, Outreachy, LFX, and more.',
};

import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function MatcherPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return <MatcherLoader />;
}
