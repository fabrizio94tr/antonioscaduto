import { hasSupabase, supabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!hasSupabase) return Response.json({ ok: true });
  const { slug } = await req.json().catch(() => ({}));
  if (typeof slug !== "string" || !slug) return Response.json({ ok: false }, { status: 400 });
  const sb = await supabaseServer();
  await sb.rpc("increment_views", { p_slug: slug });
  return Response.json({ ok: true });
}
