import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import type { Topic } from "@/types";

const categoryLabel: Record<string, string> = {
  india: "India",
  world: "World",
  ai: "AI",
  technology: "Technology",
  business: "Business",
  entertainment: "Entertainment",
  sports: "Sports",
  science: "Science",
  viral: "Viral",
  opportunities: "Opportunities",
};

export function TrendCard({ topic }: { topic: Topic }) {
  const strength = Math.min(100, Math.round(Number(topic.trend_score) || 0));
  return (
    <article className="card p-4 hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="chip">{categoryLabel[topic.category] || topic.category}</span>
        <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
          {timeAgo(topic.updated_at || topic.published_at)}
        </span>
      </div>
      <Link href={`/topic/${topic.slug}`}>
        <h3 className="font-semibold text-[15px] leading-snug mb-2 hover:text-[var(--accent)] line-clamp-2">
          {topic.title}
        </h3>
      </Link>
      {topic.summary && (
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">{topic.summary}</p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <span className="font-medium text-[var(--accent-2)]">{strength}</span>
          <span>strength</span>
          <span>·</span>
          <span>{topic.source_count || 1} sources</span>
        </div>
        <Link href={`/topic/${topic.slug}`} className="text-xs font-semibold text-[var(--accent)]">
          Open →
        </Link>
      </div>
      <div className="mt-3 h-1 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
          style={{ width: `${Math.max(8, strength)}%` }}
        />
      </div>
    </article>
  );
}
