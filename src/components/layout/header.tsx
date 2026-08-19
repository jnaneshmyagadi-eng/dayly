"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_90%,transparent)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] grid place-items-center font-black text-white text-sm">
            O
          </div>
          <div className="hidden sm:block">
            <div className="font-bold tracking-tight leading-none">OMIGY</div>
            <div className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">
              Know what matters
            </div>
          </div>
        </Link>

        <form
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask OMIGY what's happening..."
              className="w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        </form>

        <Link href="/login" className="btn btn-ghost hidden sm:inline-flex text-xs">
          Sign in
        </Link>
      </div>
    </header>
  );
}
