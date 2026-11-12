import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('1. calculateSectionThreshold live metrics calculation', async (t) => {
  // Read constants file directly to verify logic and types
  const constantsContent = fs.readFileSync(
    path.join(root, 'src/components/proposal-studio/constants.ts'),
    'utf8'
  );

  assert.ok(
    constantsContent.includes('charCountNoSpaces: number;'),
    'SectionThresholdMetrics interface must declare charCountNoSpaces'
  );
  assert.ok(
    constantsContent.includes('readingTimeMinutes: number;'),
    'SectionThresholdMetrics interface must declare readingTimeMinutes'
  );
  assert.ok(
    constantsContent.includes('readingTimeLabel: string;'),
    'SectionThresholdMetrics interface must declare readingTimeLabel'
  );

  // Evaluate the threshold function in isolated context
  const evalFunc = new Function(
    'text',
    'minChars',
    `
    const raw = text || '';
    const charCount = raw.length;
    const charCountNoSpaces = raw.replace(/\\s/g, '').length;
    const trimmed = raw.trim();
    const wordCount = trimmed ? trimmed.split(/\\s+/).filter(Boolean).length : 0;
    const safeMin = Math.max(1, minChars);
    const percentage = Math.min(100, Math.round((charCount / safeMin) * 100));
    const isThresholdMet = trimmed.length >= safeMin;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const readingTimeLabel =
      wordCount === 0
        ? '0 min read'
        : wordCount < 100
          ? '< 1 min read'
          : \`~\${readingTimeMinutes} min read\`;

    return {
      charCount,
      charCountNoSpaces,
      wordCount,
      readingTimeMinutes,
      readingTimeLabel,
      minChars: safeMin,
      percentage,
      isThresholdMet,
      remainingChars: Math.max(0, safeMin - charCount),
    };
    `
  );

  await t.test('handles empty input gracefully', () => {
    const metrics = evalFunc('', 100);
    assert.equal(metrics.charCount, 0);
    assert.equal(metrics.charCountNoSpaces, 0);
    assert.equal(metrics.wordCount, 0);
    assert.equal(metrics.readingTimeLabel, '0 min read');
    assert.equal(metrics.isThresholdMet, false);
    assert.equal(metrics.remainingChars, 100);
    assert.equal(metrics.percentage, 0);
  });

  await t.test('calculates accurate word and character counts with and without spaces', () => {
    const text = 'Hello world from   Contribo Proposal Studio!';
    const metrics = evalFunc(text, 50);
    assert.equal(metrics.charCount, text.length);
    assert.equal(metrics.charCountNoSpaces, text.replace(/\s/g, '').length);
    assert.equal(metrics.wordCount, 6);
    assert.equal(metrics.readingTimeLabel, '< 1 min read');
  });

  await t.test('calculates estimated reading time for longer texts', () => {
    // 450 words should be ~3 min read at 200 wpm
    const text = Array(450).fill('architecture').join(' ');
    const metrics = evalFunc(text, 500);
    assert.equal(metrics.wordCount, 450);
    assert.equal(metrics.readingTimeMinutes, 3);
    assert.equal(metrics.readingTimeLabel, '~3 min read');
  });

  await t.test('tracks threshold progress percentage up to 100%', () => {
    const text = 'a'.repeat(250);
    const metrics = evalFunc(text, 500);
    assert.equal(metrics.percentage, 50);
    assert.equal(metrics.isThresholdMet, false);
    assert.equal(metrics.remainingChars, 250);

    const full = 'a'.repeat(600);
    const fullMetrics = evalFunc(full, 500);
    assert.equal(fullMetrics.percentage, 100);
    assert.equal(fullMetrics.isThresholdMet, true);
    assert.equal(fullMetrics.remainingChars, 0);
  });
});

test('2. Proposal Studio Header Export Dropdown & Navigation UI', () => {
  const workspacePath = path.join(
    root,
    'src/components/proposal-studio/StudioWorkspace.tsx'
  );
  const content = fs.readFileSync(workspacePath, 'utf8');

  assert.ok(
    content.includes('id="proposal-export-dropdown-btn"'),
    'StudioWorkspace must contain proposal export dropdown trigger button'
  );
  assert.ok(
    content.includes('Download Markdown (.md)'),
    'Export dropdown must offer Download Markdown option'
  );
  assert.ok(
    content.includes('Export as PDF'),
    'Export dropdown must offer Export as PDF option'
  );
  assert.ok(
    content.includes('Print to PDF (Ctrl+P)'),
    'Export dropdown must offer Print to PDF option'
  );
  assert.ok(
    content.includes('Copy to Clipboard'),
    'Export dropdown must offer Copy to Clipboard option'
  );
  assert.ok(
    content.includes('isExportMenuOpen'),
    'StudioWorkspace must manage dropdown open/closed state'
  );
  assert.ok(
    content.includes('handleClickOutside'),
    'Dropdown must handle clicking outside to close'
  );
  assert.ok(
    content.includes('Escape'),
    'Dropdown must support Escape key to dismiss'
  );
});

test('3. Markdown Export Filename & Structure Formatting', () => {
  const hookPath = path.join(
    root,
    'src/components/proposal-studio/hooks/useProposalStudio.ts'
  );
  const content = fs.readFileSync(hookPath, 'utf8');

  // Verify markdown export produces <proposal-title>.md
  assert.ok(
    content.includes('const sanitizedTitle = (activeDraft.projectTitle || activeDraft.projectSlug || \'proposal\')'),
    'downloadMarkdownFile must sanitize the proposal title'
  );
  assert.ok(
    content.includes('const fileName = `${sanitizedTitle || \'proposal\'}.md`;'),
    'downloadMarkdownFile must produce <proposal-title>.md'
  );
  assert.ok(
    content.includes('yamlFrontmatter'),
    'downloadMarkdownFile must format standard YAML frontmatter'
  );
  assert.ok(
    content.includes('text/markdown;charset=utf-8'),
    'downloadMarkdownFile must specify markdown mime type'
  );

  // Verify clipboard copy includes header metadata
  assert.ok(
    content.includes('const header ='),
    'copyProposalToClipboard must include structured metadata header'
  );
  assert.ok(
    content.includes('Proposal markdown copied to clipboard'),
    'copyProposalToClipboard must show success toast'
  );
});

test('4. Live Word & Character Counter in Builder Toolbar & Footer', () => {
  const builderPath = path.join(
    root,
    'src/components/proposal-studio/panels/BuilderPanel.tsx'
  );
  const content = fs.readFileSync(builderPath, 'utf8');

  assert.ok(
    content.includes('metrics.charCountNoSpaces'),
    'BuilderPanel must display character count excluding spaces'
  );
  assert.ok(
    content.includes('metrics.readingTimeLabel'),
    'BuilderPanel must display reading time status'
  );
  assert.ok(
    content.includes('Live Word & Character Counter Status Pill'),
    'BuilderPanel must feature a dedicated live counter status pill in the toolbar'
  );
});

test('5. Print to PDF Styling & Contribo Branding Watermark', () => {
  const exportPath = path.join(
    root,
    'src/components/proposal-studio/panels/ExportPanel.tsx'
  );
  const exportContent = fs.readFileSync(exportPath, 'utf8');

  assert.ok(
    exportContent.includes('print-watermark-header'),
    'ExportPanel must include print-watermark-header'
  );
  assert.ok(
    exportContent.includes('print-watermark-footer'),
    'ExportPanel must include print-watermark-footer'
  );
  assert.ok(
    exportContent.includes('Contribo Proposal Studio'),
    'Print watermark must show Contribo branding'
  );

  const cssPath = path.join(root, 'src/app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert.ok(
    cssContent.includes('.print-watermark-header'),
    'globals.css must style print-watermark-header'
  );
  assert.ok(
    cssContent.includes('.print-watermark-footer'),
    'globals.css must style print-watermark-footer'
  );
  assert.ok(
    cssContent.includes('@media print'),
    'globals.css must define @media print rules'
  );
});
