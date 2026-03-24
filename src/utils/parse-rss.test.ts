import { describe, it, expect } from 'vitest';
import { parseRssFeed, extractTag, stripHtml } from './parse-rss';

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>AI in Radiology: A New Frontier</title>
      <link>https://example.com/article-1</link>
      <pubDate>Mon, 24 Mar 2026 10:00:00 GMT</pubDate>
      <description>&lt;p&gt;Deep learning models are transforming radiology.&lt;/p&gt;</description>
    </item>
    <item>
      <title>Second Article</title>
      <link>https://example.com/article-2</link>
      <pubDate>Sun, 23 Mar 2026 08:00:00 GMT</pubDate>
      <description>Plain text summary here</description>
      <enclosure url="https://example.com/image.jpg" type="image/jpeg" />
    </item>
  </channel>
</rss>`;

const EMPTY_RSS = `<?xml version="1.0"?><rss><channel></channel></rss>`;
const MALFORMED_RSS = `not xml at all`;

describe('parseRssFeed', () => {
  it('parses standard RSS items', () => {
    const items = parseRssFeed(SAMPLE_RSS, 'Test Source');
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('AI in Radiology: A New Frontier');
    expect(items[0].source).toBe('Test Source');
    expect(items[0].url).toBe('https://example.com/article-1');
    expect(items[0].date).toMatch(/2026-03-24/);
    expect(items[0].summary).toBe('Deep learning models are transforming radiology.');
  });

  it('extracts enclosure image URL', () => {
    const items = parseRssFeed(SAMPLE_RSS, 'Test Source');
    expect(items[1].imageUrl).toBe('https://example.com/image.jpg');
  });

  it('returns empty array for empty feed', () => {
    expect(parseRssFeed(EMPTY_RSS, 'Empty')).toEqual([]);
  });

  it('returns empty array for malformed input', () => {
    expect(parseRssFeed(MALFORMED_RSS, 'Bad')).toEqual([]);
  });

  it('handles invalid pubDate gracefully', () => {
    const xml = `<rss><channel><item>
      <title>Test</title>
      <link>https://example.com/test</link>
      <pubDate>not a date at all</pubDate>
      <description>Summary</description>
    </item></channel></rss>`;
    const items = parseRssFeed(xml, 'Test');
    expect(items).toHaveLength(1);
    expect(items[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T/); // valid ISO string, not a throw
  });
});

describe('extractTag', () => {
  it('extracts text content from XML tag', () => {
    expect(extractTag('<item><title>Hello World</title></item>', 'title')).toBe('Hello World');
  });

  it('returns empty string for missing tag', () => {
    expect(extractTag('<item></item>', 'title')).toBe('');
  });

  it('handles CDATA content', () => {
    expect(extractTag('<item><title><![CDATA[Test & Title]]></title></item>', 'title')).toBe('Test & Title');
  });
});

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('collapses whitespace', () => {
    expect(stripHtml('  hello   world  ')).toBe('hello world');
  });
});
