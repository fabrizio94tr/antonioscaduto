import type { MetadataRoute } from "next";
import { getArticles, getCategories } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.antonioscaduto.com";
  const [arts, cats] = await Promise.all([getArticles({ limit: 500 }), getCategories()]);
  return [
    { url: base },
    ...cats.map((c) => ({ url: `${base}/categoria/${c.slug}` })),
    ...arts.map((a) => ({ url: `${base}/articolo/${a.slug}`, lastModified: a.published_at })),
  ];
}
