import type { NewsItem } from './types.js';

function safeDate(pubDate: string): string {
  const parsed = new Date(pubDate);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function extractTag(xml: string, tag: string): string {
  if (xml.length > 50_000) xml = xml.slice(0, 50_000);
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  return (match[1] ?? match[2] ?? '').trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function extractEnclosure(block: string): string | undefined {
  const match = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  return match?.[1];
}

export function parseRssFeed(xml: string, sourceName: string): NewsItem[] {
  const itemBlocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi);
  if (!itemBlocks) return [];

  return itemBlocks
    .map((block) => {
      const title = extractTag(block, 'title');
      const url = extractTag(block, 'link');
      if (!title || !url) return null;

      const pubDate = extractTag(block, 'pubDate');
      const description = extractTag(block, 'description');

      return {
        title: title.trim(),
        source: sourceName,
        url,
        date: pubDate ? safeDate(pubDate) : new Date().toISOString(),
        summary: stripHtml(description).slice(0, 200),
        imageUrl: extractEnclosure(block),
      };
    })
    .filter((item): item is NewsItem => item !== null);
}
