import { supabaseServer } from "@/lib/supabase";
import { stripHtml } from "@/lib/text";

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Assistente AI non configurato (manca ANTHROPIC_API_KEY su Vercel)." }, { status: 503 });

  const { title = "", content = "", category = "" } = await req.json().catch(() => ({}));
  const text = stripHtml(String(content)).slice(0, 6000);
  if (text.length < 80) return Response.json({ error: "Scrivi prima il testo dell'articolo." }, { status: 400 });

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: "Sei un SEO editor di un sito di notizie di calcio italiano. Rispondi SOLO con un oggetto JSON valido, senza altro testo.",
      messages: [{
        role: "user",
        content: `Titolo: ${title}\nCategoria: ${category}\nTesto: ${text}\n\nGenera i campi SEO in italiano:\n{"meta_title": "max 60 caratteri, include la parola chiave, non clickbait", "meta_description": "tra 130 e 158 caratteri, informativa, con la parola chiave", "focus_keyword": "2-4 parole", "tags": ["3-6 tag: squadre, giocatori, allenatori citati, con la maiuscola"]}\nNon inventare fatti che non sono nel testo.`,
      }],
    }),
  });
  if (!r.ok) return Response.json({ error: `Errore AI (${r.status})` }, { status: 502 });
  const j = await r.json();
  const raw: string = j.content?.[0]?.text ?? "";
  try {
    const out = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    return Response.json({
      meta_title: String(out.meta_title ?? "").slice(0, 70),
      meta_description: String(out.meta_description ?? "").slice(0, 170),
      focus_keyword: String(out.focus_keyword ?? ""),
      tags: Array.isArray(out.tags) ? out.tags.map(String).slice(0, 8) : [],
    });
  } catch {
    return Response.json({ error: "Risposta AI non valida, riprova." }, { status: 502 });
  }
}
