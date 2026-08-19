import { XMLParser } from "fast-xml-parser";
import type { Category, NormalizedItem } from "@/types";

export interface RssSource {
  key: string;
  name: string;
  url: string;
  category: Category;
  region: string;
  language: string;
}

export const RSS_SOURCES: RssSource[] = [
  { key: "bbc-world", name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "world", region: "global", language: "en" },
  { key: "bbc-tech", name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "technology", region: "global", language: "en" },
  { key: "bbc-business", name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", category: "business", region: "global", language: "en" },
  { key: "bbc-science", name: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "science", region: "global", language: "en" },
  { key: "guardian-world", name: "The Guardian World", url: "https://www.theguardian.com/world/rss", category: "world", region: "global", language: "en" },
  { key: "guardian-tech", name: "The Guardian Technology", url: "https://www.theguardian.com/technology/rss", category: "technology", region: "global", language: "en" },
  { key: "hn", name: "Hacker News", url: "https://hnrss.org/frontpage", category: "ai", region: "global", language: "en" },
  { key: "nasa", name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", category: "science", region: "global", language: "en" },
  { key: "espn", name: "ESPN", url: "https://www.espn.com/espn/rss/news", category: "sports", region: "global", language: "en" },
];

function extractKeywords(title: string): string[] {
  return title.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 3).slice(0, 8);
}

function detectCategory(title: string, fallback: Category): Category {
  const t = title.toLowerCase();
  if (/\b(ai|openai|chatgpt|llm|machine learning|artificial intelligence|gpu|nvidia)\b/.test(t)) return "ai";
  if (/\b(india|modi|delhi|mumbai|bengaluru|bangalore|rupee)\b/.test(t)) return "india";
  if (/\b(cricket|football|nba|fifa|olympics|match|tournament)\b/.test(t)) return "sports";
  if (/\b(movie|film|celebrity|music|netflix|bollywood)\b/.test(t)) return "entertainment";
  if (/\b(stock|market|economy|bank|startup|ipo|funding)\b/.test(t)) return "business";
  if (/\b(space|nasa|climate|research|study|scientists)\b/.test(t)) return "science";
  if (/\b(viral|trending|meme)\b/.test(t)) return "viral";
  return fallback;
}

export async function fetchRssSource(source: RssSource): Promise<{ items: NormalizedItem[]; error?: string; ms: number }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { "User-Agent": "OMIGY/1.0 (+https://omigy.app)" },
      next: { revalidate: 300 },
    });
    clearTimeout(timeout);
    if (!res.ok) return { items: [], error: `HTTP ${res.status}`, ms: Date.now() - start };
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel || parsed?.feed;
    let rawItems: any[] = [];
    if (channel?.item) rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
    else if (channel?.entry) rawItems = Array.isArray(channel.entry) ? channel.entry : [channel.entry];
    const items: NormalizedItem[] = rawItems.slice(0, 25).map((item: any) => {
      const title = (item.title?.["#text"] || item.title || "").toString().trim();
      const link = (item.link?.["@_href"] || item.link || item.guid || "").toString();
      const pub = item.pubDate || item.published || item.updated || item["dc:date"] || new Date().toISOString();
      const desc = (item.description || item.summary || item.content || "").toString().slice(0, 400);
      return {
        source: source.name,
        title,
        url: typeof link === "string" ? link : String(link),
        published_at: new Date(pub).toISOString(),
        category: detectCategory(title, source.category),
        language: source.language,
        region: source.region,
        engagement_signal: 1,
        keywords: extractKeywords(title),
        entities: [],
        summary: desc.replace(/<[^>]+>/g, "").slice(0, 280),
      };
    }).filter((i: NormalizedItem) => i.title && i.url);
    return { items, ms: Date.now() - start };
  } catch (e: any) {
    return { items: [], error: e?.message || "fetch failed", ms: Date.now() - start };
  }
}

export async function fetchAllSources(): Promise<{
  items: NormalizedItem[];
  health: { key: string; name: string; ok: boolean; ms: number; error?: string; count: number }[];
}> {
  const results = await Promise.all(
    RSS_SOURCES.map(async (s) => {
      const r = await fetchRssSource(s);
      return { source: s, ...r };
    })
  );
  const items: NormalizedItem[] = [];
  const health = results.map((r) => {
    items.push(...r.items);
    return {
      key: r.source.key,
      name: r.source.name,
      ok: !r.error && r.items.length > 0,
      ms: r.ms,
      error: r.error,
      count: r.items.length,
    };
  });
  return { items, health };
}
