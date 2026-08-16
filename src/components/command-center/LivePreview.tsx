import React from 'react';
import { ProposalDraft } from './CommandCenterClient';
import { Download, FileText, CheckCircle2 } from 'lucide-react';

interface LivePreviewProps {
  draft: ProposalDraft;
}

export function LivePreview({ draft }: LivePreviewProps) {
  
  const generateMarkdown = () => {
    return `# ${draft.program} Proposal Draft
${draft.org ? `**Target Organization:** ${draft.org}` : ''}

## 1. Technical Plan
${draft.techSpec || '*Not started*'}

## 2. Prior Contributions
${draft.contributions || '*Not started*'}

## 3. Detailed Timeline
${draft.timeline || '*Not started*'}

## 4. About Me
${draft.bio || '*Not started*'}

## 5. Risks & Alternatives
${draft.risks || '*Not started*'}
`;
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal_${draft.program}_Draft.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-hairline bg-surface-raised flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-primary font-heading font-semibold">
          <FileText size={16} className="text-accent" />
          <span>Live Preview</span>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-md text-xs font-medium hover:bg-accent/90 transition-colors"
        >
          <Download size={14} /> Export Markdown
        </button>
      </div>

      {/* Rendered Output (Simulated Markdown parsing for MVP) */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-surface text-primary">
        <div className="max-w-2xl mx-auto prose prose-invert prose-sm sm:prose-base prose-a:text-accent prose-headings:text-primary prose-strong:text-primary">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 pb-4 border-b border-hairline">
            {draft.program} Proposal Draft
          </h1>
          
          {draft.org && (
            <p className="mb-8 text-secondary">
              <strong className="text-primary">Target Organization:</strong> {draft.org}
            </p>
          )}

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                1. Technical Plan 
                {draft.techSpec.length > 20 && <CheckCircle2 size={16} className="text-success" />}
              </h2>
              <div className="text-secondary whitespace-pre-wrap leading-relaxed font-sans text-sm p-4 bg-surface-raised rounded-xl border border-hairline min-h-[100px]">
                {draft.techSpec || <span className="text-tertiary italic">Not started...</span>}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                2. Prior Contributions
                {draft.contributions.length > 20 && <CheckCircle2 size={16} className="text-success" />}
              </h2>
              <div className="text-secondary whitespace-pre-wrap leading-relaxed font-sans text-sm p-4 bg-surface-raised rounded-xl border border-hairline min-h-[100px]">
                {draft.contributions || <span className="text-tertiary italic">Not started...</span>}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                3. Detailed Timeline
                {draft.timeline.length > 20 && <CheckCircle2 size={16} className="text-success" />}
              </h2>
              <div className="text-secondary whitespace-pre-wrap leading-relaxed font-sans text-sm p-4 bg-surface-raised rounded-xl border border-hairline min-h-[100px]">
                {draft.timeline || <span className="text-tertiary italic">Not started...</span>}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                4. About You
                {draft.bio.length > 20 && <CheckCircle2 size={16} className="text-success" />}
              </h2>
              <div className="text-secondary whitespace-pre-wrap leading-relaxed font-sans text-sm p-4 bg-surface-raised rounded-xl border border-hairline min-h-[100px]">
                {draft.bio || <span className="text-tertiary italic">Not started...</span>}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                5. Risks & Alternatives
                {draft.risks.length > 20 && <CheckCircle2 size={16} className="text-success" />}
              </h2>
              <div className="text-secondary whitespace-pre-wrap leading-relaxed font-sans text-sm p-4 bg-surface-raised rounded-xl border border-hairline min-h-[100px]">
                {draft.risks || <span className="text-tertiary italic">Not started...</span>}
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
