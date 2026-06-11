import { describe, it, expect } from 'vitest';
import { transformMdxForPreview, PREVIEW_CSS } from './preview-render';

describe('transformMdxForPreview', () => {
  it('renders a Callout as a styled aside with rendered inner markdown', () => {
    const src = '<Callout type="hipaa">\n  Do **not** paste PHI.\n</Callout>';
    const out = transformMdxForPreview(src);
    expect(out).toContain('class="callout callout-hipaa"');
    expect(out).toContain('HIPAA Notice');
    expect(out).toContain('<strong>not</strong>');
    expect(out).not.toContain('<Callout');
  });

  it('respects a custom Callout title', () => {
    const out = transformMdxForPreview('<Callout type="tip" title="Pro tip">x</Callout>');
    expect(out).toContain('Pro tip');
  });

  it('renders PromptPlayground as a styled prompt box', () => {
    const out = transformMdxForPreview('<PromptPlayground>\nSummarize this chart.\n</PromptPlayground>');
    expect(out).toContain('class="prompt-box"');
    expect(out).toContain('Summarize this chart.');
  });

  it('strips import statements and renders ordinary markdown', () => {
    const out = transformMdxForPreview("import Callout from '../../components/Callout.astro';\n\n## Heading\n");
    expect(out).not.toContain('import Callout');
    expect(out).toContain('<h2');
  });
});

describe('PREVIEW_CSS', () => {
  it('carries the site font and callout palettes', () => {
    expect(PREVIEW_CSS).toContain('Quadraat');
    expect(PREVIEW_CSS).toContain('.callout-hipaa');
    expect(PREVIEW_CSS).toContain('#fef2f2');
  });
});
