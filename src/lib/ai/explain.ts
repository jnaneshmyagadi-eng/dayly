import type { Cluster } from "@/lib/trends/cluster";

export interface Explanation {
  what_happened: string;
  why_trending: string;
  why_matters: string;
  what_people_saying: string;
  what_next: string;
  explain_30s: string;
  summary: string;
}

export function explainFromCluster(cluster: Cluster): Explanation {
  const sources = [...new Set(cluster.items.map((i) => i.source))];
  const sourceList = sources.slice(0, 5).join(", ");
  const count = cluster.items.length;
  const top = cluster.items[0];
  const ageH = Math.max(0, (Date.now() - new Date(top.published_at).getTime()) / 3600000);
  const freshness =
    ageH < 2 ? "in the last few hours" : ageH < 12 ? "today" : ageH < 36 ? "over the past day" : "recently";

  const what_happened = `Reports indicate: ${top.title}. ${
    top.summary ? top.summary.replace(/\s+/g, " ").slice(0, 220) : "Details are emerging from multiple outlets."
  }`;

  const why_trending =
    count > 1
      ? `This topic is trending because ${count} sources (${sourceList}) are covering related developments ${freshness}. Cross-source attention increases confidence that the story is material.`
      : `This topic is surfacing from ${top.source} ${freshness}. Single-source items are shown when the signal is timely and relevant.`;

  const why_matters = categoryImpact(cluster.category);

  const what_people_saying =
    count > 2
      ? `Coverage spans ${sources.length} outlets including ${sourceList}. Viewpoints may differ; OMIGY surfaces the cluster so you can compare sources.`
      : `Early coverage is limited. Check the linked sources for primary reporting.`;

  const what_next =
    "Next developments depend on primary reporting. OMIGY will update this topic as new verified signals arrive. Predictions are not stated as facts.";

  const explain_30s = [
    `WHAT: ${top.title}`,
    `WHY: ${count > 1 ? `${count} sources covering it ${freshness}` : `Reported by ${top.source} ${freshness}`}`,
    `WHY IT MATTERS: ${why_matters.slice(0, 120)}`,
    `WHAT NEXT: Follow linked sources for updates.`,
  ].join("\n");

  const summary = `${top.title}. ${count} source${count === 1 ? "" : "s"} · Updated ${freshness}.`;

  return { what_happened, why_trending, why_matters, what_people_saying, what_next, explain_30s, summary };
}

function categoryImpact(category: string): string {
  switch (category) {
    case "ai":
    case "technology":
      return "Technology and AI developments can shift products, jobs, regulation, and competitive dynamics quickly.";
    case "india":
      return "India-related developments often affect policy, markets, and daily life for a large population.";
    case "business":
      return "Business and market moves can influence investments, employment, and consumer conditions.";
    case "science":
      return "Scientific findings often require peer context. Early reports may overstate conclusions.";
    case "sports":
      return "Sports outcomes drive fan engagement and sometimes broader cultural conversation.";
    default:
      return `This story is relevant within the ${category} category. Use linked sources to verify claims.`;
  }
}

export async function enrichExplanation(base: Explanation, cluster: Cluster): Promise<Explanation> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return base;
  try {
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are OMIGY. Explain news clusters using ONLY provided source titles/summaries. Never invent facts. Respond in JSON with keys: what_happened, why_trending, why_matters, what_people_saying, what_next, explain_30s, summary.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: cluster.title,
              sources: cluster.items.slice(0, 8).map((i) => ({ source: i.source, title: i.title, summary: i.summary })),
            }),
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(t);
    if (!res.ok) return base;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return base;
    const parsed = JSON.parse(text);
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}
