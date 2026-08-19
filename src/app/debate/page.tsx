import { createClient } from "@/lib/supabase/server";
import { PollVote } from "@/components/poll/poll-vote";
import type { OmigyPoll } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Debate" };
export const revalidate = 60;

export default async function DebatePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("omigy_polls").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(20);
  const polls = (data || []) as OmigyPoll[];
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Internet debate</h1>
        <p className="text-sm text-[var(--text-muted)]">Public opinion on trending topics. One vote per signed-in user.</p>
      </div>
      {polls.length === 0 ? (
        <div className="card p-8 text-center text-[var(--text-muted)]">No active debates yet. Polls appear when high-interest topics cluster.</div>
      ) : (
        <div className="space-y-4">{polls.map((p) => <PollVote key={p.id} poll={p} />)}</div>
      )}
    </div>
  );
}
