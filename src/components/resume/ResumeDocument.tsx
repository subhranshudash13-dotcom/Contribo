'use client';

import React from 'react';
import { ResumeData } from '@/lib/resume/types';
import { RESUME_THEMES, PRINT_STYLES } from '@/lib/resume/templates';
import { ResumeQrBadge } from './ResumeQrBadge';
import { ExternalLink, Github } from 'lucide-react';

interface ResumeDocumentProps {
  data: ResumeData;
}

export function ResumeDocument({ data }: ResumeDocumentProps) {
  const theme = RESUME_THEMES[data.theme] || RESUME_THEMES.minimalist;

  return (
    <div className="relative">
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div className={`resume-container ${theme.containerClass} ${theme.fontFamily} transition-all`}>
        {/* Header Section */}
        <header className={`${theme.headerClass} flex flex-col sm:flex-row items-start justify-between gap-4`}>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              {data.basics.name}
            </h1>
            <p className="text-sm font-semibold text-blue-700 mb-2">{data.basics.label}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <a
                href={`https://github.com/${data.basics.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-slate-900"
              >
                <Github className="w-3.5 h-3.5" />
                <span>github.com/{data.basics.githubUsername}</span>
              </a>

              <a
                href={data.basics.passportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-slate-900 text-blue-600"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verified Passport ({data.basics.readinessTier})</span>
              </a>
            </div>
          </div>

          {/* Optional Verifiable QR Badge */}
          {data.showQrCode && (
            <div className="flex-shrink-0">
              <ResumeQrBadge
                username={data.basics.username}
                passportUrl={data.basics.passportUrl}
                readinessTier={data.basics.readinessTier}
                readinessScore={data.basics.readinessScore}
                showTierBadge={data.showReadinessBadge}
              />
            </div>
          )}
        </header>

        {/* Summary / Bio */}
        {data.basics.summary && (
          <section className="mb-6 page-break-avoid">
            <h2 className={theme.sectionTitleClass}>Executive Summary</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {data.basics.summary}
            </p>
          </section>
        )}

        {/* Layout variance: Modern theme uses dual column below header, others use single column */}
        {data.theme === 'modern' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Column: Projects & Experience */}
            <div className="md:col-span-2 space-y-6">
              {/* Featured Projects & Open Source Contributions */}
              <section className="page-break-avoid">
                <h2 className={theme.sectionTitleClass}>Open-Source Contributions & Projects</h2>
                <div className="space-y-4">
                  {data.featuredProjects.map((project) => (
                    <div key={project.id} className="page-break-avoid">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900">
                          {project.title}{' '}
                          <span className="font-normal text-slate-500">— {project.role}</span>
                        </h3>
                        {project.startDate && (
                          <span className="text-[11px] text-slate-500 flex-shrink-0">
                            {project.startDate} {project.isOngoing ? '– Present' : `– ${project.endDate}`}
                          </span>
                        )}
                      </div>

                      <ul className="list-disc list-outside ml-4 space-y-1.5 mt-1.5">
                        {project.bullets.map((bullet) => (
                          <li key={bullet.id} className={theme.bulletClass}>
                            {bullet.fullText}
                          </li>
                        ))}
                      </ul>

                      {project.technologies.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          Stack: {project.technologies.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Experience */}
              {data.workExperience.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className={theme.sectionTitleClass}>Experience</h2>
                  <div className="space-y-4">
                    {data.workExperience.map((work) => (
                      <div key={work.id} className="page-break-avoid">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-900">
                            {work.position}{' '}
                            <span className="font-normal text-slate-500">| {work.company}</span>
                          </h3>
                          <span className="text-[11px] text-slate-500 flex-shrink-0">
                            {work.startDate} {work.isCurrent ? '– Present' : `– ${work.endDate}`}
                          </span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-1 mt-1">
                          {work.bullets.map((bullet, idx) => (
                            <li key={idx} className={theme.bulletClass}>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Column: Skills & Credentials */}
            <div className="space-y-6">
              {/* Technical Skills */}
              <section className="page-break-avoid">
                <h2 className={theme.sectionTitleClass}>Technical Skills</h2>
                <div className="space-y-3">
                  {data.skills.map((sc) => (
                    <div key={sc.category}>
                      <h4 className="text-xs font-semibold text-slate-800 mb-1">{sc.category}</h4>
                      <p className="text-xs text-slate-600 leading-snug">{sc.skills.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Verified Credentials */}
              {data.awards.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className={theme.sectionTitleClass}>Verified Awards & Readiness</h2>
                  <div className="space-y-3">
                    {data.awards.map((award, aIdx) => (
                      <div key={aIdx} className="text-xs">
                        <h4 className="font-semibold text-slate-900">{award.title}</h4>
                        <p className="text-[11px] text-slate-500 mb-0.5">
                          {award.awarder} • {award.date}
                        </p>
                        <p className="text-slate-600 leading-snug">{award.summary}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        ) : (
          /* Single Column Layout (Minimalist & Academic) */
          <div className="space-y-6">
            {/* Technical Skills Matrix */}
            <section className="page-break-avoid">
              <h2 className={theme.sectionTitleClass}>Technical Skills</h2>
              <div className="space-y-1.5 text-xs sm:text-sm">
                {data.skills.map((sc) => (
                  <div key={sc.category} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                    <span className="font-bold text-slate-800 sm:w-44 flex-shrink-0">
                      {sc.category}:
                    </span>
                    <span className="text-slate-700">{sc.skills.join(', ')}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Projects & Open Source Contributions */}
            <section className="page-break-avoid">
              <h2 className={theme.sectionTitleClass}>Open-Source Contributions & Projects</h2>
              <div className="space-y-4">
                {data.featuredProjects.map((project) => (
                  <div key={project.id} className="page-break-avoid">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {project.title}{' '}
                        <span className="font-normal text-slate-600">— {project.role}</span>
                      </h3>
                      {project.startDate && (
                        <span className="text-[11px] text-slate-500 flex-shrink-0">
                          {project.startDate} {project.isOngoing ? '– Present' : `– ${project.endDate}`}
                        </span>
                      )}
                    </div>

                    <ul className="list-disc list-outside ml-4 space-y-1 mt-1.5">
                      {project.bullets.map((bullet) => (
                        <li key={bullet.id} className={theme.bulletClass}>
                          {bullet.fullText}
                        </li>
                      ))}
                    </ul>

                    {project.technologies.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        Technologies: {project.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            {data.workExperience.length > 0 && (
              <section className="page-break-avoid">
                <h2 className={theme.sectionTitleClass}>Experience & Fellowships</h2>
                <div className="space-y-4">
                  {data.workExperience.map((work) => (
                    <div key={work.id} className="page-break-avoid">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                          {work.position}{' '}
                          <span className="font-normal text-slate-600">| {work.company}</span>
                        </h3>
                        <span className="text-[11px] text-slate-500 flex-shrink-0">
                          {work.startDate} {work.isCurrent ? '– Present' : `– ${work.endDate}`}
                        </span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-1 mt-1">
                        {work.bullets.map((bullet, idx) => (
                          <li key={idx} className={theme.bulletClass}>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Verified Awards */}
            {data.awards.length > 0 && (
              <section className="page-break-avoid">
                <h2 className={theme.sectionTitleClass}>Verified Credentials & Honors</h2>
                <div className="space-y-2">
                  {data.awards.map((award, aIdx) => (
                    <div key={aIdx} className="text-xs">
                      <span className="font-bold text-slate-900">{award.title}</span> —{' '}
                      <span className="text-slate-600 italic">
                        {award.awarder} ({award.date})
                      </span>
                      : <span className="text-slate-700">{award.summary}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Footer verification note */}
        <footer className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 page-break-avoid">
          Generated via Contribo Career Graph • Tamper-proof verification at{' '}
          <a
            href={data.basics.passportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {data.basics.passportUrl}
          </a>
        </footer>
      </div>
    </div>
  );
}
