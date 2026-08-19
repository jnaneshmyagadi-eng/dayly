import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pollId = body.pollId as string;
    const choice = body.choice as "a" | "b";
    if (!pollId || (choice !== "a" && choice !== "b")) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Login required to vote" }, { status: 401 });
    }

    const { error: voteErr } = await supabase.from("omigy_votes").upsert(
      { poll_id: pollId, user_id: user.id, choice },
      { onConflict: "poll_id,user_id" }
    );
    if (voteErr) {
      return NextResponse.json({ error: voteErr.message }, { status: 400 });
    }

    const { data: votes } = await supabase.from("omigy_votes").select("choice").eq("poll_id", pollId);
    const a = (votes || []).filter((v) => v.choice === "a").length;
    const b = (votes || []).filter((v) => v.choice === "b").length;
    await supabase
      .from("omigy_polls")
      .update({ vote_count_a: a, vote_count_b: b })
      .eq("id", pollId);

    return NextResponse.json({ ok: true, vote_count_a: a, vote_count_b: b });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "vote failed" }, { status: 500 });
  }
}
