import { getArticles } from "@/lib/data";

export const revalidate = 300;
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.antonioscaduto.com";
  const items = (await getArticles({ limit: 30 }))
    .map((a) => `<item><title>${esc(a.title)}</title><link>${base}/${a.slug}</link><guid>${base}/${a.slug}</guid><pubDate>${new Date(a.published_at).toUTCString()}</pubDate><description>${esc(a.excerpt ?? "")}</description></item>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Antonio Scaduto</title><link>${base}</link><description>Il calcio a 360 gradi</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
