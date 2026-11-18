'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft, Trash2 } from 'lucide-react';
import { GitGraphState } from '@/lib/git-sandbox/types';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error' | 'conflict';
  content: string;
  promptBranch?: string;
}

interface VirtualTerminalProps {
  graphState: GitGraphState;
  onExecuteCommand: (cmd: string) => { success: boolean; output: string; error?: string };
  onClear?: () => void;
}

export function VirtualTerminal({
  graphState,
  onExecuteCommand,
  onClear,
}: VirtualTerminalProps) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'welcome-1',
      type: 'output',
      content:
        'Welcome to the Contribo Interactive Git DAG Simulator & Merge Conflict Sandbox!\nType "help" to list available commands or select a guided challenge on the right.\n',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentBranch =
    graphState.refs.HEAD.type === 'branch'
      ? graphState.refs.HEAD.target
      : `(${graphState.refs.HEAD.target.slice(0, 7)}...)`;

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const command = inputVal.trim();
    if (!command) return;

    if (command === 'clear') {
      setLines([]);
      setInputVal('');
      setHistory((prev) => [...prev, command]);
      setHistoryIndex(-1);
      onClear?.();
      return;
    }

    // Record command line
    const cmdLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      type: 'command',
      content: command,
      promptBranch: currentBranch,
    };

    const res = onExecuteCommand(command);

    if (res.output === '__CLEAR__') {
      setLines([]);
      setInputVal('');
      onClear?.();
      return;
    }

    const outLines: TerminalLine[] = [];
    if (res.output) {
      outLines.push({
        id: `out-${Date.now()}`,
        type: res.error === 'MERGE_CONFLICT' || res.error === 'REBASE_CONFLICT'
          ? 'conflict'
          : res.success
          ? 'output'
          : 'error',
        content: res.output,
      });
    }

    setLines((prev) => [...prev, cmdLine, ...outLines]);
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for common commands & branches
      const tokens = inputVal.split(' ');
      const lastToken = tokens[tokens.length - 1];
      if (tokens.length === 1) {
        const candidates = ['git status', 'git branch', 'git checkout', 'git commit', 'git rebase', 'git merge', 'git log'];
        const match = candidates.find((c) => c.startsWith(lastToken));
        if (match) setInputVal(match);
      } else if (tokens.length >= 2) {
        const branches = Object.keys(graphState.refs.branches);
        const matchBranch = branches.find((b) => b.startsWith(lastToken));
        if (matchBranch) {
          tokens[tokens.length - 1] = matchBranch;
          setInputVal(tokens.join(' '));
        }
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="ml-2 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            Virtual Terminal Shell (~/community-repo)
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLines([]);
            onClear?.();
          }}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
          title="Clear terminal output"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Terminal Content Buffer */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 select-text font-mono text-xs sm:text-[13px] leading-relaxed">
        {lines.map((l) => {
          if (l.type === 'command') {
            return (
              <div key={l.id} className="flex items-start gap-2 text-slate-200">
                <span className="text-emerald-400 font-bold select-none">
                  contribo@user
                </span>
                <span className="text-slate-400 select-none">:</span>
                <span className="text-sky-400 select-none">~/repo</span>
                <span className="text-amber-400 font-semibold select-none">
                  ({l.promptBranch})
                </span>
                <span className="text-slate-300 select-none">$</span>
                <span className="text-slate-100 font-semibold">{l.content}</span>
              </div>
            );
          }

          if (l.type === 'conflict') {
            return (
              <div
                key={l.id}
                className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 whitespace-pre-wrap font-mono"
              >
                {l.content}
              </div>
            );
          }

          if (l.type === 'error') {
            return (
              <div
                key={l.id}
                className="text-rose-400 whitespace-pre-wrap font-mono"
              >
                {l.content}
              </div>
            );
          }

          return (
            <div
              key={l.id}
              className="text-slate-300 whitespace-pre-wrap font-mono"
            >
              {l.content}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Input Line Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 border-t border-slate-800"
      >
        <div className="flex items-center gap-1.5 select-none shrink-0 font-mono text-xs">
          <span className="text-emerald-400 font-bold hidden sm:inline">contribo</span>
          <span className="text-amber-400 font-semibold">({currentBranch})</span>
          <span className="text-slate-400">$</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. git status, git checkout -b feature/auth, git commit -m 'feat: ...'"
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 font-mono text-xs sm:text-sm focus:outline-none"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="submit"
          className="px-2.5 py-1 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1 transition-colors shrink-0"
        >
          <CornerDownLeft className="w-3 h-3" />
          <span className="hidden sm:inline">Run</span>
        </button>
      </form>
    </div>
  );
}
