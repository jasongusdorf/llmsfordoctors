import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = path.join(ROOT, 'public/images/cardiology/open-media');
const MANIFEST = path.join(ROOT, 'src/data/cardiology-open-media.json');
const MAX = Number(process.env.CARDIOLOGY_MEDIA_MAX || 180);
const PER_CATEGORY = Math.max(1, Math.ceil(MAX / 6));

const categorySeeds = [
  ['Echo', 'Echocardiography'],
  ['Cardiac MRI', 'Magnetic resonance imaging of the heart'],
  ['Cardiac MRI', 'Cine magnetic resonance imaging'],
  ['Angiography', 'Coronary angiography'],
  ['Cardiac CT', 'CT images of diseases and disorders of the heart'],
  ['Anatomy', 'Anatomy of the human heart'],
];

const allowedLicenses = /^(cc0|pd|public domain|cc-by(?:-sa)?(?:-[\d.]+)?)/i;
const allowedMime = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const skipTitle = /logo|icon|portrait|equipment|machine|building|conference|award|map|coat of arms/i;

function cleanHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
}

function slug(value) {
  return value.toLowerCase().replace(/^file:/, '').replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96);
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(url, destination, attempt = 0) {
  const response = await fetch(url, { headers: { 'user-agent': 'LLMsForDoctorsMediaIngest/1.0' } });
  if ((response.status === 429 || response.status >= 500) && attempt < 7) {
    await pause(Math.min(30000, 1200 * 2 ** attempt));
    return download(url, destination, attempt + 1);
  }
  if (!response.ok) throw new Error(`Download ${response.status}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);
  await pause(250);
  return { bytes: bytes.length, checksum: createHash('sha256').update(bytes).digest('hex') };
}

async function fetchText(url, attempt = 0) {
  const response = await fetch(url, { headers: { 'user-agent': 'LLMsForDoctorsMediaIngest/1.0 (educational attribution pipeline)' } });
  if ((response.status === 429 || response.status >= 500) && attempt < 6) {
    await pause(Math.min(20000, 1000 * 2 ** attempt));
    return fetchText(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}

async function categoryTitles(category) {
  const html = await fetchText(`https://commons.wikimedia.org/wiki/Category:${encodeURIComponent(category).replace(/%20/g, '_')}`);
  return [...new Set([...html.matchAll(/href="\/wiki\/(File:[^"]+)/g)].map((match) => decodeURIComponent(match[1]).replace(/_/g, ' ')))]
    .filter((title) => /\.(jpe?g|png|gif|webp)$/i.test(title) && !skipTitle.test(title));
}

async function fileRecord(title) {
  const encoded = encodeURIComponent(title.replace(/^File:/, '')).replace(/%20/g, '_');
  const html = await fetchText(`https://commons.wikimedia.org/wiki/File:${encoded}`);
  const license = cleanHtml(html.match(/class="licensetpl(?:&#95;|_)short">([\s\S]*?)<\/span>/)?.[1] || '');
  const creator = cleanHtml(html.match(/class="licensetpl(?:&#95;|_)attr">([\s\S]*?)<\/span>/)?.[1] || 'Wikimedia Commons contributor');
  const description = cleanHtml(html.match(/class="description en"[\s\S]*?<\/span>([\s\S]*?)<\/div>/)?.[1] || title.replace(/^File:/, '').replace(/\.[^.]+$/, ''));
  const licenseUrl = html.match(/<link rel="license" href="([^"]+)"/)?.[1]
    || html.match(/"license":"([^"]+)"/)?.[1]?.replace(/\\\//g, '/')
    || 'https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia';
  const schemaRaw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  let schema = {};
  try { schema = JSON.parse(schemaRaw || '{}'); } catch {}
  const mediaUrl = schema.contentUrl?.replace(/\\\//g, '/');
  const mime = schema.encodingFormat || '';
  return { license, creator, description, licenseUrl, mediaUrl, originalUrl: mediaUrl, mime, width: Number.parseInt(schema.width) || undefined, height: Number.parseInt(schema.height) || undefined };
}

await mkdir(OUT_DIR, { recursive: true });
let existing = [];
try { existing = JSON.parse(await readFile(MANIFEST, 'utf8')); } catch {}
const bySource = new Map(existing.map((item) => [item.sourcePage, item]));
const selected = [];

for (const [modality, category] of categorySeeds) {
  if (selected.length >= MAX) break;
  const titles = await categoryTitles(category);
  for (const title of titles) {
    if (selected.length >= MAX || selected.filter((item) => item.category === category).length >= PER_CATEGORY) break;
    let row;
    try { row = await fileRecord(title); } catch (error) { console.warn(`Metadata skipped ${title}: ${error.message}`); continue; }
    const { license, creator, description, licenseUrl } = row;
    const mime = row.mime || `image/${title.toLowerCase().endsWith('.png') ? 'png' : title.toLowerCase().endsWith('.gif') ? 'gif' : title.toLowerCase().endsWith('.webp') ? 'webp' : 'jpeg'}`;
    if (!allowedMime.has(mime) || !allowedLicenses.test(license)) continue;
    const sourcePage = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title).replace(/%20/g, '_')}`;
    const old = bySource.get(sourcePage);
    if (old) { selected.push(old); continue; }
    const extension = mime === 'image/png' ? 'png' : mime === 'image/gif' ? 'gif' : mime === 'image/webp' ? 'webp' : 'jpg';
    const sourceKey = createHash('sha1').update(sourcePage).digest('hex').slice(0, 8);
    const id = `${slug(title)}-${sourceKey}`;
    const filename = `${id}.${extension}`;
    const mediaUrl = row.mediaUrl;
    if (!mediaUrl) continue;
    try {
      const file = await download(mediaUrl, path.join(OUT_DIR, filename));
      selected.push({
        id,
        title: cleanHtml(title.replace(/^File:/, '').replace(/\.[^.]+$/, '')),
        description,
        modality,
        category,
        src: `/images/cardiology/open-media/${filename}`,
        sourcePage,
        originalUrl: row.originalUrl,
        creator,
        credit: '',
        license,
        licenseUrl,
        attributionRequired: !/^(cc0|pd|public domain)/i.test(license),
        changes: 'No clinical content altered.',
        width: row.width,
        height: row.height,
        mime,
        commonsSha1: null,
        localSha256: file.checksum,
        bytes: file.bytes,
        importedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn(`Skipped ${title}: ${error.message}`);
    }
  }
}

selected.sort((a, b) => a.modality.localeCompare(b.modality) || a.title.localeCompare(b.title));
await writeFile(MANIFEST, `${JSON.stringify(selected, null, 2)}\n`);
console.log(`Imported ${selected.length} licensed cardiology assets (${Math.round(selected.reduce((n, item) => n + item.bytes, 0) / 1024 / 1024)} MB).`);
