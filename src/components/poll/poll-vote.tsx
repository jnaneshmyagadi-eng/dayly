"use client";

import { useState } from "react";
import type { OmigyPoll } from "@/types";
import { useRouter } from "next/navigation";

export function PollVote({ poll }: { poll: OmigyPoll }) {
  const [a, setA] = useState(poll.vote_count_a);
  const [b, setB] = useState(poll.vote_count_b);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const total = a + b || 1;
  const pctA = Math.round((a / total) * 100);

  async function vote(choice: "a" | "b") {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, choice }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Could not vote");
        if (res.status === 401) router.push("/login");
        return;
      }
      setA(data.vote_count_a);
      setB(data.vote_count_b);
      setMsg("Vote recorded. Share what people think.");
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="font-semibold">{poll.question}</p>
      <button type="button" disabled={busy} onClick={() => vote("a")} className="btn btn-ghost w-full justify-between">
        <span>{poll.option_a}</span>
        <span className="text-[var(--text-muted)]">{pctA}%</span>
      </button>
      <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full bg-[var(--accent)]" style={{ width: `${pctA}%` }} />
      </div>
      <button type="button" disabled={busy} onClick={() => vote("b")} className="btn btn-ghost w-full justify-between">
        <span>{poll.option_b}</span>
        <span className="text-[var(--text-muted)]">{100 - pctA}%</span>
      </button>
      <p className="text-xs text-[var(--text-muted)]">{a + b} votes · One vote per signed-in user</p>
      {msg && <p className="text-xs text-[var(--accent-2)]">{msg}</p>}
    </div>
  );
}
