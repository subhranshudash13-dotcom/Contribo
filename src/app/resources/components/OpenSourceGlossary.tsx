'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { filterGlossary } from '@/lib/glossary-search.mjs';
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
} from '../data/glossaryData';

export function OpenSourceGlossary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GlossaryCategory | 'all'>('all');
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  const results = useMemo(
    () => filterGlossary(GLOSSARY, { query, category }),
    [query, category]
  );

  return (
    <section aria-labelledby="glossary-heading">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1.5 bg-brass rounded-full" />
        <h2 id="glossary-heading" className="text-2xl font-bold text-primary">
          Open source glossary
        </h2>
      </div>
      <p className="text-sm text-secondary mb-6 max-w-2xl">
        Confused by PR, rebase or LGTM? Search the terms you keep running into.
      </p>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms, e.g. rebase"
          aria-label="Search glossary terms"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-hairline text-sm text-primary focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter glossary by category">
        {GLOSSARY_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              category === c.id
                ? 'bg-accent text-white border-accent'
                : 'bg-surface text-secondary border-hairline hover:border-tertiary'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? 'term' : 'terms'} found
      </p>

      {results.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-hairline rounded-2xl text-sm text-secondary">
          No terms match &ldquo;{query}&rdquo;. Try a different word or clear the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item) => {
            const expanded = openTerm === item.term;
            const panelId = `glossary-${item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            return (
              <div key={item.term} className="bg-surface border border-hairline rounded-2xl p-5">
                <h3 className="text-lg font-bold text-primary">{item.term}</h3>
                <p className="text-sm text-secondary mt-1">{item.shortDef}</p>
                <button
                  type="button"
                  onClick={() => setOpenTerm(expanded ? null : item.term)}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent"
                >
                  {expanded ? 'Show less' : 'Read more'}
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expanded && (
                  <div id={panelId} className="mt-3 space-y-2 text-xs text-secondary">
                    <p>{item.inDepth}</p>
                    <p className="font-mono bg-surface-raised border border-hairline rounded-lg p-2 break-words">
                      {item.example}
                    </p>
                    <p>
                      <strong className="text-primary">Tip:</strong> {item.tips}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
