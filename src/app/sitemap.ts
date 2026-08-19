import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dayly-nu.vercel.app";
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, changeFrequency: "hourly", priority: 1 },
    { url: `${site}/trending`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site}/debate`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${site}/opportunities`, changeFrequency: "daily", priority: 0.7 },
    { url: `${site}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("topics").select("slug,updated_at").eq("is_live", true).order("trend_score", { ascending: false }).limit(200);
    const topics = (data || []).map((t) => ({
      url: `${site}/topic/${t.slug}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    }));
    return [...staticRoutes, ...topics];
  } catch {
    return staticRoutes;
  }
}
