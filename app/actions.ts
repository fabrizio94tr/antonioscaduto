"use server";

import { redirect } from "next/navigation";
import { hasSupabase, supabaseServer } from "@/lib/supabase";

export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) redirect("/iscrizione?esito=errore");
  if (hasSupabase) {
    const sb = await supabaseServer();
    await sb.from("subscribers").insert({ email }); // duplicato = già iscritto, ok
  }
  redirect("/iscrizione?esito=ok");
}

export async function addComment(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const back = (q: string) => redirect(`/${slug}?commento=${q}#commenti`);
  if (String(formData.get("website") ?? "")) back("ok"); // honeypot: i bot lo compilano, fingiamo successo
  const author = String(formData.get("author") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (author.length < 2 || body.length < 3 || body.length > 1500 || /https?:\/\//i.test(body)) back("errore");
  if (hasSupabase) {
    const sb = await supabaseServer();
    const { data: art } = await sb.from("articles").select("id").eq("slug", slug).maybeSingle();
    if (art) await sb.from("comments").insert({ article_id: art.id, author: author.slice(0, 60), body });
  }
  back("ok");
}

export async function unsubscribeAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (hasSupabase && /^[0-9a-f-]{36}$/i.test(token)) {
    const sb = await supabaseServer();
    await sb.rpc("unsubscribe", { p_token: token });
  }
  redirect("/disiscrizione?esito=ok");
}
