import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { ShareButtons } from "@/components/topic/share-buttons";
import { Explain30 } from "@/components/topic/explain-30";
import { PollVote } from "@/components/poll/poll-vote";
import type { Topic, TopicSource, OmigyPoll } from "@/types";

export const revalidate = 120;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("topics").select("title,summary").eq("slug", slug).maybeSingle();
  if (!data) return { title: "Topic" };
  return { title: data.title, description: data.summary || data.title, openGraph: { title: data.title, description: data.summary || undefined } };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: topic } = await supabase.from("topics").select("*").eq("slug", slug).maybeSingle();
  if (!topic) notFound();
  const t = topic as Topic;
  const [{ data: sources }, { data: poll }] = await Promise.all([
    supabase.from("topic_sources").select("*").eq("topic_id", t.id).order("published_at", { ascending: false }),
    supabase.from("omigy_polls").select("*").eq("topic_id", t.id).eq("is_active", true).maybeSingle(),
  ]);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dayly-nu.vercel.app";
  return (
    <article className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="chip">{t.category}</span>
          <span className="text-xs text-[var(--text-muted)]">Updated {timeAgo(t.updated_at)} · {t.source_count} sources · score {Math.round(Number(t.trend_score))}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{t.title}</h1>
        {t.summary && <p className="text-[var(--text-muted)]">{t.summary}</p>}
      </div>
      <ShareButtons title={t.title} url={`${site}/topic/${t.slug}`} />
      <Explain30 text={t.explain_30s} />
      <section className="space-y-4">
        {t.what_happened && <div className="card p-4"><h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent)] mb-2">What happened?</h2><p className="text-sm leading-relaxed">{t.what_happened}</p></div>}
        {t.why_trending && <div className="card p-4"><h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent)] mb-2">Why is it trending?</h2><p className="text-sm leading-relaxed">{t.why_trending}</p></div>}
        {t.why_matters && <div className="card p-4"><h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent)] mb-2">Why does it matter?</h2><p className="text-sm leading-relaxed">{t.why_matters}</p></div>}
        {t.what_people_saying && <div className="card p-4"><h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent)] mb-2">What are people saying?</h2><p className="text-sm leading-relaxed">{t.what_people_saying}</p></div>}
        {t.what_next && <div className="card p-4"><h2 className="text-sm font-bold uppercase tracking-wide text-[var(--accent)] mb-2">What happens next?</h2><p className="text-sm leading-relaxed">{t.what_next}</p></div>}
      </section>
      {(sources as TopicSource[] | null)?.length ? (
        <section className="card p-4">
          <h2 className="font-bold mb-3">Sources</h2>
          <ul className="space-y-3">
            {(sources as TopicSource[]).map((s) => (
              <li key={s.id} className="text-sm">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[var(--accent)]">{s.title}</a>
                <div className="text-xs text-[var(--text-muted)]">{s.source_name}{s.published_at ? ` · ${timeAgo(s.published_at)}` : ""}</div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {poll && (<section><h2 className="font-bold mb-3">What do you think?</h2><PollVote poll={poll as OmigyPoll} /></section>)}
      <p className="text-xs text-[var(--text-muted)]">OMIGY distinguishes reported information from confirmed facts. Always verify via linked sources.</p>
      <Link href="/" className="text-sm text-[var(--accent)] font-medium">← Back to what&apos;s happening</Link>
    </article>
  );
}
