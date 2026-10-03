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
