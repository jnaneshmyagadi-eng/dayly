"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SearchInner() {
  const sp = useSearchParams();
  const initial = sp.get("q") || "";
  const [q, setQ] = useState(initial);
  const [data, setData] = useState<any>({ topics: [], polls: [], opportunities: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (!query) { setData({ topics: [], polls: [], opportunities: [] }); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setData(await res.json());
      } catch {
        setData({ topics: [], polls: [], opportunities: [] });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-3">Search OMIGY</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What is trending in India? AI trends? Opportunities?" className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] py-3 px-4 text-sm outline-none focus:border-[var(--accent)]" autoFocus />
      </div>
      {loading && <p className="text-sm text-[var(--text-muted)]">Searching…</p>}
      {!loading && q && data.topics?.length === 0 && data.polls?.length === 0 && data.opportunities?.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No matches yet. Try broader keywords.</p>
      )}
      {data.topics?.length > 0 && (
        <section>
          <h2 className="font-bold mb-2">Topics</h2>
          <ul className="space-y-2">{data.topics.map((t: any) => (
            <li key={t.id}><Link href={`/topic/${t.slug}`} className="card p-3 block hover:border-[var(--accent)]"><div className="font-medium text-sm">{t.title}</div><div className="text-xs text-[var(--text-muted)]">{t.category}</div></Link></li>
          ))}</ul>
        </section>
      )}
      {data.opportunities?.length > 0 && (
        <section>
          <h2 className="font-bold mb-2">Opportunities</h2>
          <ul className="space-y-2">{data.opportunities.map((o: any) => (
            <li key={o.id}><a href={o.official_url} target="_blank" rel="noopener noreferrer" className="card p-3 block"><div className="font-medium text-sm">{o.title}</div><div className="text-xs text-[var(--text-muted)]">{o.organization}</div></a></li>
          ))}</ul>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">Loading search…</p>}>
      <SearchInner />
    </Suspense>
  );
}
