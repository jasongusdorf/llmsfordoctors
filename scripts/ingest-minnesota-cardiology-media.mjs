import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = path.join(ROOT, 'public/images/cardiology/minnesota-atlas');
const MANIFEST = path.join(ROOT, 'src/data/cardiology-minnesota-media.json');
const BASE = 'https://www.vhlab.umn.edu';
const MAX = Number(process.env.MINNESOTA_MEDIA_MAX || 120);
const PER_SECTION = Number(process.env.MINNESOTA_MEDIA_PER_SECTION || 10);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(url, attempt = 0) {
  const response = await fetch(url, { headers: { 'user-agent': 'LLMsForDoctorsMediaIngest/1.0 (educational attribution pipeline)' } });
  if ((response.status === 429 || response.status >= 500) && attempt < 5) {
    await pause(1000 * 2 ** attempt);
    return get(url, attempt + 1);
  }
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

function slug(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

async function sectionPages(root) {
  const html = await (await get(`${BASE}${root}/index.shtml`)).text();
  const matches = [...html.matchAll(/href="(\/atlas\/(?:static-mri|static-ct)\/[^"#?]+\/index\.shtml)"/g)].map((match) => match[1]);
  return [...new Set(matches)];
}

await mkdir(OUT_DIR, { recursive: true });
const pages = [...await sectionPages('/atlas/static-mri'), ...await sectionPages('/atlas/static-ct')];
const seenIds = new Set();
const assets = [];

for (const page of pages) {
  if (assets.length >= MAX) break;
  const html = await (await get(`${BASE}${page}`)).text();
  const candidates = [...html.matchAll(/<option[^>]+id=['"](\d+)['"][^>]*>([^<]+)<\/option>/g)]
    .map((match) => ({ id: match[1], label: match[2].trim() }))
    .filter((item) => item.id !== '0' && !seenIds.has(item.id))
    .slice(0, PER_SECTION);

  for (const candidate of candidates) {
    if (assets.length >= MAX) break;
    seenIds.add(candidate.id);
    let item;
    try {
      const text = await (await get(`${BASE}/cgi-bin/getItem.cgi?db_id=${candidate.id}`)).text();
      item = JSON.parse(text.replace(/,\s*([}\]])/g, '$1'))[0];
    } catch (error) {
      console.warn(`Metadata skipped ${candidate.id}: ${error.message}`);
      continue;
    }
    if (item.media_type !== 'still') continue;
    const imageUrl = `${BASE}/atlas/stills/${encodeURIComponent(item.file).replace(/%2F/g, '/')}.jpg`;
    let bytes;
    try { bytes = Buffer.from(await (await get(imageUrl)).arrayBuffer()); }
    catch (error) { console.warn(`Image skipped ${item.file}: ${error.message}`); continue; }
    const checksum = createHash('sha256').update(bytes).digest('hex');
    const filename = `${slug(item.file)}-${checksum.slice(0, 8)}.jpg`;
    await writeFile(path.join(OUT_DIR, filename), bytes);
    const modality = page.includes('static-mri') ? 'Cardiac MRI' : 'Cardiac CT';
    assets.push({
      id: `umn-${candidate.id}`,
      title: `${candidate.label} · ${page.split('/').at(-2).replace(/-/g, ' ')}`,
      description: String(item.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
      modality,
      category: `University of Minnesota Atlas · ${modality}`,
      src: `/images/cardiology/minnesota-atlas/${filename}`,
      sourcePage: `${BASE}${page}`,
      originalUrl: imageUrl,
      creator: 'Atlas of Human Cardiac Anatomy, University of Minnesota/© Medtronic',
      credit: 'Atlas of Human Cardiac Anatomy, University of Minnesota/© Medtronic (www.vhlab.umn.edu/atlas)',
      license: 'Educational reuse permitted with watermark and citation',
      licenseUrl: `${BASE}/atlas`,
      attributionRequired: true,
      changes: 'No changes; University of Minnesota watermark retained.',
      width: 640,
      height: 480,
      mime: 'image/jpeg',
      commonsSha1: null,
      localSha256: checksum,
      bytes: bytes.length,
      importedAt: new Date().toISOString(),
    });
    await pause(150);
  }
}

await writeFile(MANIFEST, `${JSON.stringify(assets, null, 2)}\n`);
console.log(`Imported ${assets.length} University of Minnesota cardiac assets (${Math.round(assets.reduce((n, item) => n + item.bytes, 0) / 1024 / 1024)} MB).`);

