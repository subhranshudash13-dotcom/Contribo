import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicPassport } from '@/lib/repositories/passport';
import { sanitizeUsername } from '@/lib/passport';
import {
  createAttestationReceipt,
  verifyAttestationReceipt,
} from '@/lib/passport/attestation';
import { VerifyClient } from './VerifyClient';

export const dynamic = 'force-dynamic';

interface VerifyPageProps {
  params: Promise<{ username: string }> | { username: string };
}

export async function generateMetadata(
  props: VerifyPageProps
): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(props.params);
  const username = sanitizeUsername(resolvedParams?.username);
  if (!username) {
    return {
      title: 'Contributor Verification Portal | Contribo',
      description:
        'Cryptographic SHA-256 attestation and Open Badges v3 verification for open-source contributors.',
    };
  }

  const passport = await getPublicPassport(username);
  if (!passport || passport.isPrivate) {
    return {
      title: `@${username} | Contributor Verification | Contribo`,
      description: `Verify cryptographic open-source contribution attestations for @${username} on Contribo.`,
    };
  }

  const title = `${passport.name} (@${passport.username}) — Verified Attestation | Contribo`;
  const description = `Tamper-evident SHA-256 Open Badges v3 attestation for ${passport.name} (${passport.score}% readiness).`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/passport/${passport.username}/verify`,
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

export default async function VerifyPage(props: VerifyPageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const username = sanitizeUsername(resolvedParams?.username);

  if (!username) {
    notFound();
  }

  const passport = await getPublicPassport(username);
  if (!passport) {
    notFound();
  }

  const initialReceipt = createAttestationReceipt(passport, { expiresInDays: 365 });
  const initialVerification = verifyAttestationReceipt(initialReceipt, {
    checkRegistry: true,
  });

  return (
    <main className="min-h-screen w-full px-4 sm:px-8 lg:px-12 pt-[140px] pb-24">
      <VerifyClient
        passport={passport}
        initialReceipt={initialReceipt}
        initialVerification={initialVerification}
      />
    </main>
  );
}
