import { generateSitemaps } from "../sitemap";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

/** Indice delle sitemap: Google ne legge una per ogni blocco da 1000 articoli. */
export async function GET() {
  const list = await generateSitemaps();
  const xml = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${list
    .map((s) => `<sitemap><loc>${SITE_URL}/sitemap/${s.id}.xml</loc></sitemap>`)
    .join("")}</sitemapindex>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
