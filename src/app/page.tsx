import { createClient } from "@/lib/supabase/server";
import { TrendCard } from "@/components/home/trend-card";
import Link from "next/link";
import type { Topic, OmigyPoll, Opportunity } from "@/types";
import { timeAgo } from "@/lib/utils";

export const revalidate = 120;

const CATEGORIES = ["india", "world", "ai", "technology", "business", "entertainment", "sports", "science", "viral"];

async function getData() {
  try {
    const supabase = await createClient();
    const [topicsRes, pollsRes, oppsRes] = await Promise.all([
      supabase.from("topics").select("*").eq("is_live", true).order("trend_score", { ascending: false }).limit(24),
      supabase.from("omigy_polls").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(6),
      supabase.from("opportunities").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(6),
    ]);
    return {
      topics: (topicsRes.data || []) as Topic[],
      polls: (pollsRes.data || []) as OmigyPoll[],
      opportunities: (oppsRes.data || []) as Opportunity[],
      error: topicsRes.error?.message,
    };
  } catch (e: any) {
    return { topics: [], polls: [], opportunities: [], error: e?.message };
  }
}

export default async function HomePage() {
  const { topics, polls, opportunities, error } = await getData();
  const top = topics.slice(0, 8);
  const byCat = CATEGORIES.map((c) => ({
    cat: c,
    items: topics.filter((t) => t.category === c).slice(0, 4),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-10">
      <section className="pt-2 pb-1">
        <p className="text-xs font-semibold tracking-widest text-[var(--accent)] uppercase mb-2">Live intelligence</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">What's happening right now?</h1>
        <p className="text-[var(--text-muted)] text-base max-w-2xl">The internet, understood for you. Discover signals, understand why they matter, debate, and decide.</p>
        {error && <p className="mt-3 text-sm text-[var(--warning)]">Some live sources are temporarily unavailable. Showing the latest verified data.</p>}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Right now</h2>
          <Link href="/trending" className="text-sm text-[var(--accent)] font-medium">See all</Link>
        </div>
        {top.length === 0 ? (
          <div className="card p-8 text-center text-[var(--text-muted)]">
            <p className="font-medium text-[var(--text)] mb-1">No major trend detected yet.</p>
            <p className="text-sm">Check back soon — OMIGY is gathering signals from public sources.</p>
            <a href="/api/ingest" className="btn btn-primary mt-4 inline-flex">Refresh signals</a>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">{top.map((t) => <TrendCard key={t.id} topic={t} />)}</div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold mb-1">Your day in 60 seconds</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">A compact briefing from the strongest current signals.</p>
        {top.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Not enough reliable signals yet.</p>
        ) : (
          <ol className="space-y-3 text-sm">
            <li><span className="text-[var(--text-muted)]">1. Biggest story — </span><Link href={`/topic/${top[0].slug}`} className="font-medium hover:text-[var(--accent)]">{top[0].title}</Link></li>
            {top.find((t) => t.category === "india") && <li><span className="text-[var(--text-muted)]">2. India — </span><Link href={`/topic/${top.find((t) => t.category === "india")!.slug}`} className="font-medium hover:text-[var(--accent)]">{top.find((t) => t.category === "india")!.title}</Link></li>}
            {top.find((t) => t.category === "world") && <li><span className="text-[var(--text-muted)]">3. World — </span><Link href={`/topic/${top.find((t) => t.category === "world")!.slug}`} className="font-medium hover:text-[var(--accent)]">{top.find((t) => t.category === "world")!.title}</Link></li>}
            {top.find((t) => t.category === "ai" || t.category === "technology") && <li><span className="text-[var(--text-muted)]">4. AI / Tech — </span><Link href={`/topic/${top.find((t) => t.category === "ai" || t.category === "technology")!.slug}`} className="font-medium hover:text-[var(--accent)]">{top.find((t) => t.category === "ai" || t.category === "technology")!.title}</Link></li>}
            {polls[0] && <li><span className="text-[var(--text-muted)]">5. Biggest debate — </span><Link href="/debate" className="font-medium hover:text-[var(--accent)]">{polls[0].question}</Link></li>}
            {opportunities[0] && <li><span className="text-[var(--text-muted)]">6. Opportunity — </span><a href={opportunities[0].official_url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[var(--accent)]">{opportunities[0].title}</a></li>}
            <li><span className="text-[var(--text-muted)]">7. Worth knowing — </span>Signals refresh automatically from public feeds. Always open sources for primary reporting.</li>
          </ol>
        )}
      </section>

      {polls.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Internet debate</h2>
            <Link href="/debate" className="text-sm text-[var(--accent)] font-medium">All polls</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {polls.slice(0, 4).map((p) => {
              const total = p.vote_count_a + p.vote_count_b || 1;
              const pctA = Math.round((p.vote_count_a / total) * 100);
              return (
                <div key={p.id} className="card p-4">
                  <p className="font-semibold text-sm mb-3">{p.question}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span>{p.option_a}</span><span className="text-[var(--text-muted)]">{pctA}%</span></div>
                    <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden"><div className="h-full bg-[var(--accent)]" style={{ width: `${pctA}%` }} /></div>
                    <div className="flex justify-between"><span>{p.option_b}</span><span className="text-[var(--text-muted)]">{100 - pctA}%</span></div>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-3">{p.vote_count_a + p.vote_count_b} votes · {timeAgo(p.created_at)}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {opportunities.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Opportunity radar</h2>
            <Link href="/opportunities" className="text-sm text-[var(--accent)] font-medium">Explore</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {opportunities.map((o) => (
              <a key={o.id} href={o.official_url} target="_blank" rel="noopener noreferrer" className="card p-4 block hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]">
                <span className="chip mb-2">{o.category}</span>
                <h3 className="font-semibold text-sm mb-1">{o.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">{o.organization}{o.location ? ` · ${o.location}` : ""}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {byCat.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-lg font-bold">Trending now</h2>
          {byCat.map(({ cat, items }) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-2">{cat}</h3>
              <div className="grid gap-3 sm:grid-cols-2">{items.map((t) => <TrendCard key={t.id} topic={t} />)}</div>
            </div>
          ))}
        </section>
      )}

      <section className="card p-5 text-sm text-[var(--text-muted)]">
        <h2 className="text-base font-bold text-[var(--text)] mb-2">Sources</h2>
        <p>OMIGY aggregates publicly available RSS and feed data. Cards cluster related stories. Explanations are grounded in retrieved headlines — not invented facts. Always open source links for primary reporting.</p>
      </section>
    </div>
  );
}
