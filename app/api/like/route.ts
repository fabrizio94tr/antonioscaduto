import { hasSupabase, supabasePublic } from "@/lib/supabase";

/** Mi piace sugli articoli: +1 / -1, il conteggio lo tiene il database. */
export async function POST(req: Request) {
  if (!hasSupabase) return Response.json({ likes: null });
  const { slug, delta } = await req.json().catch(() => ({}));
  if (typeof slug !== "string" || !slug || slug.length > 200 || (delta !== 1 && delta !== -1)) return Response.json({ error: "Richiesta non valida" }, { status: 400 });
  const { data, error } = await supabasePublic().rpc("like_article", { p_slug: slug, p_delta: delta });
  if (error) return Response.json({ likes: null }, { status: 500 });
  return Response.json({ likes: typeof data === "number" ? data : null });
}
