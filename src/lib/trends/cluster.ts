import type { NormalizedItem } from "@/types";
import { slugify } from "@/lib/utils";
import { scoreItem } from "@/lib/ranking/rank";

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export interface Cluster {
  title: string;
  slug: string;
  category: string;
  region: string;
  language: string;
  items: NormalizedItem[];
  score: number;
  summary: string;
}

export function clusterItems(items: NormalizedItem[], threshold = 0.28): Cluster[] {
  const clusters: { tokens: Set<string>; items: NormalizedItem[] }[] = [];
  for (const item of items) {
    const tokens = tokenize(item.title);
    let bestIdx = -1;
    let bestSim = 0;
    for (let i = 0; i < clusters.length; i++) {
      const sim = jaccard(tokens, clusters[i].tokens);
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && bestSim >= threshold) {
      clusters[bestIdx].items.push(item);
      for (const t of tokens) clusters[bestIdx].tokens.add(t);
    } else {
      clusters.push({ tokens, items: [item] });
    }
  }

  return clusters
    .map((c) => {
      const primary = c.items.sort((a, b) => scoreItem(b, c.items.length) - scoreItem(a, c.items.length))[0];
      const score = scoreItem(primary, c.items.length) * (1 + Math.log1p(c.items.length));
      const sources = [...new Set(c.items.map((i) => i.source))];
      const summary =
        primary.summary ||
        `${primary.title}. Covered by ${sources.slice(0, 4).join(", ")}${sources.length > 4 ? " and others" : ""}.`;
      return {
        title: primary.title,
        slug: slugify(primary.title) + "-" + Math.abs(hashCode(primary.title)).toString(36).slice(0, 5),
        category: primary.category,
        region: primary.region,
        language: primary.language,
        items: c.items,
        score,
        summary: summary.slice(0, 400),
      };
    })
    .sort((a, b) => b.score - a.score);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
