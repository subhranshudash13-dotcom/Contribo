'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Code2,
  Check,
  Clock,
  Globe,
  Inbox,
  Github,
  ExternalLink,
  Building2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Star,
  Users,
} from 'lucide-react';
import { SaveButton, TrackApplicationButton } from '@/components/ui/SaveTrackActions';
import { OfflineState } from '@/components/ui/OfflineState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useNetwork } from '@/components/ui/NetworkProvider';
import { OrgLogo } from '@/components/ui/OrgLogo';
import { OrgProjectBarChart } from '@/components/ui/OrgProjectBarChart';
import { friendlyApiMessage, isApiError, runMatcher, type MatchResult } from '@/lib/client/api';

const SKILL_CATEGORIES = [
  {
    name: 'Languages',
    skills: [
      'Python',
      'JavaScript',
      'TypeScript',
      'Java',
      'C++',
      'C',
      'Go',
      'Rust',
      'Ruby',
      'PHP',
      'Kotlin',
      'Swift',
      'R',
      'Julia',
      'C#',
      'Shell',
    ],
  },
  {
    name: 'Frontend & UI',
    skills: [
      'React',
      'Vue',
      'Angular',
      'Svelte',
      'Next.js',
      'TailwindCSS',
      'HTML/CSS',
      'Three.js',
      'D3.js',
      'Flutter',
    ],
  },
  {
    name: 'Backend & Databases',
    skills: [
      'Node.js',
      'Django',
      'Spring Boot',
      'Flask',
      'Express',
      'Ruby on Rails',
      'GraphQL',
      'FastAPI',
      'PostgreSQL',
      'MongoDB',
      'MySQL',
      'Redis',
      'SQL',
    ],
  },
  {
    name: 'DevOps & Infrastructure',
    skills: [
      'Docker',
      'Kubernetes',
      'AWS',
      'Firebase',
      'Linux',
      'Github Actions',
      'Prometheus',
      'WebAssembly',
    ],
  },
  {
    name: 'AI, ML & Science',
    skills: [
      'Machine Learning',
      'Data Science',
      'Deep Learning',
      'PyTorch',
      'TensorFlow',
      'Computer Vision',
      'NLP',
      'Matplotlib',
      'Jupyter',
    ],
  },
];

const AVAILABLE_MATCH_PROGRAMS = [
  { slug: 'gsoc', name: 'Google Summer of Code (GSoC)', color: '#4285F4' },
  { slug: 'hacktoberfest', name: 'Hacktoberfest', color: '#FF7A00' },
  { slug: 'lfx', name: 'LFX Mentorship', color: '#00C0F3' },
  { slug: 'outreachy', name: 'Outreachy', color: '#E37154' },
  { slug: 'summer-of-bitcoin', name: 'Summer of Bitcoin', color: '#F7931A' },
  { slug: 'mlh-fellowship', name: 'MLH Fellowship', color: '#0A2540' },
  { slug: 'gssoc', name: 'GSSoC', color: '#FFB800' },
];

export default function MatcherClient() {
  const { isOnline, browserOnline, recheck, checking } = useNetwork();
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [experience, setExperience] = useState<string>('');
  const [location, setLocation] = useState('worldwide');
  const [availability, setAvailability] = useState('20');
  const [selectedOutputPrograms, setSelectedOutputPrograms] = useState<string[]>([]);

  const [isMatching, setIsMatching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [matchMode, setMatchMode] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchOffline, setMatchOffline] = useState(false);
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

  const toggleOrgStats = (key: string) => {
    setExpandedStats((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const t = customSkill.trim().slice(0, 48);
    if (!t) return;
    if (!selectedSkills.includes(t)) {
      setSelectedSkills((prev) => [...prev, t]);
    }
    setCustomSkill('');
  };

  const handleMatch = async (overridePrograms?: string[]) => {
    const targetPrograms = overridePrograms !== undefined ? overridePrograms : selectedOutputPrograms;
    setStep(5);
    setIsMatching(true);
    setMatchError(null);
    setMatchOffline(false);
    setResults([]);
    setVisibleCount(10);
    setMatchMode(null);

    if (!isOnline) {
      setIsMatching(false);
      setMatchOffline(true);
      setMatchError(
        browserOnline
          ? 'Cannot reach Contribo right now. Check your connection and try again.'
          : 'You appear to be offline. Reconnect to run the matcher.'
      );
      return;
    }

    try {
      const data = await runMatcher({
        skills: selectedSkills,
        experience,
        location,
        availability: parseInt(availability, 10),
        programSlugs: targetPrograms.length > 0 ? targetPrograms : undefined,
      });
      setResults(Array.isArray(data.matches) ? data.matches : []);
      setMatchMode(data.meta?.mode || null);
    } catch (e) {
      const offline = isApiError(e) && e.isOffline;
      setMatchOffline(offline);
      setMatchError(friendlyApiMessage(e, 'Matching failed'));
      setResults([]);
    } finally {
      setIsMatching(false);
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 lg:py-16 max-w-4xl mx-auto w-full">
      {step < 5 && (
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-surface border border-hairline mb-6">
            <Sparkles className="text-brass" size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-3 font-heading">
            Orbit AI Organization Recommender
          </h1>
          <p className="text-base text-muted max-w-xl mx-auto">
            Answer a few quick questions to find and rank the best open-source organizations matching your tech stack, reduce your search space, and explore top projects.
          </p>

          <div className="flex items-center justify-center gap-2 mt-8" aria-label="Progress">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  step >= i ? 'bg-brass' : 'bg-surface-raised border border-hairline'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-surface border border-hairline p-6 md:p-8 rounded-sm"
            >
              <h2 className="text-2xl font-bold text-primary mb-2">Select Your Skills</h2>
              <p className="text-muted mb-8 text-sm">
                Choose technologies you are comfortable with (select as many as apply).
              </p>

              <div className="space-y-8">
                {SKILL_CATEGORIES.map((category) => (
                  <div key={category.name}>
                    <h3 className="text-sm font-mono uppercase tracking-wider text-muted mb-4">
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-sm border text-sm font-medium transition-colors ${
                            selectedSkills.includes(skill)
                              ? 'bg-brass border-brass text-white'
                              : 'bg-page border-hairline text-primary hover:border-muted'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-muted mb-3">
                    Custom skill
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSkill();
                        }
                      }}
                      placeholder="Type and press Enter…"
                      className="flex-1 p-3 bg-page border border-hairline rounded-sm text-primary focus:outline-none focus:border-brass text-sm"
                      maxLength={48}
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="px-4 py-2 border border-hairline rounded-sm text-sm font-medium hover:border-brass/40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-hairline flex items-center justify-between">
                <span className="font-mono text-xs text-muted">
                  {selectedSkills.length} skills selected
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={selectedSkills.length === 0}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-surface border border-hairline p-6 md:p-8 rounded-sm"
            >
              <h2 className="text-2xl font-bold text-primary mb-2">Experience Level</h2>
              <p className="text-muted mb-8 text-sm">
                What&apos;s your experience level with open source contributions?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'beginner', title: 'Beginner', desc: 'New to open source' },
                  { id: 'intermediate', title: 'Intermediate', desc: 'Some contributions' },
                  { id: 'advanced', title: 'Advanced', desc: 'Many contributions' },
                ].map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setExperience(level.id)}
                    className={`p-6 border rounded-sm text-left transition-all ${
                      experience === level.id
                        ? 'border-brass bg-surface-raised ring-1 ring-brass'
                        : 'border-hairline bg-page hover:border-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-primary">{level.title}</h3>
                      {experience === level.id && <Check size={16} className="text-brass" />}
                    </div>
                    <p className="text-sm text-muted">{level.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-hairline flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-muted hover:text-primary flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!experience}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-surface border border-hairline p-6 md:p-8 rounded-sm"
            >
              <h2 className="text-2xl font-bold text-primary mb-2">Interests & Preferences</h2>
              <p className="text-muted mb-8 text-sm">
                Let us know your availability and constraints.
              </p>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <Globe size={16} className="text-muted" /> Location Preference
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-3 bg-page border border-hairline rounded-sm text-primary focus:outline-none focus:border-brass"
                  >
                    <option value="worldwide">Worldwide (Remote)</option>
                    <option value="us">United States</option>
                    <option value="eu">Europe</option>
                    <option value="asia">Asia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-muted" /> Weekly Availability (Hours)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="5"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full accent-brass"
                    />
                    <span className="font-mono text-primary w-16 text-right font-bold">
                      {availability}h
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-hairline flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-muted hover:text-primary flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-surface border border-hairline p-6 md:p-8 rounded-sm"
            >
              <h2 className="text-2xl font-bold text-primary mb-2">Review & Match</h2>
              <p className="text-muted mb-8 text-sm">
                Confirm your profile and find the best-fitting projects.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-muted mb-3 border-b border-hairline pb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map((s) => (
                      <span
                        key={s}
                        className="bg-page border border-hairline px-2 py-0.5 rounded-sm text-xs font-mono text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-mono uppercase tracking-wider text-muted mb-2 border-b border-hairline pb-2">
                      Experience
                    </h3>
                    <p className="text-primary font-medium capitalize">{experience}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-mono uppercase tracking-wider text-muted mb-2 border-b border-hairline pb-2">
                      Location
                    </h3>
                    <p className="text-primary font-medium capitalize">{location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-mono uppercase tracking-wider text-muted mb-2 border-b border-hairline pb-2">
                      Availability
                    </h3>
                    <p className="text-primary font-medium">{availability} hours/week</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-hairline flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-muted hover:text-primary flex items-center gap-2 text-sm font-medium"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => void handleMatch()}
                  className="bg-brass text-white px-8 py-3 rounded-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 font-heading"
                >
                  <Sparkles size={18} /> Find Recommended Organizations
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {isMatching ? (
                <LoadingState
                  title="Recommending top organizations for your stack…"
                  description="Orbit AI Matcher + Neural Org Recommender"
                  variant="page"
                  label="Matching organizations"
                />
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-primary mb-3 font-heading">
                      Recommended Organizations
                    </h2>
                    <p className="text-muted max-w-xl mx-auto">
                      {results.length > 0
                        ? `Showing ${Math.min(visibleCount, results.length)} of ${results.length} ranked organizations tailored to your tech stack. Pick the right org to reduce your search space and explore their projects.`
                        : 'No ranked organizations for this profile.'}
                    </p>
                    {matchMode && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brass/10 border border-brass/30 text-brass text-xs font-mono font-bold shadow-xs">
                          <Sparkles size={13} className="text-brass" />
                          <span>
                            {matchMode === 'gemini'
                              ? 'Orbit AI • Gemini 3.8 Flash'
                              : matchMode === 'openai'
                              ? 'Orbit AI • Neural Engine'
                              : 'Orbit AI • Skill Specificity Matcher'}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Program Filter Controls in Output Section */}
                  <div className="bg-surface border border-hairline p-4 rounded-sm space-y-3 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                        Filter Matches by Program:
                      </span>
                      {selectedOutputPrograms.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOutputPrograms([]);
                            void handleMatch([]);
                          }}
                          className="text-[11px] font-mono text-brass hover:underline"
                        >
                          Clear filters (Show All)
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOutputPrograms([]);
                          void handleMatch([]);
                        }}
                        className={`px-3 py-1.5 rounded-sm border text-xs font-medium font-mono transition-all ${
                          selectedOutputPrograms.length === 0
                            ? 'bg-brass text-white border-brass font-bold'
                            : 'bg-page border-hairline text-muted hover:border-brass/40'
                        }`}
                      >
                        All Programs
                      </button>
                      {AVAILABLE_MATCH_PROGRAMS.map((p) => {
                        const isSelected = selectedOutputPrograms.includes(p.slug);
                        return (
                          <button
                            key={p.slug}
                            type="button"
                            onClick={() => {
                              let next: string[];
                              if (isSelected) {
                                next = selectedOutputPrograms.filter((s) => s !== p.slug);
                              } else {
                                next = [...selectedOutputPrograms, p.slug];
                              }
                              setSelectedOutputPrograms(next);
                              void handleMatch(next);
                            }}
                            className={`px-3 py-1.5 rounded-sm border text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-surface-raised border-brass text-primary font-bold shadow-sm ring-1 ring-brass'
                                : 'bg-page border-hairline text-muted hover:border-hairline/80'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: p.color }}
                            />
                            <span>{p.name}</span>
                            {isSelected && <Check size={12} className="text-brass ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {matchOffline ? (
                    <OfflineState
                      reason={browserOnline ? 'server' : 'browser'}
                      description={matchError || undefined}
                      onRetry={async () => {
                        await recheck();
                        await handleMatch();
                      }}
                      retrying={checking || isMatching}
                    />
                  ) : matchError ? (
                    <div
                      role="alert"
                      className="p-4 rounded-sm border border-alert/40 bg-alert/10 text-sm text-alert text-center space-y-3"
                    >
                      <p>{matchError}</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => void handleMatch()}
                          className="text-brass font-bold hover:underline"
                        >
                          Retry match
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-muted font-medium hover:underline"
                        >
                          Start over
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {!matchOffline && !matchError && results.length === 0 ? (
                    <div className="text-center py-14 border border-dashed border-hairline bg-surface rounded-sm">
                      <Inbox size={28} className="mx-auto text-muted mb-3" />
                      <p className="text-primary font-medium mb-1">No organizations found</p>
                      <p className="text-muted text-sm max-w-md mx-auto mb-4">
                        Try broader skills (e.g. Python + React) or a different experience
                        level.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="mt-2 text-brass font-bold hover:underline"
                      >
                        Start over
                      </button>
                    </div>
                  ) : !matchOffline && !matchError && results.length > 0 ? (
                    <>
                      {results.slice(0, visibleCount).map((match, i) => {
                        const orgName = match.orgName || match.name || match.title || 'Organization';
                        const orgSlug = match.orgSlug || match.slug || '';
                        const cardKey = `match-${i}-${orgSlug || orgName}`;
                        const isStatsOpen = expandedStats[cardKey] ?? false;

                        const orgDirectWebsite =
                          match.orgWebsiteUrl ||
                          match.websiteUrl ||
                          match.orgGithubUrl ||
                          match.githubUrl ||
                          `https://www.google.com/search?q=${encodeURIComponent(orgName + ' open source')}`;

                        const exploreUrl = match.exploreProjectsUrl || `/organizations/${orgSlug || encodeURIComponent(orgName)}`;
                        const activeYear = match.latestYear || match.year || 2026;

                        return (
                          <div
                            key={cardKey}
                            className="group border border-hairline rounded-2xl bg-surface hover:bg-surface-raised/40 transition-all duration-200 relative shadow-sm overflow-hidden"
                          >
                            {/* Top Program Accent Strip */}
                            <div
                              className="h-[3px] w-full"
                              style={{ backgroundColor: match.programColor || '#4285F4' }}
                            />

                            <div className="p-5 sm:p-7 space-y-5">
                              {/* ── 1. ORGANIZATION HEADER & SCORE ── */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                  <OrgLogo
                                    logoUrl={match.orgLogoUrl}
                                    name={orgName}
                                    slug={orgSlug}
                                    className="w-14 h-14 rounded-2xl shrink-0 border border-hairline bg-page shadow-xs"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Link
                                        href={exploreUrl}
                                        className="text-xl font-heading font-bold text-primary hover:text-accent transition-colors truncate flex items-center gap-1.5"
                                      >
                                        {orgName}
                                        <ArrowRight size={15} className="text-muted group-hover:text-accent shrink-0 transition-transform group-hover:translate-x-0.5" />
                                      </Link>
                                      <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 bg-page border border-hairline text-muted rounded-full font-medium">
                                        {match.orgCategory || match.category || 'Open Source'}
                                      </span>
                                      {activeYear && (
                                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full">
                                          {activeYear}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted line-clamp-2 mt-1 font-normal leading-relaxed">
                                      {match.orgDescription || match.description || `${orgName} is an active open-source organization in ${match.programName}.`}
                                    </p>
                                  </div>
                                </div>

                                {/* Match Percentage Pill */}
                                <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                                  <span className="font-mono text-xs sm:text-sm font-bold text-brass bg-brass/10 border border-brass/30 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-brass" />
                                    <span>{match.matchPercentage}% Match</span>
                                  </span>
                                  <span className="text-[11px] font-mono text-muted">
                                    {match.programName || 'Open Source'}
                                  </span>
                                </div>
                              </div>

                              {/* ── 2. ORBIT AI REASONING CALLOUT ── */}
                              {match.reasoning && (
                                <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-accent/5 border border-accent/20 text-xs sm:text-sm text-primary leading-relaxed shadow-xs">
                                  <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <span className="font-bold text-[11px] font-mono uppercase tracking-wider text-accent block">
                                      Orbit AI Evaluation:
                                    </span>
                                    <p className="text-secondary font-normal">
                                      {match.reasoning}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* ── 3. TECH STACK & MATCHED SKILLS BADGES ── */}
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2 text-xs font-mono text-muted flex-wrap">
                                  <Code2 size={14} className="shrink-0 text-muted" />
                                  <span className="text-muted text-[11px] font-mono uppercase font-bold">Stack:</span>
                                  {(match.technologies || match.techStack || []).slice(0, 10).map((t: string) => {
                                    const isMatched = match.matchedSkills?.some(
                                      (m) => m.toLowerCase() === t.toLowerCase()
                                    );
                                    return (
                                      <span
                                        key={t}
                                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                                          isMatched
                                            ? 'border border-brass/60 text-brass font-bold bg-brass/10 shadow-xs'
                                            : 'border border-hairline bg-page text-secondary'
                                        }`}
                                      >
                                        {isMatched ? `✓ ${t}` : t}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* ── EXPANDABLE ANNUAL PROJECT HISTORY GRAPH ── */}
                              {isStatsOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden pt-2"
                                >
                                  <OrgProjectBarChart data={match.yearlyStats} orgName={orgName} />
                                </motion.div>
                              )}

                              {/* ── 4. ACTION FOOTER WITH EXPLORE PROJECTS CTA ── */}
                              <div className="pt-4 border-t border-hairline/70 flex flex-wrap items-center justify-between gap-3">
                                {/* Left: Direct External Links & Org Stats */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <a
                                    href={orgDirectWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-page hover:bg-surface-raised border border-hairline hover:border-accent/40 text-primary text-xs font-mono font-medium transition-all"
                                    title={`Visit ${orgName} official website`}
                                  >
                                    <Globe size={13} className="text-accent" />
                                    <span>Website</span>
                                  </a>

                                  {(match.orgGithubUrl || match.githubUrl) && (
                                    <a
                                      href={match.orgGithubUrl || match.githubUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-page hover:bg-surface-raised border border-hairline hover:border-accent/40 text-primary text-xs font-mono font-medium transition-all"
                                      title={`Visit ${orgName} on GitHub`}
                                    >
                                      <Github size={13} className="text-muted" />
                                      <span>GitHub</span>
                                    </a>
                                  )}

                                  {(match.orgIdeasUrl || match.ideasUrl) && (
                                    <a
                                      href={match.orgIdeasUrl || match.ideasUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-page hover:bg-surface-raised border border-hairline hover:border-accent/40 text-primary text-xs font-mono font-medium transition-all"
                                      title={`${orgName} Project Ideas List`}
                                    >
                                      <span>Ideas List</span>
                                      <ExternalLink size={11} className="text-muted" />
                                    </a>
                                  )}

                                  {/* Org Stats Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => toggleOrgStats(cardKey)}
                                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                                      isStatsOpen
                                        ? 'bg-brass text-white shadow-xs'
                                        : 'bg-page hover:bg-surface-raised border border-hairline text-muted hover:text-primary'
                                    }`}
                                    title="Inspect annual project volume from 2017 to 2026"
                                  >
                                    <BarChart3 size={13} className="shrink-0" />
                                    <span>{isStatsOpen ? 'Hide History' : 'Activity History'}</span>
                                    {isStatsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                  </button>
                                </div>

                                {/* Right: Save Org + Explore Projects Primary Action */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <SaveButton
                                    payload={{
                                      type: 'organization',
                                      targetId: match.id || orgSlug || orgName,
                                      title: orgName,
                                      slug: orgSlug,
                                      programSlug: match.programSlug,
                                      techStack: match.technologies || match.techStack,
                                    }}
                                  />

                                  <Link
                                    href={exploreUrl}
                                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-accent text-white text-xs font-mono font-bold uppercase hover:bg-accent-hover transition-all shadow-sm hover:shadow-md hover:translate-x-0.5"
                                    title={`Explore all project ideas from ${orgName}`}
                                  >
                                    <FolderGit2 size={14} />
                                    <span>Explore Projects</span>
                                    <ArrowRight size={14} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* ── VIEW MORE / SHOW LESS CONTROLS ── */}
                      {results.length > visibleCount && (
                        <div className="pt-3 text-center">
                          <button
                            type="button"
                            onClick={() => setVisibleCount((prev) => Math.min(prev + 8, results.length))}
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-surface border border-brass/40 hover:border-brass text-primary font-heading font-bold text-sm hover:bg-surface-raised transition-all shadow-xs hover:shadow-md group"
                          >
                            <ChevronDown size={17} className="text-brass group-hover:translate-y-0.5 transition-transform" />
                            <span>View More Organizations ({results.length - visibleCount} remaining)</span>
                          </button>
                        </div>
                      )}

                      {results.length > 10 && visibleCount >= results.length && (
                        <div className="pt-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setVisibleCount(10);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-hairline hover:border-muted text-muted hover:text-primary font-mono text-xs font-medium transition-all"
                          >
                            <ChevronUp size={14} className="text-muted" />
                            <span>Show Less (Collapse to 10)</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : null}

                  <div className="text-center pt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-muted hover:text-primary font-mono text-sm uppercase tracking-wide"
                    >
                      ← Refine search
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
