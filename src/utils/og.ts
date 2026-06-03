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

  // ---- microSD card geometry ----
  const cx0 = 70; // card left
  const cy0 = 64; // card top
  const cx1 = 1130; // card right
  const cy1 = 566; // card bottom
  const rx = 26; // corner radius
  const chamfer = 92; // angled top-right corner (the microSD cut)

  // Card outline: rounded everywhere except a straight chamfer at top-right.
  const cardPath = [
    `M ${cx0 + rx} ${cy0}`,
    `L ${cx1 - chamfer} ${cy0}`,
    `L ${cx1} ${cy0 + chamfer}`,
    `L ${cx1} ${cy1 - rx}`,
    `Q ${cx1} ${cy1} ${cx1 - rx} ${cy1}`,
    `L ${cx0 + rx} ${cy1}`,
    `Q ${cx0} ${cy1} ${cx0} ${cy1 - rx}`,
    `L ${cx0} ${cy0 + rx}`,
    `Q ${cx0} ${cy0} ${cx0 + rx} ${cy0}`,
    'Z',
  ].join(' ');

  // ---- printed label text (Quadraat, matching the site) ----
  const font = 'Quadraat, Georgia, serif';
  const textX = cx0 + 60;

  const titleLines = wrapText(escapeXml(title), 30);
  const titleFontSize = titleLines.length > 2 ? 52 : 64;
  const titleLineHeight = titleFontSize * 1.18;

  const subtitleLines = subtitle ? wrapText(escapeXml(subtitle), 58) : [];
  const subtitleVisibleLines = subtitleLines.slice(0, 2);
  const subtitleFontSize = 26;
  const subtitleLineHeight = subtitleFontSize * 1.5;

  // Vertically center the brand + title + subtitle block within the card.
  const brandGap = 56;
  const subtitleGap = 48;
  const titleBlock = titleLines.length * titleLineHeight;
  const subtitleBlock = subtitle ? subtitleGap + subtitleVisibleLines.length * subtitleLineHeight : 0;
  const blockHeight = brandGap + titleBlock + subtitleBlock;
  const blockTop = (cy0 + cy1) / 2 - blockHeight / 2;

  const brandY = blockTop + 18;
  const titleStartY = brandY + brandGap + titleFontSize * 0.8;
  const subtitleStartY = titleStartY + (titleLines.length - 1) * titleLineHeight + subtitleGap;

  const titleElements = titleLines
    .map(
      (line, i) =>
        `<text x="${textX}" y="${titleStartY + i * titleLineHeight}" font-family="${font}" font-size="${titleFontSize}" font-weight="bold" fill="#1f2937">${line}</text>`
    )
    .join('\n  ');

  const subtitleBar = subtitle
    ? `<rect x="${textX}" y="${subtitleStartY - subtitleFontSize + 4}" width="3" height="${subtitleVisibleLines.length * subtitleLineHeight}" rx="1.5" fill="#2563eb" opacity="0.7"/>`
    : '';

  const subtitleElements = subtitleVisibleLines
    .map(
      (line, i) =>
        `<text x="${textX + 20}" y="${subtitleStartY + i * subtitleLineHeight}" font-family="${font}" font-size="${subtitleFontSize}" fill="#5b6573">${line}</text>`
    )
    .join('\n  ');

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#3a2f17" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Warm parchment background (sitewide palette) -->
  <rect width="${W}" height="${H}" fill="#f8f4ec"/>

  <!-- Card body: chamfered top-right corner reads as a memory card -->
  <path d="${cardPath}" fill="#fffdf8" stroke="#e7e0d0" stroke-width="2" filter="url(#shadow)"/>

  <!-- Brand -->
  <text x="${textX}" y="${brandY}" font-family="${font}" font-size="20" font-weight="bold" letter-spacing="4" fill="#2563eb">LLMS FOR DOCTORS</text>

  <!-- Title -->
  ${titleElements}

  <!-- Subtitle -->
  ${subtitleBar}
  ${subtitleElements}

  <!-- Attribution -->
  <text x="${textX}" y="${cy1 - 34}" font-family="${font}" font-size="18" fill="#8a8170">llmsfordoctors.com</text>
  <text x="${cx1 - 46}" y="${cy1 - 34}" font-family="${font}" font-size="18" fill="#a39a86" text-anchor="end">Jason Gusdorf, MD</text>
</svg>`;
}

export async function generateOgImage(title: string, subtitle?: string): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const svg = buildSvg(title, subtitle);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
