"use client";

import { useState } from "react";

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${title} — via OMIGY`;
  const wa = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-xs">
        WhatsApp
      </a>
      <a href={x} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-xs">
        X
      </a>
      <button type="button" onClick={copy} className="btn btn-ghost text-xs">
        {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={nativeShare} className="btn btn-primary text-xs">
        Share
      </button>
    </div>
  );
}
