'use client';

import React, { useState, useMemo } from 'react';
import { Send } from 'lucide-react';
import { calculateRubricScore } from '@/lib/repositories/proposal-reviews';
import type {
  RecommendationType,
  ReviewerRole,
  RubricEvaluation,
} from '@/lib/proposal-studio/review-types';

interface RubricCardProps {
  proposalId: string;
  evaluations: RubricEvaluation[];
  canScore: boolean;
  onEvaluationSubmitted: (evaluation: RubricEvaluation) => void;
}

export function RubricCard({
  proposalId,
  evaluations,
  canScore,
  onEvaluationSubmitted,
}: RubricCardProps) {
  const [evaluatorName, setEvaluatorName] = useState('Mentor Reviewer');
  const [evaluatorRole, setEvaluatorRole] = useState<ReviewerRole>('mentor');
  const [technicalArchitecture, setTechnicalArchitecture] = useState(4);
  const [deliverablesTimeline, setDeliverablesTimeline] = useState(4);
  const [communityBonding, setCommunityBonding] = useState(4);
  const [longTermImpact, setLongTermImpact] = useState(4);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Live score calculation
  const liveScore = useMemo(() => {
    return calculateRubricScore({
      technicalArchitecture,
      deliverablesTimeline,
      communityBonding,
      longTermImpact,
    });
  }, [technicalArchitecture, deliverablesTimeline, communityBonding, longTermImpact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canScore) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/review/rubric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluatorName,
          evaluatorRole,
          technicalArchitecture,
          deliverablesTimeline,
          communityBonding,
          longTermImpact,
          strengths,
          improvements,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit evaluation');
      const data = await res.json();
      onEvaluationSubmitted(data.evaluation);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecBadge = (rec: RecommendationType) => {
    switch (rec) {
      case 'strong_accept':
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20';
      case 'accept':
        return 'bg-cyan-500/15 text-cyan-500 border-cyan-500/20';
      case 'needs_revision':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/20';
      case 'reject':
        return 'bg-rose-500/15 text-rose-500 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Evaluations Summary */}
      {evaluations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted">
            Submitted Evaluations ({evaluations.length})
          </h4>
          <div className="space-y-3">
            {evaluations.map((ev) => (
              <div
                key={ev.id}
                className="rounded-2xl border border-hairline bg-page/50 p-4 space-y-3 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{ev.evaluatorName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/10 text-accent uppercase font-bold">
                      {ev.evaluatorRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-primary">{ev.weightedScore}%</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getRecBadge(
                        ev.recommendation
                      )}`}
                    >
                      {ev.recommendation.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-secondary">
                  <div>Architecture: {ev.technicalArchitecture}/5</div>
                  <div>Timeline: {ev.deliverablesTimeline}/5</div>
                  <div>Community: {ev.communityBonding}/5</div>
                  <div>Impact: {ev.longTermImpact}/5</div>
                </div>

                {ev.strengths && (
                  <div className="text-muted">
                    <span className="text-primary font-semibold">Strengths:</span> {ev.strengths}
                  </div>
                )}
                {ev.improvements && (
                  <div className="text-muted">
                    <span className="text-primary font-semibold">Areas for Improvement:</span>{' '}
                    {ev.improvements}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Evaluation Form */}
      {canScore ? (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-hairline bg-surface p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-primary">
                Standardized 4-Pillar Evaluation Rubric
              </h3>
              <p className="text-[11px] font-mono text-muted">
                Weighted scoring algorithm designed for mentor proposal triage
              </p>
            </div>

            {/* Score HUD */}
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-primary">
                {liveScore.weightedScore}%
              </div>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${getRecBadge(
                  liveScore.recommendation
                )}`}
              >
                {liveScore.recommendation.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Evaluator Identity */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-muted block text-[11px] mb-1">Your Name / Handle:</label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                required
                className="w-full rounded-xl border border-hairline bg-page px-3 py-1.5 text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-muted block text-[11px] mb-1">Reviewer Role:</label>
              <select
                value={evaluatorRole}
                onChange={(e) => setEvaluatorRole(e.target.value as ReviewerRole)}
                className="w-full rounded-xl border border-hairline bg-page px-3 py-1.5 text-primary focus:border-accent focus:outline-none cursor-pointer"
              >
                <option value="mentor">Mentor</option>
                <option value="alumnus">Alumnus</option>
                <option value="peer">Peer Reviewer</option>
              </select>
            </div>
          </div>

          {/* 4 Pillars Interactive Ratings */}
          <div className="space-y-4">
            {/* Pillar 1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-secondary font-medium">
                  1. Technical Architecture & Feasibility (35%)
                </span>
                <span className="font-bold text-primary">{technicalArchitecture} / 5</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTechnicalArchitecture(star)}
                    className={`flex-1 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                      star <= technicalArchitecture
                        ? 'bg-accent text-white border-accent'
                        : 'bg-page text-muted border-hairline hover:bg-surface-raised'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-secondary font-medium">
                  2. Deliverables & Milestone Timeline (30%)
                </span>
                <span className="font-bold text-primary">{deliverablesTimeline} / 5</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDeliverablesTimeline(star)}
                    className={`flex-1 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                      star <= deliverablesTimeline
                        ? 'bg-accent text-white border-accent'
                        : 'bg-page text-muted border-hairline hover:bg-surface-raised'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-secondary font-medium">
                  3. Community Bonding & Prior Track Record (20%)
                </span>
                <span className="font-bold text-primary">{communityBonding} / 5</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCommunityBonding(star)}
                    className={`flex-1 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                      star <= communityBonding
                        ? 'bg-accent text-white border-accent'
                        : 'bg-page text-muted border-hairline hover:bg-surface-raised'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-secondary font-medium">
                  4. Long-Term Maintenance & Impact (15%)
                </span>
                <span className="font-bold text-primary">{longTermImpact} / 5</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setLongTermImpact(star)}
                    className={`flex-1 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                      star <= longTermImpact
                        ? 'bg-accent text-white border-accent'
                        : 'bg-page text-muted border-hairline hover:bg-surface-raised'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-muted block text-[11px] mb-1">Key Strengths:</label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What did the applicant do especially well?"
                rows={2}
                className="w-full rounded-xl border border-hairline bg-page p-2.5 text-primary focus:border-accent focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-muted block text-[11px] mb-1">Suggested Revisions:</label>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Where should the student focus their next revision cycle?"
                rows={2}
                className="w-full rounded-xl border border-hairline bg-page p-2.5 text-primary focus:border-accent focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <span className="text-[11px] font-mono text-muted">
              {submitSuccess ? '✓ Evaluation saved successfully!' : 'Scorecard is visible to the author'}
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent font-mono text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting…' : 'Submit Evaluation'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-hairline bg-page/50 p-6 text-center text-xs font-mono text-muted">
          Your review link is set to Comment Only. You can leave section annotations in the left panel.
        </div>
      )}
    </div>
  );
}
