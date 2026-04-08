/**
 * OG image generation using sharp's native SVG rasterisation (librsvg).
 * No satori / external font files required - librsvg provides its own
 * text rendering with generic font-family fallbacks.
 */

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Wrap text into lines that fit within maxCharsPerLine */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSvg(title: string, subtitle?: string): string {
  const W = 1200;
  const H = 630;

  const titleLines = wrapText(escapeXml(title), 34);
  const titleFontSize = titleLines.length > 2 ? 48 : 56;
  const titleLineHeight = titleFontSize * 1.2;

  // Vertically center the text block
  const subtitleLines = subtitle ? wrapText(escapeXml(subtitle), 55) : [];
  const subtitleVisibleLines = subtitleLines.slice(0, 3);
  const subtitleFontSize = 24;
  const subtitleLineHeight = subtitleFontSize * 1.5;
  const subtitleBlockHeight = subtitle ? 32 + subtitleVisibleLines.length * subtitleLineHeight : 0;
  const totalTextHeight = titleLines.length * titleLineHeight + subtitleBlockHeight;
  const titleStartY = Math.max(160, (H - totalTextHeight) / 2 + titleFontSize * 0.8);

  const subtitleStartY = titleStartY + (titleLines.length - 1) * titleLineHeight + 40;

  const titleElements = titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${titleStartY + i * titleLineHeight}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#f1f5f9">${line}</text>`
    )
    .join('\n  ');

  const subtitleElements = subtitleVisibleLines
    .map(
      (line, i) =>
        `<text x="96" y="${subtitleStartY + i * subtitleLineHeight}" font-family="sans-serif" font-size="${subtitleFontSize}" fill="#94a3b8">${line}</text>`
    )
    .join('\n  ');

  // Subtle quote-bar next to subtitle
  const subtitleBar = subtitle
    ? `<rect x="80" y="${subtitleStartY - subtitleFontSize + 4}" width="3" height="${subtitleVisibleLines.length * subtitleLineHeight}" rx="1.5" fill="#3b82f6" opacity="0.6"/>`
    : '';

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="5" height="${H}" fill="#2563eb"/>

  <!-- Subtle grid dots for texture -->
  <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="0.8" fill="#334155" opacity="0.5"/>
  </pattern>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- Site name -->
  <text x="80" y="72" font-family="sans-serif" font-size="18" font-weight="bold" letter-spacing="3" fill="#3b82f6">LLMs for Doctors</text>

  <!-- Title -->
  ${titleElements}

  <!-- Subtitle / content preview -->
  ${subtitleBar}
  ${subtitleElements}

  <!-- Bottom divider -->
  <rect x="80" y="${H - 64}" width="${W - 160}" height="1" fill="#334155"/>

  <!-- Attribution -->
  <text x="80" y="${H - 32}" font-family="sans-serif" font-size="17" fill="#64748b">llmsfordoctors.com</text>
  <text x="${W - 80}" y="${H - 32}" font-family="sans-serif" font-size="17" fill="#475569" text-anchor="end">Jason Gusdorf, MD</text>
</svg>`;
}

export async function generateOgImage(title: string, subtitle?: string): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const svg = buildSvg(title, subtitle);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
