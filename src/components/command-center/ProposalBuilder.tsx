import React, { useState } from 'react';
import { ProposalDraft, ProgramType } from './CommandCenterClient';
import { PROGRAM_PRESETS } from './data';
import { 
  ChevronDown, 
  Lightbulb, 
  CheckCircle2, 
  Info, 
  Settings2,
  RefreshCw
} from 'lucide-react';

interface ProposalBuilderProps {
  draft: ProposalDraft;
  setDraft: React.Dispatch<React.SetStateAction<ProposalDraft>>;
}

type SectionKey = 'techSpec' | 'contributions' | 'timeline' | 'bio' | 'risks';

export function ProposalBuilder({ draft, setDraft }: ProposalBuilderProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('techSpec');
  const [showExample, setShowExample] = useState<boolean>(false);

  const sections: { key: SectionKey; title: string }[] = [
    { key: 'techSpec', title: '1. Technical Plan' },
    { key: 'contributions', title: '2. Prior Contributions' },
    { key: 'timeline', title: '3. Detailed Timeline' },
    { key: 'bio', title: '4. About You' },
    { key: 'risks', title: '5. Risks & Alternatives' },
  ];

  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as ProgramType;
    setDraft(prev => ({ ...prev, program: val }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(prev => ({ ...prev, [activeSection]: e.target.value }));
  };

  const activePreset = PROGRAM_PRESETS[draft.program] || PROGRAM_PRESETS['General'];
  const instructions = activePreset.instructions[activeSection];
  const exampleText = activePreset[activeSection];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Builder Header / Program Selector */}
      <div className="p-4 border-b border-hairline bg-surface-raised flex items-center justify-between shrink-0">
        <h2 className="font-heading font-semibold text-primary">Proposal Outline</h2>
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-tertiary" />
          <select 
            value={draft.program} 
            onChange={handleProgramChange}
            className="bg-surface border border-hairline rounded-md text-xs px-2 py-1 text-primary focus:outline-none focus:border-accent"
          >
            <option value="GSoC">GSoC</option>
            <option value="Outreachy">Outreachy</option>
            <option value="LFX">LFX Mentorship</option>
            <option value="General">General / Other</option>
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sections Sidebar */}
        <div className="w-48 sm:w-56 border-r border-hairline bg-surface overflow-y-auto py-2 shrink-0">
          {sections.map(sec => (
            <button
              key={sec.key}
              onClick={() => { setActiveSection(sec.key); setShowExample(false); }}
              className={`w-full text-left px-4 py-3 text-sm font-medium border-l-2 transition-colors ${
                activeSection === sec.key 
                  ? 'border-accent bg-accent/5 text-accent' 
                  : 'border-transparent text-secondary hover:bg-surface-raised hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{sec.title}</span>
                {draft[sec.key].trim().length > 20 && (
                  <CheckCircle2 size={14} className="text-success" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-surface overflow-hidden relative">
          
          {/* Contextual Coaching */}
          <div className="p-4 bg-accent/5 border-b border-accent/10 shrink-0">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-accent mt-0.5 shrink-0" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-accent mb-1 uppercase tracking-wider">
                  Mentor Advice for {draft.program}
                </h4>
                <p className="text-xs text-primary/80 leading-relaxed">
                  {instructions}
                </p>
              </div>
            </div>
          </div>

          {/* Editor Header / Toggles */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline shrink-0">
            <span className="text-sm font-semibold text-primary">
              {sections.find(s => s.key === activeSection)?.title}
            </span>
            <div className="flex items-center bg-surface-raised rounded-lg p-0.5 border border-hairline">
              <button 
                onClick={() => setShowExample(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!showExample ? 'bg-surface shadow-sm text-primary' : 'text-tertiary hover:text-secondary'}`}
              >
                My Draft
              </button>
              <button 
                onClick={() => setShowExample(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${showExample ? 'bg-surface shadow-sm text-primary' : 'text-tertiary hover:text-secondary'}`}
              >
                Example
              </button>
            </div>
          </div>

          {/* Editor/Example Body */}
          <div className="flex-1 overflow-y-auto p-4 relative">
            {showExample ? (
              <div className="h-full w-full p-4 rounded-xl border border-hairline bg-surface-raised text-secondary font-mono text-xs whitespace-pre-wrap leading-relaxed select-text overflow-y-auto">
                {exampleText}
              </div>
            ) : (
              <textarea
                value={draft[activeSection]}
                onChange={handleTextChange}
                placeholder="Start writing here (Markdown supported)..."
                className="w-full h-full resize-none outline-none bg-transparent text-primary text-sm leading-relaxed placeholder:text-tertiary"
              />
            )}
          </div>
          
          {/* Footer status */}
          <div className="px-4 py-2 border-t border-hairline bg-surface-raised flex items-center justify-between shrink-0 text-[10px] text-tertiary">
            <span className="flex items-center gap-1"><RefreshCw size={10} /> Auto-saved to local storage</span>
            <span>{draft[activeSection].length} characters</span>
          </div>

        </div>
      </div>
    </div>
  );
}
