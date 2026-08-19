"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else { setMsg("Check your email to confirm, or sign in if confirmation is disabled."); router.push("/login"); }
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto card p-6 mt-8">
      <h1 className="text-xl font-bold mb-1">Create OMIGY account</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Vote, save topics, and personalize Your OMIGY.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
        <input type="password" required minLength={6} placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" />
        <button type="submit" disabled={busy} className="btn btn-primary w-full">{busy ? "Creating…" : "Sign up"}</button>
      </form>
      {msg && <p className="text-sm mt-3">{msg}</p>}
      <p className="text-sm text-[var(--text-muted)] mt-4">Have an account? <Link href="/login" className="text-[var(--accent)]">Sign in</Link></p>
    </div>
  );
}
