import { fetchAllSources } from "@/lib/sources/rss";
import { clusterItems } from "@/lib/trends/cluster";
import { explainFromCluster, enrichExplanation } from "@/lib/ai/explain";
import { createClient } from "@supabase/supabase-js";

function getService() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function runIngest() {
  const { items, health } = await fetchAllSources();
  const supabase = getService();

  for (const h of health) {
    await supabase.from("source_health").upsert(
      {
        source_key: h.key,
        source_name: h.name,
        last_success_at: h.ok ? new Date().toISOString() : undefined,
        last_failure_at: h.ok ? undefined : new Date().toISOString(),
        failure_count: h.ok ? 0 : 1,
        avg_response_ms: h.ms,
        status: h.ok ? "healthy" : "degraded",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "source_key" }
    );
  }

  if (items.length === 0) {
    return { topics: 0, items: 0, health };
  }

  const clusters = clusterItems(items).slice(0, 40);

  let saved = 0;
  for (const cluster of clusters) {
    let explanation = explainFromCluster(cluster);
    explanation = await enrichExplanation(explanation, cluster);

    const { data: topic, error } = await supabase
      .from("topics")
      .upsert(
        {
          slug: cluster.slug,
          title: cluster.title,
          category: cluster.category,
          region: cluster.region,
          language: cluster.language,
          summary: explanation.summary,
          what_happened: explanation.what_happened,
          why_trending: explanation.why_trending,
          why_matters: explanation.why_matters,
          what_people_saying: explanation.what_people_saying,
          what_next: explanation.what_next,
          explain_30s: explanation.explain_30s,
          trend_score: Math.round(cluster.score * 10) / 10,
          velocity: cluster.items.length,
          confidence: Math.min(0.95, 0.4 + cluster.items.length * 0.08),
          source_count: cluster.items.length,
          is_live: true,
          published_at: cluster.items[0]?.published_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !topic) continue;
    saved++;

    await supabase.from("topic_sources").delete().eq("topic_id", topic.id);
    const sourceRows = cluster.items.slice(0, 12).map((i) => ({
      topic_id: topic.id,
      source_name: i.source,
      title: i.title,
      url: i.url,
      published_at: i.published_at,
      engagement_signal: i.engagement_signal,
    }));
    if (sourceRows.length) {
      await supabase.from("topic_sources").insert(sourceRows);
    }

    if (cluster.items.length >= 3 && cluster.score > 50) {
      const q = buildPollQuestion(cluster.title, cluster.category);
      if (q) {
        const { data: existing } = await supabase
          .from("omigy_polls")
          .select("id")
          .eq("topic_id", topic.id)
          .maybeSingle();
        if (!existing) {
          await supabase.from("omigy_polls").insert({
            topic_id: topic.id,
            question: q.question,
            option_a: q.a,
            option_b: q.b,
          });
        }
      }
    }
  }

  const dayAgo = new Date(Date.now() - 48 * 3600000).toISOString();
  await supabase
    .from("topics")
    .update({ is_live: false })
    .lt("updated_at", dayAgo)
    .eq("is_live", true);

  return { topics: saved, items: items.length, health };
}

function buildPollQuestion(
  title: string,
  category: string
): { question: string; a: string; b: string } | null {
  if (category === "sports") {
    return {
      question: `Are you following this sports story: "${title.slice(0, 80)}"?`,
      a: "Yes, closely",
      b: "Not really",
    };
  }
  if (category === "ai" || category === "technology") {
    return {
      question: `Does this technology development matter to you?`,
      a: "Yes, important",
      b: "Not for me",
    };
  }
  if (category === "business") {
    return {
      question: `Should people pay attention to this business story?`,
      a: "Yes",
      b: "Overhyped",
    };
  }
  return {
    question: `Is this one of the most important stories right now?`,
    a: "Yes",
    b: "Not really",
  };
}
