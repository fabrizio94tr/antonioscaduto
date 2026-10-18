import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

/** Link ricevuto per email dal lettore: scambia il codice con la sessione e riporta all'articolo. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  // solo percorsi interni (niente reindirizzamenti verso altri siti)
  const safe = next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/";
  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL(`${safe.split("#")[0]}?accesso=errore#commenti`, url.origin));
  }
  return NextResponse.redirect(new URL(safe, url.origin));
}
