'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  MessageSquare,
  Plus,
  Share2,
  Star,
} from 'lucide-react';
import type {
  AnnotationStatus,
  ProposalAnnotation,
  ProposalReviewData,
  ReviewerRole,
  RubricEvaluation,
} from '@/lib/proposal-studio/review-types';
import { AnnotationThread } from './AnnotationThread';
import { RubricCard } from './RubricCard';
import { ShareReviewModal } from './ShareReviewModal';

const SECTION_TITLES: Record<string, string> = {
  summary: 'Executive Summary',
  problemStatement: 'Problem Statement',
  architecture: 'Technical Architecture',
  deliverables: 'Deliverables & Milestones',
  timeline: 'Project Timeline',
  testing: 'Testing & QA Strategy',
  risks: 'Risk Mitigation',
  aboutMe: 'Contributor Background',
};

interface ReviewWorkspaceProps {
  initialData: ProposalReviewData;
}

export function ReviewWorkspace({ initialData }: ReviewWorkspaceProps) {
  const [data, setData] = useState<ProposalReviewData>(initialData);
  const [activeTab, setActiveTab] = useState<'annotations' | 'rubric'>('annotations');
  const [statusFilter, setStatusFilter] = useState<'all' | AnnotationStatus>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // New annotation state
  const [selectedSectionForComment, setSelectedSectionForComment] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [authorName, setAuthorName] = useState('Mentor Reviewer');
  const [authorRole, setAuthorRole] = useState<ReviewerRole>('mentor');
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

  const { proposal, annotations, rubricEvaluations, userPermission } = data;
  const canComment = userPermission === 'can_comment' || userPermission === 'can_score';
  const canScore = userPermission === 'can_score';

  const handleStatusChange = (annotationId: string, newStatus: AnnotationStatus) => {
    setData((prev) => ({
      ...prev,
      annotations: prev.annotations.map((a) =>
        a.id === annotationId ? { ...a, status: newStatus } : a
      ),
    }));
  };

  const handleReplyAdded = (annotationId: string, updatedAnnotation: ProposalAnnotation) => {
    setData((prev) => ({
      ...prev,
      annotations: prev.annotations.map((a) =>
        a.id === annotationId ? updatedAnnotation : a
      ),
    }));
  };

  const handleEvaluationSubmitted = (newEvaluation: RubricEvaluation) => {
    setData((prev) => {
      const updated = [...prev.rubricEvaluations, newEvaluation];
      const avg = Math.round(
        updated.reduce((sum, r) => sum + r.weightedScore, 0) / updated.length
      );
      return {
        ...prev,
        rubricEvaluations: updated,
        averageRubricScore: avg,
      };
    });
  };

  const handleCreateAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionForComment || !commentContent.trim()) return;

    setIsAddingAnnotation(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/review/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSectionForComment,
          authorName,
          authorRole,
          content: commentContent.trim(),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setData((prev) => ({
          ...prev,
          annotations: [result.annotation, ...prev.annotations],
        }));
        setCommentContent('');
        setSelectedSectionForComment(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingAnnotation(false);
    }
  };

  const filteredAnnotations = annotations.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const sectionKeys = Object.keys(proposal.sections);

  return (
    <div className="w-full pb-20 space-y-6">
      {/* Top Banner / Review Navigation */}
      <div className="rounded-3xl border border-hairline bg-surface p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/proposal-studio"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-hairline bg-page text-xs font-mono text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Studio</span>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                  {proposal.programName} {proposal.year}
                </span>
                <span className="text-xs font-mono text-muted">{proposal.orgName}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-heading font-bold text-primary truncate max-w-xl">
                {proposal.projectTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data.averageRubricScore !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-mono text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Score: {data.averageRubricScore}%</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent text-white font-mono text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite Reviewer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Proposal Document Reader */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-8 shadow-sm space-y-8">
            <div className="border-b border-hairline pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  Technical Proposal Document
                </span>
                <h2 className="text-2xl font-heading font-bold text-primary mt-1">
                  {proposal.projectTitle}
                </h2>
              </div>
              <div className="px-2.5 py-1 rounded-xl border border-hairline bg-page font-mono text-xs text-muted">
                {sectionKeys.length} Sections
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sectionKeys.map((key) => {
                const title = SECTION_TITLES[key] || key;
                const text = proposal.sections[key] || '';
                const sectionAnnotations = annotations.filter((a) => a.sectionId === key);

                return (
                  <div key={key} id={`sec-${key}`} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-heading font-bold text-primary flex items-center gap-2">
                        <span>{title}</span>
                        {sectionAnnotations.length > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
                            {sectionAnnotations.length} comment{sectionAnnotations.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </h3>

                      {canComment && (
                        <button
                          type="button"
                          onClick={() => setSelectedSectionForComment(key)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-[11px] font-mono text-accent hover:underline cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Note</span>
                        </button>
                      )}
                    </div>

                    <div className="rounded-2xl border border-hairline/60 bg-page/40 p-4 font-mono text-xs leading-relaxed text-secondary whitespace-pre-wrap">
                      {text || <span className="italic text-muted">(Section not authored yet)</span>}
                    </div>

                    {/* Inline Comment Box if active */}
                    {selectedSectionForComment === key && (
                      <form
                        onSubmit={handleCreateAnnotation}
                        className="rounded-2xl border border-accent/40 bg-surface p-4 space-y-3 shadow-md mt-2"
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-primary">Annotate {title}:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedSectionForComment(null)}
                            className="text-muted hover:text-primary"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="Your Name"
                            required
                            className="rounded-xl border border-hairline bg-page px-3 py-1.5 text-primary focus:border-accent focus:outline-none"
                          />
                          <select
                            value={authorRole}
                            onChange={(e) => setAuthorRole(e.target.value as ReviewerRole)}
                            className="rounded-xl border border-hairline bg-page px-3 py-1.5 text-primary focus:border-accent focus:outline-none cursor-pointer"
                          >
                            <option value="mentor">Mentor</option>
                            <option value="alumnus">Alumnus</option>
                            <option value="peer">Peer Reviewer</option>
                          </select>
                        </div>

                        <textarea
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Write constructive inline feedback on this section…"
                          rows={3}
                          required
                          className="w-full rounded-xl border border-hairline bg-page p-3 font-mono text-xs text-primary focus:border-accent focus:outline-none resize-none"
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSectionForComment(null)}
                            className="px-3 py-1.5 rounded-xl font-mono text-xs text-muted hover:text-primary"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isAddingAnnotation || !commentContent.trim()}
                            className="px-4 py-1.5 rounded-xl bg-accent text-white font-mono text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                          >
                            {isAddingAnnotation ? 'Posting…' : 'Post Annotation'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Reviewer Workspace (Annotations & Rubric) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          {/* Tab Switcher */}
          <div className="flex rounded-2xl border border-hairline bg-surface p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('annotations')}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'annotations'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Annotations ({annotations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rubric')}
              className={`flex-1 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'rubric'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Evaluation Rubric</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'annotations' ? (
            <div className="space-y-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                {(['all', 'open', 'addressed', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl border capitalize transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'border-accent bg-accent/10 text-accent font-semibold'
                        : 'border-hairline bg-page text-muted hover:text-primary'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Annotations List */}
              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {filteredAnnotations.length === 0 ? (
                  <div className="rounded-2xl border border-hairline bg-surface p-8 text-center text-xs font-mono text-muted space-y-2">
                    <MessageSquare className="w-6 h-6 text-muted mx-auto" />
                    <div>No annotations found for this filter.</div>
                    {canComment && (
                      <p className="text-[11px]">
                        Click &quot;Add Note&quot; on any section in the document to leave a comment.
                      </p>
                    )}
                  </div>
                ) : (
                  filteredAnnotations.map((ann) => (
                    <AnnotationThread
                      key={ann.id}
                      annotation={ann}
                      proposalId={proposal.id}
                      canComment={canComment}
                      onStatusChange={handleStatusChange}
                      onReplyAdded={handleReplyAdded}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <RubricCard
              proposalId={proposal.id}
              evaluations={rubricEvaluations}
              canScore={canScore}
              onEvaluationSubmitted={handleEvaluationSubmitted}
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareReviewModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        proposalId={proposal.id}
      />
    </div>
  );
}
