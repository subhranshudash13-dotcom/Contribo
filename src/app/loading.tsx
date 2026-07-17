import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 size={48} className="animate-spin text-program-accent mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</h2>
    </div>
  );
}
