import { ResumeTheme } from './types';

export interface ThemeConfig {
  id: ResumeTheme;
  name: string;
  description: string;
  fontFamily: string;
  accentColor: string;
  containerClass: string;
  headerClass: string;
  sectionTitleClass: string;
  bulletClass: string;
}

export const RESUME_THEMES: Record<ResumeTheme, ThemeConfig> = {
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist Single-Column',
    description: 'Ultra-clean, single-column ATS-optimized format prioritized by automated scanners.',
    fontFamily: 'font-sans',
    accentColor: '#0f172a',
    containerClass: 'max-w-[800px] mx-auto bg-white text-slate-800 p-8 sm:p-12 shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0',
    headerClass: 'border-b border-slate-300 pb-4 mb-6',
    sectionTitleClass: 'text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 mt-6',
    bulletClass: 'text-slate-700 leading-relaxed text-sm',
  },
  modern: {
    id: 'modern',
    name: 'Modern Dual-Column',
    description: 'Polished layout featuring a sidebar for skills and credentials alongside an impact-focused timeline.',
    fontFamily: 'font-sans',
    accentColor: '#2563eb',
    containerClass: 'max-w-[800px] mx-auto bg-white text-slate-800 p-8 sm:p-12 shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0',
    headerClass: 'border-b-2 border-blue-600 pb-4 mb-6',
    sectionTitleClass: 'text-sm font-bold uppercase tracking-wider text-blue-600 border-b border-blue-100 pb-1 mb-3 mt-5',
    bulletClass: 'text-slate-700 leading-relaxed text-sm',
  },
  academic: {
    id: 'academic',
    name: 'Academic / Research',
    description: 'Serif-based scholarly layout suited for research fellowships, open-source publications, and academic applications.',
    fontFamily: 'font-serif',
    accentColor: '#1e293b',
    containerClass: 'max-w-[800px] mx-auto bg-white text-slate-900 p-8 sm:p-12 shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0',
    headerClass: 'text-center border-b border-slate-400 pb-4 mb-6',
    sectionTitleClass: 'text-sm font-semibold tracking-wide text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3 mt-6',
    bulletClass: 'text-slate-800 leading-relaxed text-sm',
  },
};

/**
 * Print stylesheet injection styles for PDF downloads
 */
export const PRINT_STYLES = `
@media print {
  @page {
    margin: 12mm;
    size: A4 portrait;
  }
  body {
    background: #ffffff !important;
    color: #000000 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .no-print, header, nav, footer, .customizer-panel {
    display: none !important;
  }
  .resume-container {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .page-break-avoid {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
`;
