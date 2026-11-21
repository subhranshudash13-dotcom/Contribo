'use client';

import React, { useState } from 'react';
import { BookMarked, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface CommandCheatSheetProps {
  onCopyCommand?: (cmd: string) => void;
}

export function CommandCheatSheet({ onCopyCommand }: CommandCheatSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = [
    {
      title: 'Branching & Switching',
      commands: [
        { cmd: 'git checkout -b <branch>', desc: 'Create and switch to a new branch' },
        { cmd: 'git switch <branch>', desc: 'Switch to an existing local branch' },
        { cmd: 'git branch -a', desc: 'List all local and remote branches' },
        { cmd: 'git branch -d <branch>', desc: 'Safely delete a merged local branch' },
      ],
    },
    {
      title: 'Staging & Commits',
      commands: [
        { cmd: 'git status', desc: 'Show modified files and active staging state' },
        { cmd: 'git add .', desc: 'Stage all modified files in working directory' },
        { cmd: 'git commit -m "<msg>"', desc: 'Commit staged changes with a message' },
        { cmd: 'git log --oneline', desc: 'View commit history in single-line format' },
      ],
    },
    {
      title: 'Syncing, Merging & Rebasing',
      commands: [
        { cmd: 'git fetch upstream', desc: 'Download remote commits without merging' },
        { cmd: 'git merge <branch>', desc: 'Join branch history into current HEAD' },
        { cmd: 'git rebase <branch>', desc: 'Replay current branch commits onto target' },
        { cmd: 'git rebase --continue', desc: 'Continue rebase after conflict resolution' },
        { cmd: 'git rebase --abort', desc: 'Cancel active rebase and restore original branch' },
      ],
    },
    {
      title: 'Resetting & History Cleanup',
      commands: [
        { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit, keeping files staged' },
        { cmd: 'git reset --hard HEAD~1', desc: 'Discard last commit and all working changes' },
        { cmd: 'git cherry-pick <sha>', desc: 'Apply changes from a specific commit' },
      ],
    },
  ];

  const handleCopy = (cmd: string) => {
    onCopyCommand?.(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-sky-400" />
          <span>Git Command Quick Reference & Cheat Sheet</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400">
                {cat.title}
              </h3>
              <div className="space-y-1.5">
                {cat.commands.map((c, cIdx) => (
                  <div
                    key={cIdx}
                    onClick={() => handleCopy(c.cmd)}
                    className="p-2 rounded bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-emerald-400 font-semibold">$ {c.cmd}</div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">{c.desc}</div>
                    </div>
                    <div className="text-slate-500 group-hover:text-slate-300 ml-2 shrink-0">
                      {copiedCmd === c.cmd ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
