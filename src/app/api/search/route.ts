import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
  if (!q) {
    return NextResponse.json({ topics: [], polls: [], opportunities: [] });
  }
  try {
    const supabase = await createClient();
    const [topics, polls, opportunities] = await Promise.all([
      supabase
        .from("topics")
        .select("id,slug,title,category,summary,trend_score,updated_at,source_count")
        .or(`title.ilike.%${q}%,summary.ilike.%${q}%,category.ilike.%${q}%`)
        .order("trend_score", { ascending: false })
        .limit(15),
      supabase
        .from("omigy_polls")
        .select("id,question,option_a,option_b,vote_count_a,vote_count_b,topic_id")
        .ilike("question", `%${q}%`)
        .eq("is_active", true)
        .limit(8),
      supabase
        .from("opportunities")
        .select("id,slug,title,organization,category,official_url,summary")
        .or(`title.ilike.%${q}%,summary.ilike.%${q}%,category.ilike.%${q}%`)
        .eq("is_active", true)
        .limit(8),
    ]);
    return NextResponse.json({
      topics: topics.data || [],
      polls: polls.data || [],
      opportunities: opportunities.data || [],
    });
  } catch (e: any) {
    return NextResponse.json({ topics: [], polls: [], opportunities: [], error: e?.message });
  }
}
