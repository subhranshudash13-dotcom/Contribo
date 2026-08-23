import React from 'react';
import { Mail, AlertTriangle, CheckSquare } from 'lucide-react';

export function MentorPlaybook() {
  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-heading font-semibold text-primary mb-4">Mentor Playbook</h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Learn exactly how mentors evaluate proposals, why they reject them, and how to communicate effectively.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Outreach Templates */}
        <div className="bg-surface border border-hairline rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="text-accent" size={24} />
            <h3 className="text-xl font-semibold text-primary">Outreach Templates</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-surface-raised rounded-xl border border-hairline text-sm text-secondary font-mono whitespace-pre-wrap">
              {`Subject: Question regarding [Issue #123] in [Project Name]

Hi [Mentor Name/Team],

I'm [Your Name], an aspiring contributor for [GSoC/Outreachy]. I've been reviewing the codebase and am interested in tackling [Issue/Feature]. 

I have successfully set up the local environment, but I have a specific question about the architecture:
- [Insert one highly specific, technical question here. Show you have already tried to find the answer].

Thank you for your time!
[Your Name] | [GitHub Link]`}
            </div>
            <p className="text-xs text-tertiary">
              *Pro Tip: Never start with &ldquo;Hi, I want to contribute, please guide me.&rdquo; Mentors ignore vague requests. Show proof of work first.*
            </p>
          </div>
        </div>

        {/* Common Rejection Reasons */}
        <div className="bg-surface border border-hairline rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="text-error" size={24} />
            <h3 className="text-xl font-semibold text-primary">Common Rejection Reasons</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-error font-bold mt-0.5">1.</span>
              <p className="text-sm text-secondary">
                <strong className="text-primary block">Zero prior contributions.</strong> 
                Mentors prioritize candidates who have already proven they can navigate the build system and community norms. Submitting a proposal without a merged or open PR is the #1 reason for rejection.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-error font-bold mt-0.5">2.</span>
              <p className="text-sm text-secondary">
                <strong className="text-primary block">Vague Timeline.</strong> 
                Writing &ldquo;Week 1: Write code. Week 2: Write tests.&rdquo; is an instant fail. You must break deliverables down by specific files, API endpoints, or UI components.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-error font-bold mt-0.5">3.</span>
              <p className="text-sm text-secondary">
                <strong className="text-primary block">No technical depth.</strong> 
                If your proposal reads like a product pitch rather than an engineering specification, mentors will assume you don&apos;t know how to build it.
              </p>
            </li>
          </ul>
        </div>

        {/* Evaluation Checklist */}
        <div className="bg-surface border border-hairline rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <CheckSquare className="text-success" size={24} />
            <h3 className="text-xl font-semibold text-primary">How Mentors Evaluate</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-raised rounded-xl text-sm text-secondary">
              <strong className="text-primary block mb-2">Technical Competence (40%)</strong>
              Does the candidate understand the architecture? Do they reference actual files in the repo? Is their timeline realistic?
            </div>
            <div className="p-4 bg-surface-raised rounded-xl text-sm text-secondary">
              <strong className="text-primary block mb-2">Community Fit (30%)</strong>
              Has the candidate been polite in the issue tracker? Do they accept code review gracefully? Are they communicative?
            </div>
            <div className="p-4 bg-surface-raised rounded-xl text-sm text-secondary">
              <strong className="text-primary block mb-2">Proof of Work (30%)</strong>
              Have they merged at least one PR? Are they actively helping other newcomers in Discord/Slack?
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
