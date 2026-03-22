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

  const titleLines = wrapText(escapeXml(title), 38);
  const titleFontSize = titleLines.length > 2 ? 52 : 64;
  const titleLineHeight = titleFontSize * 1.15;
  const titleStartY = subtitle ? 220 : 260;

  const subtitleLines = subtitle ? wrapText(escapeXml(subtitle), 60) : [];
  const subtitleFontSize = 28;
  const subtitleLineHeight = subtitleFontSize * 1.4;
  const subtitleStartY = titleStartY + titleLines.length * titleLineHeight + 30;

  const titleElements = titleLines
    .map(
      (line, i) =>
        `<text x="72" y="${titleStartY + i * titleLineHeight}" font-family="sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#f8fafc">${line}</text>`
    )
    .join('\n  ');

  const subtitleElements = subtitleLines
    .slice(0, 3) // cap at 3 lines
    .map(
      (line, i) =>
        `<text x="72" y="${subtitleStartY + i * subtitleLineHeight}" font-family="sans-serif" font-size="${subtitleFontSize}" fill="#94a3b8">${line}</text>`
    )
    .join('\n  ');

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#0c1a2e"/>
      <stop offset="100%" stop-color="#0f2744"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Top accent line -->
  <rect x="72" y="60" width="120" height="4" rx="2" fill="#38bdf8"/>

  <!-- "LLMs for Doctors" label -->
  <text x="72" y="115" font-family="sans-serif" font-size="22" font-weight="bold" letter-spacing="2" fill="#38bdf8">LLMs for Doctors</text>

  <!-- Title -->
  ${titleElements}

  <!-- Subtitle -->
  ${subtitleElements}

  <!-- Bottom attribution -->
  <text x="72" y="${H - 52}" font-family="sans-serif" font-size="20" fill="#475569">llmsfordoctors.com - by Jason Gusdorf, MD</text>
  <rect x="72" y="${H - 38}" width="600" height="2" rx="1" fill="#1e3a5f"/>
</svg>`;
}

export async function generateOgImage(title: string, subtitle?: string): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const svg = buildSvg(title, subtitle);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
