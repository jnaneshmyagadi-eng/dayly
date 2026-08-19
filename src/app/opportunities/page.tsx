import { createClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Opportunity Radar" };
export const revalidate = 300;

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("opportunities").select("*").eq("is_active", true).order("updated_at", { ascending: false });
  const opps = (data || []) as Opportunity[];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Opportunity radar</h1>
        <p className="text-sm text-[var(--text-muted)]">Jobs, learning, government and startup programs from legitimate public sources. Deadlines are never invented — always verify on the official link.</p>
      </div>
      {opps.length === 0 ? (
        <div className="card p-8 text-center text-[var(--text-muted)]">Opportunities will appear after the next refresh.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {opps.map((o) => (
            <a key={o.id} href={o.official_url} target="_blank" rel="noopener noreferrer" className="card p-4 block hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]">
              <span className="chip mb-2 capitalize">{o.category}</span>
              <h2 className="font-semibold mb-1">{o.title}</h2>
              <p className="text-xs text-[var(--text-muted)] mb-2">{o.organization}{o.location ? ` · ${o.location}` : ""}</p>
              {o.summary && <p className="text-sm text-[var(--text-muted)] line-clamp-3">{o.summary}</p>}
              <p className="text-xs text-[var(--accent)] mt-3 font-medium">Official link →</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
