import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return new Response("Non autorizzato", { status: 401 });
  const { data } = await sb.from("subscribers").select("email,created_at").order("created_at", { ascending: false });
  const csv = "email,iscritto_il\n" + (data ?? []).map((r) => `${r.email},${r.created_at}`).join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="iscritti.csv"' } });
}
