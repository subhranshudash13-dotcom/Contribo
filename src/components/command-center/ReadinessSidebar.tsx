import React, { useState } from 'react';
import { ProposalDraft } from './CommandCenterClient';
import { Target, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface ReadinessSidebarProps {
  draft: ProposalDraft;
}

export function ReadinessSidebar({ draft }: ReadinessSidebarProps) {
  
  // Basic heuristic checks for the MVP
  const hasTimelineWeeks = draft.timeline.toLowerCase().includes('week');
  const hasFileReferences = draft.techSpec.includes('.js') || draft.techSpec.includes('.ts') || draft.techSpec.includes('.py') || draft.techSpec.includes('src/');
  
  // Manual checks
  const [manualChecks, setManualChecks] = useState({
    localSetup: false,
    contactedMentor: false,
    openedPR: false,
    sharedDraft: false,
  });

  const toggleCheck = (key: keyof typeof manualChecks) => {
    setManualChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistItems = [
    { 
      id: 'techSpecFiles', 
      label: 'Technical plan references specific files/APIs', 
      isAuto: true, 
      checked: hasFileReferences 
    },
    { 
      id: 'timelineWeeks', 
      label: 'Timeline is broken into weekly deliverables', 
      isAuto: true, 
      checked: hasTimelineWeeks 
    },
    { 
      id: 'localSetup', 
      label: 'Local environment setup & verified', 
      isAuto: false, 
      checked: manualChecks.localSetup,
      toggle: () => toggleCheck('localSetup')
    },
    { 
      id: 'openedPR', 
      label: 'At least one PR opened or merged', 
      isAuto: false, 
      checked: manualChecks.openedPR,
      toggle: () => toggleCheck('openedPR')
    },
    { 
      id: 'contactedMentor', 
      label: 'Contacted mentor with specific questions', 
      isAuto: false, 
      checked: manualChecks.contactedMentor,
      toggle: () => toggleCheck('contactedMentor')
    },
    { 
      id: 'sharedDraft', 
      label: 'Shared draft proposal for early feedback', 
      isAuto: false, 
      checked: manualChecks.sharedDraft,
      toggle: () => toggleCheck('sharedDraft')
    }
  ];

  const completedCount = checklistItems.filter(i => i.checked).length;
  const totalCount = checklistItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex flex-col h-full bg-surface border border-hairline rounded-2xl overflow-hidden shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-6 text-primary">
        <Target size={18} className="text-accent" />
        <h3 className="font-heading font-semibold">Readiness Score</h3>
      </div>

      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-primary">{progressPercent}%</span>
          <span className="text-xs text-secondary mb-1">Mentor Ready</span>
        </div>
        <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {checklistItems.map(item => (
          <div key={item.id} className="flex items-start gap-3">
            <button 
              onClick={item.isAuto ? undefined : item.toggle}
              disabled={item.isAuto}
              className={`mt-0.5 shrink-0 transition-colors ${item.checked ? 'text-success' : 'text-tertiary hover:text-secondary'} ${item.isAuto ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {item.checked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </button>
            <div className="flex flex-col">
              <span className={`text-xs leading-relaxed ${item.checked ? 'text-secondary line-through' : 'text-primary'}`}>
                {item.label}
              </span>
              {item.isAuto && (
                <span className="text-[9px] text-accent uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  <AlertCircle size={8} /> Auto-detected
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-hairline">
        <p className="text-[10px] text-tertiary leading-relaxed">
          Mentors evaluate your **proof of work** just as much as your written proposal. Completing these items dramatically increases your acceptance odds.
        </p>
      </div>
    </div>
  );
}
