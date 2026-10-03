import { hasSupabase, supabasePublic } from "@/lib/supabase";

export async function POST(req: Request) {
  const sub = await req.json().catch(() => null);
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth || !String(sub.endpoint).startsWith("https://")) {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (hasSupabase) {
    await supabasePublic().from("push_subscriptions").insert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  }
  return Response.json({ ok: true });
}
