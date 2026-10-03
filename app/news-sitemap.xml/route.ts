import { getRecentForNews } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** Sitemap per Google News: solo articoli delle ultime 48 ore. */
export async function GET() {
  const [items, s] = await Promise.all([getRecentForNews(), getSettings()]);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${items
    .map((a) => `<url><loc>${SITE_URL}/${a.slug}</loc><news:news><news:publication><news:name>${esc(s.site_title)}</news:name><news:language>it</news:language></news:publication><news:publication_date>${new Date(a.published_at).toISOString()}</news:publication_date><news:title>${esc(a.title)}</news:title></news:news></url>`)
    .join("")}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
