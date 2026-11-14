import React from 'react';
import Link from 'next/link';
import { UserX, ArrowLeft } from 'lucide-react';

export default function PassportNotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 pt-[120px] pb-16">
      <div className="max-w-md w-full p-8 rounded-3xl border border-hairline/80 bg-surface/80 backdrop-blur-xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto border border-accent/20">
          <UserX size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-extrabold text-primary">
            Passport Not Found
          </h1>
          <p className="text-xs text-secondary leading-relaxed">
            The requested contributor profile does not exist or has not been registered on Contribo yet.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-page text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-hairline bg-surface-raised hover:bg-surface text-xs font-bold text-primary transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
