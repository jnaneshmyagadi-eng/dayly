import { NextRequest, NextResponse } from "next/server";
import { runIngest } from "@/lib/trends/ingest";
import { STATIC_OPPORTUNITIES } from "@/lib/opportunities/seed";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    if (process.env.NODE_ENV === "production" && secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runIngest();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    for (const o of STATIC_OPPORTUNITIES) {
      await supabase.from("opportunities").upsert(
        {
          slug: o.slug,
          title: o.title,
          organization: o.organization,
          location: o.location,
          category: o.category,
          deadline: o.deadline,
          eligibility: o.eligibility,
          summary: o.summary,
          source_name: o.source_name,
          official_url: o.official_url,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      );
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("ingest error", e);
    return NextResponse.json({ ok: false, error: e?.message || "ingest failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
