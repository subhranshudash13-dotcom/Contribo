'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, X, Send, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { friendlyApiMessage, submitUserFeedback } from '@/lib/client/api';

export function FeedbackModal({
  isOpen,
  onClose,
  defaultType = 'Feature Request',
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
}) {
  const [type, setType] = useState<string>(defaultType);
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || message.trim().length < 5) {
      setErrorMsg('Please enter a description (at least 5 characters).');
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setErrorMsg('You are offline. Reconnect to submit feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitUserFeedback({
        type,
        subject: subject || `${type} Submission`,
        message,
        userEmail: email,
      });
      setSuccessMsg(res.message || 'Thank you! Your feedback has been received.');
      setTimeout(() => {
        setSuccessMsg(null);
        setSubject('');
        setMessage('');
        setEmail('');
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(friendlyApiMessage(err, 'Failed to submit feedback. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-hairline rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent" />

        <div className="flex justify-between items-center border-b border-hairline pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <MessageSquarePlus size={18} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-primary">Request a Feature & Feedback</h3>
              <p className="text-xs font-mono text-muted">Tell us what to add or improve next on Contribo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary p-1 text-sm font-mono cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 size={40} className="text-merge mx-auto" />
            <h4 className="font-heading font-bold text-lg text-primary">{successMsg}</h4>
            <p className="text-xs text-secondary font-mono">Our core team reviews every suggestion carefully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl border border-error/30 bg-error/10 text-xs text-error font-mono flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                Feedback Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-base border border-hairline rounded-xl px-3.5 py-2.5 text-xs font-mono text-primary font-semibold focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="Feature Request">✨ Feature Request</option>
                <option value="New Program Proposal">🚀 Suggest New Mentorship Program (GSoC/LFX/C4GT/etc.)</option>
                <option value="Proposal Library Addition">📚 Suggest Proposal Sample for Library</option>
                <option value="Bug Report">🐛 Bug Report</option>
                <option value="General Feedback">💬 General Feedback</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Add C4GT & SoD sample proposals to library"
                className="w-full bg-base border border-hairline rounded-xl px-3.5 py-2.5 text-xs font-mono text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                Details & Description <span className="text-accent">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the feature or improvement you'd love to see on Contribo..."
                className="w-full bg-base border border-hairline rounded-xl p-3.5 text-xs font-mono text-primary focus:outline-none focus:border-accent leading-relaxed"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                Your Email <span className="text-muted text-[10px] font-normal">(Optional for follow-up)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-base border border-hairline rounded-xl px-3.5 py-2.5 text-xs font-mono text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-hairline rounded-xl font-mono text-xs font-bold text-secondary hover:text-primary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
