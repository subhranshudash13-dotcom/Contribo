'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, Quote, MessageSquarePlus, Send, Sparkles, Check, X, Loader2 } from 'lucide-react';

interface Testimonial {
  name: string;
  initials: string;
  program: string;
  organization: string;
  quote: string;
  accentColor: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Yash Rekhani',
    initials: 'YR',
    role: 'Cloud & Systems Contributor',
    program: "GSoC '25",
    organization: 'CNCF / Kubernetes',
    quote:
      "Finding GSoC projects used to be overwhelming. Contribo's AI Matcher instantly pointed me to CNCF repositories that matched my exact skill set. I got accepted on my first try!",
    accentColor: '#326CE5',
  },
  {
    name: 'Manan Jalewa',
    initials: 'MJ',
    role: 'Kernel & Infrastructure',
    program: "LFX '25",
    organization: 'Linux Foundation',
    quote:
      "The structured project filters and proposal rubric gave me the exact blueprint needed for LFX. Being able to compare past accepted proposals gave me complete confidence.",
    accentColor: '#008BB8',
  },
  {
    name: 'Dipak Raj',
    initials: 'DR',
    role: 'Bitcoin Core & Rust Dev',
    program: "SOB '25",
    organization: 'Summer of Bitcoin',
    quote:
      "The deadline countdowns and real-time stipend metrics kept my application on track while balancing university exams. Contribo eliminated all the guesswork.",
    accentColor: '#F7931A',
  },
  {
    name: 'Sarthak Allawadhi',
    initials: 'SA',
    role: 'Distributed Systems Dev',
    program: "GSoC '25",
    organization: 'Apache Software Foundation',
    quote:
      "The Proposal Studio AI review caught structural gaps in my timeline and architecture diagram before I submitted to the Apache maintainers. A total game-changer for applicants.",
    accentColor: '#D22128',
  },
  {
    name: 'Heet Kakaria',
    initials: 'HK',
    role: 'Applied AI & Security',
    program: "ESoC '26",
    organization: 'European Open Source & AI Hub',
    quote:
      "Tracking multiple proposals and deadlines across different program portals was a headache. With Contribo's unified dashboard, I had all my tasks synced in one place.",
    accentColor: '#10B981',
  },
];

const FEEDBACK_CATEGORIES = [
  'General Feedback',
  'Feature Request',
  'UI/UX',
  'Data Issue',
  'Other',
];

export function ContributorTestimonials() {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('General Feedback');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setError('Please write at least a few words (min 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: category,
          subject: name ? `Feedback from ${name} (${rating}★)` : `Community Feedback (${rating}★)`,
          message: message.trim(),
          userEmail: email.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to submit feedback. Please try again.');
      }

      setSubmitted(true);
      setMessage('');
      setName('');
      setEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-8 py-8 overflow-hidden relative" aria-label="Accepted Contributor Testimonials">
      {/* Section Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
            <Sparkles size={13} />
            <span>Community Voice & Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-primary tracking-tight">
            Accepted Contributors
          </h2>
          <p className="text-secondary text-base sm:text-lg leading-relaxed font-normal">
            Real stories from developers who used Contribo to land their dream open-source internships.
          </p>
        </div>

        {/* Action Button to Open Feedback Form */}
        <div className="shrink-0 pb-1">
          <button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-hairline hover:border-accent/40 text-primary font-semibold text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-95"
          >
            <MessageSquarePlus size={16} className="text-accent" />
            <span>{showFeedbackForm ? 'Close Feedback' : 'Leave Your Feedback'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Feedback Submission Form */}
      {showFeedbackForm && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-[fade_0.25s_ease-out_forwards]">
          <div className="border border-hairline bg-surface/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-brass" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-heading font-bold text-primary">
                  Share Your Contribo Experience
                </h3>
                <p className="text-secondary text-xs sm:text-sm mt-0.5">
                  Your feedback helps improve our matching accuracy, guidelines, and proposal tools.
                </p>
              </div>
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center text-muted hover:text-primary transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
                  <Check size={24} />
                </div>
                <h4 className="text-lg font-heading font-bold text-primary">
                  Thank you for your feedback!
                </h4>
                <p className="text-secondary text-sm max-w-md mx-auto">
                  Your response has been saved directly to our community database and helps us build a better platform.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setShowFeedbackForm(false);
                  }}
                  className="px-5 py-2 bg-surface-raised border border-hairline rounded-xl text-xs font-semibold text-primary hover:bg-surface transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Rating Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2">
                    Overall Experience
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`${star} Stars`}
                      >
                        <Star
                          size={24}
                          className={`${
                            (hoverRating || rating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-hairline'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-muted font-mono ml-2">
                      {rating === 5
                        ? 'Excellent 🚀'
                        : rating === 4
                        ? 'Great 👍'
                        : rating === 3
                        ? 'Good 👌'
                        : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                {/* 2. Category Chips */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted font-bold mb-2">
                    Feedback Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          category === cat
                            ? 'bg-accent text-white border-accent'
                            : 'bg-page/70 border-hairline text-secondary hover:text-primary hover:border-hairline/90'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted font-bold mb-1.5">
                      Your Name / Handle <span className="text-muted/60 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full h-11 px-3.5 rounded-xl border border-hairline bg-page/60 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted font-bold mb-1.5">
                      Email Address <span className="text-muted/60 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-hairline bg-page/60 text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* 4. Message Textarea */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted font-bold mb-1.5">
                    Your Message / Suggestions *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you like about Contribo, features you want to see, or ideas to improve the platform..."
                    className="w-full p-3.5 rounded-xl border border-hairline bg-page/60 text-primary text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                    required
                  />
                  <div className="flex justify-between items-center text-[11px] text-muted font-mono mt-1">
                    <span>Markdown supported</span>
                    <span>{message.length} / 5000</span>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    {error}
                  </p>
                )}

                {/* 5. Submit Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Marquee Wrapper with Edge Fade Gradients */}
      <div className="relative w-full overflow-hidden group">
        {/* Left Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-page via-page/80 to-transparent z-10 pointer-events-none" />

        {/* Right Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-page via-page/80 to-transparent z-10 pointer-events-none" />

        {/* Moving Ticker (Right to Left) with Pause-on-Hover */}
        <div className="flex gap-6 animate-marquee-left pause-on-hover py-4 select-none">
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="w-[340px] sm:w-[400px] shrink-0 bg-surface border border-hairline rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-accent/50 hover:shadow-xl transition-all duration-300 relative group/card"
            >
              {/* Top Quote Icon & 5-Star Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote size={18} className="text-muted/40 group-hover/card:text-accent/60 transition-colors" />
              </div>

              {/* Quote Body */}
              <p className="text-secondary text-sm leading-relaxed mb-6 font-normal">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Contributor Profile */}
              <div className="flex items-center gap-3.5 border-t border-hairline/70 pt-4 mt-auto">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                  style={{
                    backgroundColor: item.accentColor,
                  }}
                >
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-bold text-sm text-primary truncate">
                      {item.name}
                    </h4>
                    <span title="Verified Contributor" className="inline-flex shrink-0">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    </span>
                  </div>
                  <p className="text-xs text-muted font-mono truncate mt-0.5">
                    {item.program} @ {item.organization}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
