import { countNewerThan } from "@/lib/data";

/** Quante notizie sono uscite dopo `since` (ISO): usato dalla pillola "N nuove notizie". */
export async function GET(req: Request) {
  const since = new URL(req.url).searchParams.get("since") ?? "";
  const ok = !Number.isNaN(Date.parse(since));
  const count = ok ? await countNewerThan(new Date(since).toISOString()) : 0;
  return Response.json({ count }, { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } });
}
