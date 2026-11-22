import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicPassport } from '@/lib/repositories/passport';
import { sanitizeUsername } from '@/lib/passport';
import { synthesizeResumeFromPassport } from '@/lib/resume/synthesizer';
import { ResumeClient } from './ResumeClient';

export const dynamic = 'force-dynamic';

interface ResumePageProps {
  params: Promise<{ username: string }> | { username: string };
}

export async function generateMetadata(
  props: ResumePageProps
): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(props.params);
  const username = sanitizeUsername(resolvedParams?.username);
  if (!username) {
    return {
      title: 'Verifiable Resume Builder | Contribo',
      description: 'Generate ATS-optimized resumes from verified open-source contributions.',
    };
  }

  const passport = await getPublicPassport(username);
  if (!passport || passport.isPrivate) {
    return {
      title: `@${username} | Verifiable Resume Builder | Contribo`,
      description: `Verified open-source career graph and ATS resume builder for @${username} on Contribo.`,
    };
  }

  const title = `${passport.name} (@${passport.username}) — Verifiable Resume | Contribo`;
  const description = `ATS-optimized open-source engineering resume for ${passport.name} with verified ${passport.score}% Contribo readiness and Google XYZ impact metrics.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/passport/${passport.username}/resume`,
      images: [
        {
          url: passport.avatarUrl,
          width: 256,
          height: 256,
          alt: `${passport.name}'s avatar`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [passport.avatarUrl],
    },
  };
}

export default async function ResumePage(props: ResumePageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const username = sanitizeUsername(resolvedParams?.username);

  if (!username) {
    notFound();
  }

  const passport = await getPublicPassport(username);
  if (!passport) {
    notFound();
  }

  const resumeData = synthesizeResumeFromPassport(passport);

  return (
    <main className="min-h-screen w-full px-4 sm:px-8 lg:px-12 pt-[140px] pb-24">
      <ResumeClient initialData={resumeData} />
    </main>
  );
}
