'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, BookOpen, Building2, Code2, Loader2, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'program' | 'org' | 'project';
  name?: string;
  title?: string;
  slug?: string;
  organizer?: string;
  category?: string;
  logoUrl?: string;
  org?: string;
  orgSlug?: string;
  difficulty?: string;
  techStack?: string[];
  accentColor?: string;
}

export function CommandPalette({ hideTrigger = false }: { hideTrigger?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    programs: SearchResult[];
    organizations: SearchResult[];
    projects: SearchResult[];
  }>({ programs: [], organizations: [], projects: [] });
  const [flatResults, setFlatResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();

  // Listen for a custom event to open the palette
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults({ programs: [], organizations: [], projects: [] });
      setFlatResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        const programs = data.programs || [];
        const organizations = data.organizations || [];
        const projects = data.projects || [];
        
        setResults({ programs, organizations, projects });
        
        // Flatten results for easy keyboard index traversal
        setFlatResults([...programs, ...organizations, ...projects]);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'program') {
      router.push(`/programs/${item.slug}`);
    } else if (item.type === 'org') {
      router.push(`/organizations?orgSlug=${item.slug}`);
    } else if (item.type === 'project') {
      router.push(`/projects?orgSlug=${item.orgSlug || item.org}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) handleSelect(selected);
    }
  };

  if (!isOpen) {
    if (hideTrigger) return null;
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-4 py-2 border border-hairline rounded-full bg-surface hover:border-muted transition-colors text-muted text-sm group w-80 mx-4 cursor-pointer shadow-sm"
      >
        <Search size={16} className="group-hover:text-primary transition-colors" />
        <span className="flex-1 text-left truncate">Search programs, organizations or projects...</span>
        <kbd className="hidden sm:inline-flex items-center justify-center font-mono text-[10px] bg-base w-5 h-5 rounded border border-hairline font-bold">
          /
        </kbd>
      </button>
    );
  }

  // Helper to determine active index across categories
  let absoluteIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-base/80 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-surface border border-hairline rounded-lg shadow-2xl overflow-hidden elevation-4 mx-4">
        <div className="flex items-center px-4 py-3 border-b border-hairline">
          <Search size={18} className="text-muted mr-3 shrink-0" />
          <input 
            autoFocus
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-primary placeholder:text-muted text-base sm:text-lg h-8"
            placeholder="Search programs, organizations, projects..."
          />
          {loading ? (
            <Loader2 className="animate-spin text-brass mr-2" size={16} />
          ) : (
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs font-mono text-muted bg-base px-2 py-1 rounded border border-hairline ml-2"
            >
              ESC
            </button>
          )}
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {flatResults.length === 0 ? (
            <div className="p-4 text-center">
              {query.trim() ? (
                <p className="text-muted text-sm">No results found for &ldquo;{query}&rdquo;</p>
              ) : (
                <div className="text-left space-y-4">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted px-2">Suggestions</h4>
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setQuery('Google Summer of Code'); inputRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-raised text-primary text-left text-sm"
                    >
                      <BookOpen size={16} className="text-muted" />
                      <span className="flex-1 font-medium">Google Summer of Code</span>
                      <span className="text-xs text-muted font-mono">Program</span>
                    </button>
                    <button 
                      onClick={() => { setQuery('Apache'); inputRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-raised text-primary text-left text-sm"
                    >
                      <Building2 size={16} className="text-muted" />
                      <span className="flex-1 font-medium">Apache Software Foundation</span>
                      <span className="text-xs text-muted font-mono">Organization</span>
                    </button>
                    <button 
                      onClick={() => { setQuery('React'); inputRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-raised text-primary text-left text-sm"
                    >
                      <Code2 size={16} className="text-muted" />
                      <span className="flex-1 font-medium">React Projects</span>
                      <span className="text-xs text-muted font-mono">Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Programs */}
              {results.programs.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted px-3 mb-1.5">Programs</h4>
                  <ul className="space-y-0.5">
                    {results.programs.map((item) => {
                      const idx = absoluteIndex++;
                      const isSelected = idx === selectedIndex;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm font-medium transition-colors ${
                              isSelected ? 'bg-surface-raised text-brass' : 'text-primary hover:bg-surface-raised'
                            }`}
                          >
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: item.accentColor || 'var(--brass)' }}
                            />
                            <span className="flex-1">{item.name}</span>
                            <span className="text-xs font-mono text-muted">{item.organizer}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Organizations */}
              {results.organizations.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted px-3 mb-1.5">Organizations</h4>
                  <ul className="space-y-0.5">
                    {results.organizations.map((item) => {
                      const idx = absoluteIndex++;
                      const isSelected = idx === selectedIndex;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm font-medium transition-colors ${
                              isSelected ? 'bg-surface-raised text-brass' : 'text-primary hover:bg-surface-raised'
                            }`}
                          >
                            <Building2 size={16} className="text-muted shrink-0" />
                            <span className="flex-1">{item.name}</span>
                            {item.category && <span className="text-xs font-mono text-muted">{item.category}</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted px-3 mb-1.5">Projects</h4>
                  <ul className="space-y-0.5">
                    {results.projects.map((item) => {
                      const idx = absoluteIndex++;
                      const isSelected = idx === selectedIndex;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleSelect(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm font-medium transition-colors ${
                              isSelected ? 'bg-surface-raised text-brass' : 'text-primary hover:bg-surface-raised'
                            }`}
                          >
                            <Code2 size={16} className="text-muted shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-semibold">{item.title}</p>
                              <p className="text-[11px] text-muted truncate">at {item.org}</p>
                            </div>
                            {item.techStack && item.techStack.length > 0 && (
                              <span className="text-[10px] font-mono bg-base px-1.5 py-0.5 border border-hairline rounded text-muted hidden sm:inline">{item.techStack[0]}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t border-hairline px-4 py-3 bg-base flex items-center justify-between text-[11px] font-mono text-muted">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-surface border border-hairline px-1.5 py-0.5 rounded shadow-sm">↑</kbd> <kbd className="bg-surface border border-hairline px-1.5 py-0.5 rounded shadow-sm">↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-surface border border-hairline px-1.5 py-0.5 rounded shadow-sm">↵</kbd> select</span>
          </div>
          <span className="hidden sm:inline">Contribo Universal Search</span>
        </div>
      </div>
    </div>
  );
}
