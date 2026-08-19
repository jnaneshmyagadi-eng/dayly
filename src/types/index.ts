export type Category =
  | "india"
  | "world"
  | "ai"
  | "technology"
  | "business"
  | "entertainment"
  | "sports"
  | "science"
  | "viral"
  | "opportunities";

export interface NormalizedItem {
  source: string;
  title: string;
  url: string;
  published_at: string;
  category: Category;
  language: string;
  region: string;
  engagement_signal: number;
  keywords: string[];
  entities: string[];
  summary?: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  category: string;
  region: string;
  language: string;
  summary: string | null;
  what_happened: string | null;
  why_trending: string | null;
  why_matters: string | null;
  what_people_saying: string | null;
  what_next: string | null;
  explain_30s: string | null;
  trend_score: number;
  velocity: number;
  confidence: number;
  source_count: number;
  is_live: boolean;
  published_at: string;
  updated_at: string;
  topic_sources?: TopicSource[];
}

export interface TopicSource {
  id: string;
  topic_id: string;
  source_name: string;
  title: string;
  url: string;
  published_at: string | null;
  engagement_signal: number;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  organization: string | null;
  location: string | null;
  category: string;
  deadline: string | null;
  eligibility: string | null;
  summary: string | null;
  source_name: string | null;
  official_url: string;
  is_active: boolean;
}

export interface OmigyPoll {
  id: string;
  topic_id: string | null;
  question: string;
  option_a: string;
  option_b: string;
  vote_count_a: number;
  vote_count_b: number;
  is_active: boolean;
  created_at: string;
}

export type Locale = "en" | "hi" | "kn";
