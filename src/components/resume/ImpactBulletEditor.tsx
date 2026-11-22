'use client';

import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Check, MoveUp, MoveDown } from 'lucide-react';
import { ResumeImpactBullet } from '@/lib/resume/types';
import { generateXyzBullet, polishXyzBullet } from '@/lib/resume/synthesizer';

interface ImpactBulletEditorProps {
  bullets: ResumeImpactBullet[];
  onChange: (bullets: ResumeImpactBullet[]) => void;
}

export function ImpactBulletEditor({ bullets, onChange }: ImpactBulletEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRaw, setDraftRaw] = useState('');
  const [draftCategory, setDraftCategory] = useState<ResumeImpactBullet['category']>('Full-Stack');

  const handleAddRaw = () => {
    if (!draftRaw.trim()) return;
    const polished = polishXyzBullet(draftRaw);
    polished.category = draftCategory;
    onChange([...bullets, polished]);
    setDraftRaw('');
  };

  const handleAddTemplate = () => {
    const newBullet = generateXyzBullet(
      'Engineered core feature workflow',
      'improving throughput by 25% with zero regressions',
      'leveraging asynchronous task pipelines and strictly-typed interfaces',
      'Full-Stack'
    );
    onChange([...bullets, newBullet]);
    setEditingId(newBullet.id);
  };

  const handleUpdate = (id: string, updates: Partial<ResumeImpactBullet>) => {
    const updated = bullets.map((b) => {
      if (b.id !== id) return b;
      const merged = { ...b, ...updates };
      // Keep fullText in sync if components updated
      if (updates.action || updates.metric || updates.method) {
        merged.fullText = `${merged.action}, resulting in ${merged.metric}, by ${merged.method}.`;
      }
      return merged;
    });
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    onChange(bullets.filter((b) => b.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= bullets.length) return;
    const copy = [...bullets];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Quantified Impact Bullets (Google XYZ Standard)
        </h4>
        <button
          type="button"
          onClick={handleAddTemplate}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-750 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add XYZ Bullet</span>
        </button>
      </div>

      {/* List of Bullets */}
      <div className="space-y-3">
        {bullets.map((bullet, idx) => {
          const isEditing = editingId === bullet.id;

          return (
            <div
              key={bullet.id}
              className={`p-3 rounded-lg border text-sm transition-all ${
                isEditing
                  ? 'border-blue-300 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {isEditing ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Accomplished [X]
                      </label>
                      <input
                        type="text"
                        value={bullet.action}
                        onChange={(e) => handleUpdate(bullet.id, { action: e.target.value })}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. Authored circuit breaker"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        As Measured By [Y]
                      </label>
                      <input
                        type="text"
                        value={bullet.metric}
                        onChange={(e) => handleUpdate(bullet.id, { metric: e.target.value })}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. 100% test coverage"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        By Doing [Z]
                      </label>
                      <input
                        type="text"
                        value={bullet.method}
                        onChange={(e) => handleUpdate(bullet.id, { method: e.target.value })}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. automated canary probes"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={bullet.category}
                      onChange={(e) =>
                        handleUpdate(bullet.id, {
                          category: e.target.value as ResumeImpactBullet['category'],
                        })
                      }
                      className="text-xs px-2 py-1 border border-slate-300 rounded bg-white text-slate-700"
                    >
                      <option value="Full-Stack">Full-Stack</option>
                      <option value="Systems">Systems Architecture</option>
                      <option value="Testing">Testing & Reliability</option>
                      <option value="Performance">Performance Optimization</option>
                      <option value="Collaboration">Collaboration</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done Editing</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 cursor-pointer" onClick={() => setEditingId(bullet.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {bullet.category}
                      </span>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed">{bullet.fullText}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === bullets.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(bullet.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 ml-1"
                      title="Delete Bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Bullet Polisher Input */}
      <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI XYZ Synthesizer & Polisher</span>
        </div>
        <p className="text-[11px] text-slate-600 mb-2">
          Paste any raw bullet, commit message, or PR title. We’ll reframe it into Google XYZ impact format.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={draftRaw}
            onChange={(e) => setDraftRaw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRaw();
              }
            }}
            placeholder="e.g. Added redis caching to speed up api responses"
            className="flex-1 text-xs p-2 border border-slate-300 rounded bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <select
              value={draftCategory}
              onChange={(e) => setDraftCategory(e.target.value as ResumeImpactBullet['category'])}
              className="text-xs p-2 border border-slate-300 rounded bg-white text-slate-700"
            >
              <option value="Full-Stack">Full-Stack</option>
              <option value="Systems">Systems</option>
              <option value="Testing">Testing</option>
              <option value="Performance">Performance</option>
              <option value="Collaboration">Collaboration</option>
            </select>
            <button
              type="button"
              onClick={handleAddRaw}
              className="inline-flex items-center gap-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Polish & Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
