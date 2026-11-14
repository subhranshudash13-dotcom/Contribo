import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicPassport } from '@/lib/repositories/passport';
import { sanitizeUsername } from '@/lib/passport';
import { PassportCard } from '@/components/passport/PassportCard';

export const dynamic = 'force-dynamic';

interface PassportPageProps {
  params: Promise<{ username: string }> | { username: string };
}

export async function generateMetadata(
  props: PassportPageProps
): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(props.params);
  const username = sanitizeUsername(resolvedParams?.username);
  if (!username) {
    return {
      title: 'Contributor Passport | Contribo',
      description: 'Verified Open Source Contributor Readiness Profile',
    };
  }

  const passport = await getPublicPassport(username);
  if (!passport || passport.isPrivate) {
    return {
      title: `@${username} | Contributor Passport | Contribo`,
      description: `Verified open-source readiness passport for @${username} on Contribo.`,
    };
  }

  const title = `${passport.name} (@${passport.username}) — Contributor Passport | Contribo`;
  const description = `${passport.name} has achieved ${passport.score}% readiness (${passport.tier.tier}) on Contribo. Explore their verified open-source preparation and technical skill stack.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/passport/${passport.username}`,
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

export default async function PassportPage(props: PassportPageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const username = sanitizeUsername(resolvedParams?.username);

  if (!username) {
    notFound();
  }

  const passport = await getPublicPassport(username);
  if (!passport) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full px-4 sm:px-8 lg:px-12 pt-[140px] pb-24">
      <PassportCard passport={passport} />
    </main>
  );
}
