import type { NormalizedItem } from "@/types";

function hoursSince(iso: string): number {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 3600000);
}

export function scoreItem(item: NormalizedItem, clusterSize = 1): number {
  const ageH = hoursSince(item.published_at);
  const freshness = Math.exp(-ageH / 18);
  const velocity = clusterSize > 1 ? Math.min(2, 0.5 + clusterSize * 0.25) : 1;
  const engagement = Math.min(2, 0.8 + item.engagement_signal * 0.2);
  const indiaBoost = item.category === "india" || item.region === "india" ? 1.15 : 1;
  const aiBoost = item.category === "ai" ? 1.1 : 1;
  return freshness * velocity * engagement * indiaBoost * aiBoost * 100;
}

export function rankItems(items: NormalizedItem[]): NormalizedItem[] {
  return [...items].sort((a, b) => scoreItem(b) - scoreItem(a));
}
