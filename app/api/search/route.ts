import { searchArticles } from "@/lib/data";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const items = q.trim().length >= 2 ? await searchArticles(q, 7, 1) : [];
  return Response.json(
    items.map((a) => ({ slug: a.slug, title: a.title, cat: a.category?.name ?? "", at: a.published_at })),
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}
