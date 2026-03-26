import { parseRssFeed } from './parse-rss.js';
import { newsSources } from './news-sources.js';
export type { NewsItem } from './types.js';
import type { NewsItem } from './types.js';

const FEED_TIMEOUT_MS = 10_000;
const MAX_AGE_DAYS = 90;
const MAX_AGE_DAYS_PUBMED = 90;
const MAX_ITEMS = 10;

// --- Fetching ---

async function fetchFeed(
  url: string,
  sourceName: string,
  priority: number
): Promise<{ items: NewsItem[]; priority: number }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { 'User-Agent': 'LLMsForDoctors-NewsFetcher/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = parseRssFeed(xml, sourceName);
    return { items, priority };
  } catch (err) {
    console.warn(`[refresh-news] Failed to fetch ${sourceName}: ${(err as Error).message}`);
    return { items: [], priority };
  }
}

// --- PubMed E-utilities ---

const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_FETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const PUBMED_QUERY =
  '("artificial intelligence"[Title] OR "machine learning"[Title] OR "deep learning"[Title] OR "large language model"[Title] OR "LLM"[Title] OR "clinical decision support"[Title]) AND ("NEJM AI"[Journal] OR "Lancet Digit Health"[Journal] OR "npj Digit Med"[Journal] OR "JAMA Netw Open"[Journal] OR "Nat Med"[Journal] OR "Radiology"[Journal] OR "BMJ"[Journal])';

async function fetchPubMed(): Promise<{ items: NewsItem[]; priority: number }> {
  try {
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term: PUBMED_QUERY,
      retmax: '50',
      retmode: 'json',
      sort: 'date',
    });
    const searchRes = await fetch(`${PUBMED_SEARCH_URL}?${searchParams}`, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { 'User-Agent': 'LLMsForDoctors-NewsFetcher/1.0' },
    });
    if (!searchRes.ok) throw new Error(`PubMed search HTTP ${searchRes.status}`);
    const searchData = (await searchRes.json()) as {
      esearchresult: { idlist: string[] };
    };
    const pmids = searchData.esearchresult?.idlist || [];
    if (pmids.length === 0) return { items: [], priority: 1 };

    const fetchParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'json',
    });
    const fetchRes = await fetch(`${PUBMED_FETCH_URL}?${fetchParams}`, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { 'User-Agent': 'LLMsForDoctors-NewsFetcher/1.0' },
    });
    if (!fetchRes.ok) throw new Error(`PubMed fetch HTTP ${fetchRes.status}`);
    const fetchData = (await fetchRes.json()) as {
      result: Record<
        string,
        {
          uid: string;
          title: string;
          source: string;
          pubdate: string;
          sortfirstauthor: string;
        }
      >;
    };

    const items: NewsItem[] = pmids
      .filter((id) => fetchData.result?.[id]?.title)
      .map((id) => {
        const article = fetchData.result[id];
        return {
          title: article.title.replace(/\.$/, ''),
          source: article.source || 'PubMed',
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          date: new Date(article.pubdate || Date.now()).toISOString(),
          summary: `${article.sortfirstauthor} et al. Published in ${article.source}.`,
        };
      });

    console.log(`[refresh-news] PubMed: ${items.length} papers from top journals`);
    return { items, priority: 1 };
  } catch (err) {
    console.warn(`[refresh-news] Failed to fetch PubMed: ${(err as Error).message}`);
    return { items: [], priority: 1 };
  }
}

// --- Deduplication ---

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function deduplicate(items: NewsItem[]): NewsItem[] {
  const seen = new Map<string, { tokens: Set<string>; item: NewsItem }>();

  for (const item of items) {
    if (seen.has(item.url)) continue;

    const tokens = tokenize(item.title);
    let isDuplicate = false;
    for (const [, existing] of seen) {
      if (jaccardSimilarity(tokens, existing.tokens) > 0.8) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      seen.set(item.url, { tokens, item });
    }
  }

  return [...seen.values()].map((v) => v.item);
}

// --- AI Relevance ---

const AI_KEYWORDS = [
  'artificial intelligence',
  'machine learning',
  'deep learning',
  'neural network',
  'large language model',
  'llm',
  'chatgpt',
  'gpt-4',
  'claude',
  'gemini',
  'clinical decision support',
  'natural language processing',
  'nlp',
  'computer vision',
  'radiology ai',
  'pathology ai',
  'medical ai',
  'ai in medicine',
  'ai in healthcare',
  'ai-powered',
  'ai-driven',
  'predictive model',
  'diagnostic ai',
  'generative ai',
  'foundation model',
  'clinical ai',
  'health ai',
  'digital health',
  'algorithm',
];

export function aiRelevanceScore(item: NewsItem): number {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  let score = 0;
  for (const keyword of AI_KEYWORDS) {
    if (text.includes(keyword)) score += 5;
  }
  return score;
}

// --- Scoring ---

export function scoreItem(item: NewsItem, sourcePriority: number, isAiOnly: boolean): number {
  const ageMs = Date.now() - new Date(item.date).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 10 - ageDays / 9);
  const priorityScore = Math.max(1, 11 - sourcePriority * 3);
  const relevanceScore = isAiOnly ? 10 : aiRelevanceScore(item);
  const journalBonus = sourcePriority === 0 ? 15 : 0;
  return recencyScore + priorityScore + relevanceScore + journalBonus;
}

// --- Main entry point ---

export async function refreshNews(): Promise<NewsItem[]> {
  console.log('[refresh-news] Starting news fetch...');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);

  const [rssResults, pubmedResult] = await Promise.all([
    Promise.all(newsSources.map((source) => fetchFeed(source.url, source.name, source.priority))),
    fetchPubMed(),
  ]);

  const allItems: { item: NewsItem; priority: number; aiOnly: boolean }[] = [];
  for (let i = 0; i < rssResults.length; i++) {
    const result = rssResults[i];
    const source = newsSources[i];
    for (const item of result.items) {
      allItems.push({ item, priority: result.priority, aiOnly: source.aiOnly });
    }
  }

  const recent = allItems.filter(
    ({ item }) => new Date(item.date) >= cutoffDate && item.title && item.url
  );

  const pubmedCutoff = new Date();
  pubmedCutoff.setDate(pubmedCutoff.getDate() - MAX_AGE_DAYS_PUBMED);
  for (const item of pubmedResult.items) {
    if (new Date(item.date) >= pubmedCutoff && item.title && item.url) {
      recent.push({ item, priority: 0, aiOnly: true });
    }
  }

  console.log(`[refresh-news] ${recent.length} items within last ${MAX_AGE_DAYS} days`);

  const unique = deduplicate(recent.map((r) => r.item));

  const metaMap = new Map<string, { priority: number; aiOnly: boolean }>();
  for (const { item, priority, aiOnly } of recent) {
    if (!metaMap.has(item.url)) {
      metaMap.set(item.url, { priority, aiOnly });
    }
  }

  const scored = unique
    .map((item) => {
      const meta = metaMap.get(item.url) || { priority: 4, aiOnly: false };
      return {
        item,
        score: scoreItem(item, meta.priority, meta.aiOnly),
      };
    })
    .sort((a, b) => b.score - a.score);

  const topItems = scored
    .slice(0, MAX_ITEMS)
    .map((s) => s.item)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log(`[refresh-news] Returning ${topItems.length} items`);
  return topItems;
}
