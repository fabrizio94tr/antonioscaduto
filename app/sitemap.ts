import type { MetadataRoute } from "next";
import { getCategories, getHotTags, getSlugChunk } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";
import { hasSupabase, supabasePublic } from "@/lib/supabase";

export const revalidate = 3600;

export async function generateSitemaps() {
  let n = 1;
  if (hasSupabase) {
    const sb = supabasePublic();
    const { count } = await sb.from("articles").select("id", { count: "exact", head: true }).eq("published", true);
    n = Math.max(1, Math.ceil((count ?? 0) / 1000));
  }
  // id 0 = pagine e categorie, poi un file ogni 1000 articoli
  return Array.from({ length: n + 1 }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  if (Number(id) === 0) {
    const [cats, tags] = await Promise.all([getCategories(), getHotTags(300)]);
    return [
      { url: SITE_URL }, { url: `${SITE_URL}/mercato` },
      ...cats.map((c) => ({ url: `${SITE_URL}/category/${c.slug}` })),
      ...tags.filter((t) => t.n >= 3).map((t) => ({ url: `${SITE_URL}/tag/${t.slug}` })),
    ];
  }
  const rows = await getSlugChunk(Number(id) - 1);
  return rows.map((r) => ({ url: `${SITE_URL}/${r.slug}`, lastModified: r.updated_at ?? r.published_at }));
}
