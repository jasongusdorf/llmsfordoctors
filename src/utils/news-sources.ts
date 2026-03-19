export interface NewsSource {
  name: string;
  url: string;
  priority: number; // 1 = highest
  aiOnly: boolean; // if true, all articles are AI-relevant (skip keyword check)
}

export const newsSources: NewsSource[] = [
  {
    name: 'Nature Digital Medicine',
    url: 'https://www.nature.com/npjdigitalmed.rss',
    priority: 1,
    aiOnly: true, // every article is AI/digital health
  },
  {
    name: 'Nature Medicine',
    url: 'https://www.nature.com/nm.rss',
    priority: 2,
    aiOnly: false,
  },
  {
    name: 'STAT News',
    url: 'https://www.statnews.com/feed/',
    priority: 2,
    aiOnly: false,
  },
  {
    name: 'Google News AI Medicine',
    url: 'https://news.google.com/rss/search?q=%22artificial+intelligence%22+%22clinical%22+OR+%22NEJM+AI%22+OR+%22medical+AI%22+OR+%22LLM%22+%22healthcare%22+OR+%22machine+learning%22+%22diagnosis%22&hl=en&gl=US&ceid=US:en',
    priority: 1,
    aiOnly: true, // search query is AI-specific
  },
  {
    name: 'Google News AI Healthcare',
    url: 'https://news.google.com/rss/search?q=%22AI+in+medicine%22+OR+%22artificial+intelligence+healthcare%22+OR+%22clinical+decision+support%22+OR+%22medical+AI%22&hl=en&gl=US&ceid=US:en',
    priority: 2,
    aiOnly: true,
  },
];
