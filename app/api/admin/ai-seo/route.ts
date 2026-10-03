import { supabaseServer } from "@/lib/supabase";
import { stripHtml } from "@/lib/text";

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  // Provider: OpenAI se c'è OPENAI_API_KEY (o AI_PROVIDER=openai), altrimenti Anthropic
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const useOpenAI = process.env.AI_PROVIDER === "openai" || (!process.env.AI_PROVIDER && openaiKey && !anthropicKey);
  if (!(useOpenAI ? openaiKey : anthropicKey)) {
    return Response.json({ error: "Assistente AI non configurato (manca OPENAI_API_KEY o ANTHROPIC_API_KEY su Vercel)." }, { status: 503 });
  }

  const { title = "", content = "", category = "" } = await req.json().catch(() => ({}));
  const text = stripHtml(String(content)).slice(0, 6000);
  if (text.length < 80) return Response.json({ error: "Scrivi prima il testo dell'articolo." }, { status: 400 });

  const system = "Sei un SEO editor di un sito di notizie di calcio italiano. Rispondi SOLO con un oggetto JSON valido, senza altro testo.";
  const prompt = `Titolo: ${title}\nCategoria: ${category}\nTesto: ${text}\n\nGenera i campi SEO in italiano:\n{"meta_title": "max 60 caratteri, include la parola chiave, non clickbait", "meta_description": "tra 130 e 158 caratteri, informativa, con la parola chiave", "focus_keyword": "2-4 parole", "tags": ["3-6 tag: squadre, giocatori, allenatori citati, con la maiuscola"]}\nNon inventare fatti che non sono nel testo.`;

  let raw = "";
  if (useOpenAI) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      }),
    });
    if (!r.ok) return Response.json({ error: `Errore OpenAI (${r.status}) — controlla chiave e modello (OPENAI_MODEL).` }, { status: 502 });
    raw = (await r.json()).choices?.[0]?.message?.content ?? "";
  } else {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": anthropicKey!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 600, system, messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) return Response.json({ error: `Errore AI (${r.status})` }, { status: 502 });
    raw = (await r.json()).content?.[0]?.text ?? "";
  }
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
