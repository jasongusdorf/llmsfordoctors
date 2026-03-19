export interface NewsSource {
  name: string;
  url: string;
  priority: number; // 1 = highest
}

export const newsSources: NewsSource[] = [
  {
    name: 'STAT News',
    url: 'https://www.statnews.com/feed/',
    priority: 1,
  },
  {
    name: 'Nature Digital Medicine',
    url: 'https://www.nature.com/npjdigitalmed.rss',
    priority: 1,
  },
  {
    name: 'PubMed AI + Medicine',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1sxAg_bOANMKbcMkEb-yblSCDG5BtaQ-dqIMPa4EvOlb4xqNYR/?limit=20&utm_campaign=pubmed-2&fc=20250101000000',
    priority: 2,
  },
  {
    name: 'JAMA Health Forum',
    url: 'https://jamanetwork.com/rss/site_178/74.xml',
    priority: 2,
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    priority: 3,
  },
  {
    name: 'Wired Science',
    url: 'https://www.wired.com/feed/category/science/latest/rss',
    priority: 3,
  },
  {
    name: 'Ars Technica Science',
    url: 'https://feeds.arstechnica.com/arstechnica/science',
    priority: 3,
  },
  {
    name: 'Google News AI Medicine',
    url: 'https://news.google.com/rss/search?q=artificial+intelligence+medicine&hl=en&gl=US&ceid=US:en',
    priority: 4,
  },
];
