"use client";

import { useState } from "react";

export function Explain30({ text }: { text: string | null }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="card p-4 border-[color-mix(in_oklab,var(--accent)_30%,var(--border))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-primary w-full sm:w-auto"
      >
        {open ? "Hide 30-second explain" : "Explain this in 30 seconds"}
      </button>
      {open && (
        <pre className="mt-4 text-sm whitespace-pre-wrap font-sans leading-relaxed text-[var(--text)]">
          {text}
        </pre>
      )}
    </div>
  );
}
