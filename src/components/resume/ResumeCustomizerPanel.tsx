'use client';

import React, { useState } from 'react';
import {
  Palette,
  FileCode2,
  FileText,
  Printer,
  Check,
  Copy,
  QrCode,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ResumeData, ResumeTheme } from '@/lib/resume/types';
import { RESUME_THEMES } from '@/lib/resume/templates';
import { convertToJsonResume, resumeToMarkdown } from '@/lib/resume/synthesizer';
import { ImpactBulletEditor } from './ImpactBulletEditor';

interface ResumeCustomizerPanelProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export function ResumeCustomizerPanel({ data, onChange }: ResumeCustomizerPanelProps) {
  const [activeTab, setActiveTab] = useState<'theme' | 'sections' | 'export'>('theme');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('projects');

  const handleCopyMarkdown = () => {
    const md = resumeToMarkdown(data);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadJsonResume = () => {
    const jsonResume = convertToJsonResume(data);
    const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.basics.username}-resume.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden customizer-panel">
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/75">
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'theme'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Style</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'sections'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sections & Bullets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Export Options</span>
        </button>
      </div>

      <div className="p-4 sm:p-5">
        {/* Tab 1: Theme & Style */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                ATS Layout Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(RESUME_THEMES) as ResumeTheme[]).map((themeKey) => {
                  const theme = RESUME_THEMES[themeKey];
                  const isSelected = data.theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => onChange({ ...data, theme: themeKey })}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{theme.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{theme.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Badges & Verifiable Stamp Toggles */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Tamper-Proof Verification Elements
              </label>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-slate-700" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Include Verification QR Code
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Recruiters can scan to view live authenticated Contribo passport.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={data.showQrCode}
                  onChange={(e) => onChange({ ...data, showQrCode: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      Display Contribo Readiness Tier Badge
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Shows readiness tier ({data.basics.readinessTier}) and score ({data.basics.readinessScore}%).
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={data.showReadinessBadge}
                  onChange={(e) => onChange({ ...data, showReadinessBadge: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Sections & Bullets */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            {/* Header / Bio Section */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('basics')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  1. Contact Information & Bio
                </span>
                {expandedSection === 'basics' ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {expandedSection === 'basics' && (
                <div className="p-4 space-y-3 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={data.basics.name}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            basics: { ...data.basics, name: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2 border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Professional Title / Headline
                      </label>
                      <input
                        type="text"
                        value={data.basics.label}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            basics: { ...data.basics, label: e.target.value },
                          })
                        }
                        className="w-full text-xs p-2 border border-slate-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Professional Summary
                    </label>
                    <textarea
                      rows={3}
                      value={data.basics.summary}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          basics: { ...data.basics, summary: e.target.value },
                        })
                      }
                      className="w-full text-xs p-2 border border-slate-300 rounded leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Featured Projects & XYZ Bullets */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('projects')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    2. Open-Source Contributions & Impact
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                    {data.featuredProjects.length} Projects
                  </span>
                </div>
                {expandedSection === 'projects' ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {expandedSection === 'projects' && (
                <div className="p-4 space-y-5 bg-white">
                  {data.featuredProjects.map((project, pIdx) => (
                    <div key={project.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Project / Initiative
                          </label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => {
                              const updated = [...data.featuredProjects];
                              updated[pIdx] = { ...project, title: e.target.value };
                              onChange({ ...data, featuredProjects: updated });
                            }}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                            Role / Title
                          </label>
                          <input
                            type="text"
                            value={project.role}
                            onChange={(e) => {
                              const updated = [...data.featuredProjects];
                              updated[pIdx] = { ...project, role: e.target.value };
                              onChange({ ...data, featuredProjects: updated });
                            }}
                            className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                          />
                        </div>
                      </div>

                      <ImpactBulletEditor
                        bullets={project.bullets}
                        onChange={(newBullets) => {
                          const updated = [...data.featuredProjects];
                          updated[pIdx] = { ...project, bullets: newBullets };
                          onChange({ ...data, featuredProjects: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Skills Matrix */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('skills')}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  3. Technical Skills Matrix
                </span>
                {expandedSection === 'skills' ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {expandedSection === 'skills' && (
                <div className="p-4 space-y-3 bg-white">
                  {data.skills.map((cat, cIdx) => (
                    <div key={cat.category} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">
                        {cat.category}
                      </label>
                      <input
                        type="text"
                        value={cat.skills.join(', ')}
                        onChange={(e) => {
                          const updated = [...data.skills];
                          updated[cIdx] = {
                            ...cat,
                            skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          };
                          onChange({ ...data, skills: updated });
                        }}
                        className="w-full text-xs p-2 border border-slate-300 rounded"
                        placeholder="Comma-separated skills"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Export Options */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Export your verifiable resume in modern industry formats. Print directly to PDF without browser margins or download schema.org JSON-Resume.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-center group"
              >
                <Printer className="w-6 h-6 text-slate-700 group-hover:text-blue-600 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-900 block">Print / Save PDF</span>
                <span className="text-[10px] text-slate-500 mt-1">Clean CSS `@media print`</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJsonResume}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-center group"
              >
                {copiedJson ? (
                  <Check className="w-6 h-6 text-emerald-600 mb-2" />
                ) : (
                  <FileCode2 className="w-6 h-6 text-slate-700 group-hover:text-emerald-600 mb-2 transition-colors" />
                )}
                <span className="text-xs font-bold text-slate-900 block">Download JSON-Resume</span>
                <span className="text-[10px] text-slate-500 mt-1">Standard Schema.org format</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition-all text-center group"
              >
                {copiedMd ? (
                  <Check className="w-6 h-6 text-purple-600 mb-2" />
                ) : (
                  <Copy className="w-6 h-6 text-slate-700 group-hover:text-purple-600 mb-2 transition-colors" />
                )}
                <span className="text-xs font-bold text-slate-900 block">
                  {copiedMd ? 'Copied to Clipboard!' : 'Copy Markdown'}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Paste into GitHub README</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
