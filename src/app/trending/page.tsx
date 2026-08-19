import { createClient } from "@/lib/supabase/server";
import { TrendCard } from "@/components/home/trend-card";
import type { Topic } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trending" };
export const revalidate = 120;

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("topics").select("*").eq("is_live", true).order("trend_score", { ascending: false }).limit(40);
  if (cat) q = q.eq("category", cat);
  const { data } = await q;
  const topics = (data || []) as Topic[];
  const cats = ["india", "world", "ai", "technology", "business", "sports", "science", "entertainment", "viral"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trending</h1>
        <p className="text-sm text-[var(--text-muted)]">Ranked by freshness, velocity, and source diversity.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <a href="/trending" className={`chip ${!cat ? "ring-1 ring-[var(--accent)]" : ""}`}>
          All
        </a>
        {cats.map((c) => (
          <a key={c} href={`/trending?cat=${c}`} className={`chip capitalize ${cat === c ? "ring-1 ring-[var(--accent)]" : ""}`}>
            {c}
          </a>
        ))}
      </div>
      {topics.length === 0 ? (
        <div className="card p-8 text-center text-[var(--text-muted)]">
          Not enough reliable signals yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((t) => (
            <TrendCard key={t.id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}
