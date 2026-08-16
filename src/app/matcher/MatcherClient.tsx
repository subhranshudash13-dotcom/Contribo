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
} from 'lucide-react';
import { SaveButton, TrackApplicationButton } from '@/components/ui/SaveTrackActions';
import { OfflineState } from '@/components/ui/OfflineState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useNetwork } from '@/components/ui/NetworkProvider';
import { friendlyApiMessage, isApiError, runMatcher } from '@/lib/client/api';

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

type MatchResult = {
  id?: string;
  projectId?: string;
  title: string;
  orgName: string;
  orgSlug?: string;
  techStack: string[];
  description: string;
  matchPercentage: number;
  reasoning: string;
  programName: string;
  programColor: string;
  programSlug?: string;
  difficulty?: string;
  year?: number;
  matchedSkills?: string[];
};

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
  const [matchMode, setMatchMode] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchOffline, setMatchOffline] = useState(false);

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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary mb-3">
            AI Project Matcher
          </h1>
          <p className="text-base text-muted max-w-xl mx-auto">
            Answer a few questions and we will rank real projects from the catalog against your
            skills.
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
                              : 'bg-base border-hairline text-primary hover:border-muted'
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
                      className="flex-1 p-3 bg-base border border-hairline rounded-sm text-primary focus:outline-none focus:border-brass text-sm"
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
                  className="bg-primary text-base px-6 py-2.5 rounded-sm font-bold hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2"
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
                        : 'border-hairline bg-base hover:border-muted'
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
                  className="bg-primary text-base px-6 py-2.5 rounded-sm font-bold hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2"
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
                    className="w-full p-3 bg-base border border-hairline rounded-sm text-primary focus:outline-none focus:border-brass"
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
                  className="bg-primary text-base px-6 py-2.5 rounded-sm font-bold hover:bg-muted transition-colors flex items-center gap-2"
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
                        className="bg-base border border-hairline px-2 py-0.5 rounded-sm text-xs font-mono text-primary"
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
                  className="bg-brass text-white px-8 py-3 rounded-sm font-bold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Sparkles size={18} /> Find My Matches
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
                  title="Ranking projects for your stack…"
                  description="Skill filter + AI ranker"
                  variant="page"
                  label="Matching projects"
                />
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-primary mb-3">Your matches</h2>
                    <p className="text-muted">
                      {results.length > 0
                        ? `Top ${results.length} projects ordered by skill fit.`
                        : 'No ranked results for this profile.'}
                      {matchMode && (
                        <span className="block mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">
                          Mode: {matchMode}
                        </span>
                      )}
                    </p>
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
                            : 'bg-base border-hairline text-muted hover:border-brass/40'
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
                                : 'bg-base border-hairline text-muted hover:border-hairline/80'
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
                      <p className="text-primary font-medium mb-1">No matches found</p>
                      <p className="text-muted text-sm max-w-md mx-auto mb-4">
                        Try broader skills (e.g. Python + JavaScript) or a different experience
                        level. Tech tokens in the catalog are often lowercase.
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
                    results.map((match, i) => {
                      const pid = match.projectId || match.id || '';
                      return (
                        <div
                          key={pid || i}
                          className="group border border-hairline rounded-sm p-6 bg-surface flex flex-col hover:bg-surface-raised transition-colors relative"
                        >
                          <div
                            className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: match.programColor || '#C9A24B' }}
                          />

                          <div className="flex justify-between items-start mb-4 gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-mono text-[10px] uppercase tracking-wider bg-base px-2 py-0.5 border border-hairline text-muted">
                                  {match.programName || 'Program'}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-wider text-brass font-bold">
                                  {match.matchPercentage}% Match
                                </span>
                                {match.difficulty && (
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                                    {match.difficulty}
                                  </span>
                                )}
                                {match.year && (
                                  <span className="font-mono text-[10px] text-muted">
                                    {match.year}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-primary group-hover:text-brass transition-colors">
                                {match.title}
                              </h3>
                              <p className="text-sm text-muted mt-1">{match.orgName}</p>
                            </div>
                          </div>

                          <p className="text-sm text-muted mb-4 line-clamp-3 leading-relaxed">
                            {match.description}
                          </p>

                          <div className="bg-base border border-hairline p-4 rounded-sm mb-4">
                            <p className="text-sm text-primary flex items-start gap-3">
                              <Sparkles size={16} className="text-brass shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-brass">Why it matches:</strong>{' '}
                                {match.reasoning}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono text-muted mt-auto pt-4 border-t border-hairline flex-wrap">
                            <Code2 size={14} className="shrink-0" />
                            {match.techStack?.slice(0, 8).map((t: string) => (
                              <span
                                key={t}
                                className={`bg-base border px-1.5 py-0.5 rounded-sm ${
                                  match.matchedSkills?.some(
                                    (m) => m.toLowerCase() === t.toLowerCase()
                                  )
                                    ? 'border-brass/50 text-brass'
                                    : 'border-hairline'
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>

                          {pid && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-hairline/80">
                              <SaveButton
                                payload={{
                                  type: 'project',
                                  targetId: pid,
                                  title: match.title,
                                  subtitle: match.orgName,
                                  slug: match.orgSlug,
                                  programSlug: match.programSlug,
                                  techStack: match.techStack?.slice(0, 12),
                                }}
                              />
                              <TrackApplicationButton
                                payload={{
                                  projectId: pid,
                                  projectTitle: match.title,
                                  orgName: match.orgName,
                                  orgSlug: match.orgSlug,
                                  programSlug: match.programSlug,
                                  programName: match.programName,
                                  status: 'researching',
                                }}
                              />

                              <Link
                                href={`/proposal-studio?project=${encodeURIComponent(match.title)}&org=${encodeURIComponent(match.orgName)}`}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-accent text-white text-xs font-mono font-bold uppercase hover:bg-accent-hover transition-colors"
                              >
                                <Sparkles size={12} />
                                <span>Proposal: Not Started [Start]</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })
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
