'use client';

import React, { useState } from 'react';
import { GitConflictData } from '@/lib/git-sandbox/types';
import { AlertTriangle, FileCode, Check } from 'lucide-react';

interface ConflictEditorProps {
  conflicts: Record<string, GitConflictData>;
  onResolve: (file: string, resolvedContent: string) => void;
  onDismiss?: () => void;
}

export function ConflictEditor({
  conflicts,
  onResolve,
  onDismiss,
}: ConflictEditorProps) {
  const fileList = Object.keys(conflicts);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const activeFile = conflicts[selectedFile] ? selectedFile : fileList[0] || '';
  const currentConflict = conflicts[activeFile];
  const [editedContentByFile, setEditedContentByFile] = useState<Record<string, string>>({});

  const editorText = editedContentByFile[activeFile] ?? (currentConflict?.rawWithMarkers || '');

  if (fileList.length === 0 || !currentConflict) {
    return null;
  }

  const handleAcceptCurrent = () => {
    setEditedContentByFile((prev) => ({ ...prev, [activeFile]: currentConflict.current }));
  };

  const handleAcceptIncoming = () => {
    setEditedContentByFile((prev) => ({ ...prev, [activeFile]: currentConflict.incoming }));
  };

  const handleAcceptBoth = () => {
    const combined = `${currentConflict.current}\n${currentConflict.incoming}`;
    setEditedContentByFile((prev) => ({ ...prev, [activeFile]: combined }));
  };

  const handleMarkResolved = () => {
    onResolve(activeFile, editorText);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-amber-500/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-950/40 border-b border-amber-500/30">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            Merge Conflict Resolution Required ({fileList.length} unresolved file{fileList.length > 1 ? 's' : ''})
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Hide Editor
          </button>
        )}
      </div>

      {/* File selector tabs if multiple conflict files */}
      {fileList.length > 1 && (
        <div className="flex gap-1 px-3 pt-2 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          {fileList.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFile(f)}
              className={`px-3 py-1.5 text-xs font-mono rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeFile === f
                  ? 'bg-slate-900 text-sky-400 border-t border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Conflict Quick-Resolution Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Quick Actions:</span>
          <button
            type="button"
            onClick={handleAcceptCurrent}
            className="px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 transition-colors"
          >
            Accept Current (HEAD)
          </button>
          <button
            type="button"
            onClick={handleAcceptIncoming}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-colors"
          >
            Accept Incoming
          </button>
          <button
            type="button"
            onClick={handleAcceptBoth}
            className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 transition-colors"
          >
            Accept Both
          </button>
        </div>

        <button
          type="button"
          onClick={handleMarkResolved}
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Check className="w-4 h-4" />
          Mark as Resolved (Stage)
        </button>
      </div>

      {/* Inline Diff & Textarea Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800">
        {/* Left pane: Reference Comparison */}
        <div className="p-3 bg-slate-950 text-xs font-mono space-y-3 overflow-y-auto max-h-[220px]">
          <div>
            <div className="text-[11px] font-bold text-blue-400 mb-1 flex items-center gap-1">
              <span>● Current Change (HEAD)</span>
            </div>
            <pre className="p-2 rounded bg-blue-950/30 border border-blue-900/50 text-blue-200 whitespace-pre-wrap">
              {currentConflict.current || '(empty)'}
            </pre>
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
              <span>● Incoming Change</span>
            </div>
            <pre className="p-2 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-200 whitespace-pre-wrap">
              {currentConflict.incoming || '(empty)'}
            </pre>
          </div>
        </div>

        {/* Right pane: Active Resolution Textarea */}
        <div className="flex flex-col bg-slate-950 p-3">
          <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Resulting File Content ({activeFile}):</span>
            <span className="text-[10px] text-slate-500">Edit manually or use quick actions</span>
          </div>
          <textarea
            value={editorText}
            onChange={(e) => {
              const val = e.target.value;
              setEditedContentByFile((prev) => ({ ...prev, [activeFile]: val }));
            }}
            className="flex-1 w-full h-[180px] p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500/80 resize-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
