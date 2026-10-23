"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";

const LINK = /(https?:\/\/|www\.)/i;

/** Modulo commenti: serve l'accesso. Il lettore inserisce l'email, riceve un link (inviato via Resend) e torna qui già autenticato. */
export default function CommentBox({ articleId, slug }: { articleId: string; slug: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getUser().then(({ data }) => { setUser(data.user ?? null); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    if (new URLSearchParams(location.search).get("accesso") === "errore") setMsg({ ok: false, t: "Il link non è valido o è scaduto: richiedine uno nuovo." });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !name) setName(String(user.user_metadata?.name ?? "") || (user.email ?? "").split("@")[0].slice(0, 40));
  }, [user, name]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const addr = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) return setMsg({ ok: false, t: "Inserisci un indirizzo email valido." });
    setBusy(true); setMsg(null);
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: addr,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(`/${slug}#commenti`)}` },
    });
    setBusy(false);
    if (error) return setMsg({ ok: false, t: error.status === 429 ? "Troppe richieste: riprova tra qualche minuto." : "Non sono riuscito a inviare l'email. Riprova." });
    setSentTo(addr);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (trap) return setMsg({ ok: true, t: "Grazie! Il commento comparirà dopo la moderazione." });
    const author = name.trim(), text = body.trim();
    if (author.length < 2 || text.length < 3 || text.length > 1500) return setMsg({ ok: false, t: "Servono un nome e un commento (almeno 3 caratteri)." });
    if (LINK.test(text)) return setMsg({ ok: false, t: "I link non sono ammessi nei commenti." });
    if (!user) return;
    setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    const { error } = await sb.from("comments").insert({ article_id: articleId, author: author.slice(0, 60), body: text, user_id: user.id });
    setBusy(false);
    if (error) return setMsg({ ok: false, t: /row-level security|violates/i.test(error.message) ? "Hai inviato troppi commenti in poco tempo: riprova più tardi." : "Commento non inviato. Riprova." });
    if (author !== user.user_metadata?.name) sb.auth.updateUser({ data: { name: author } });
    setBody("");
    setMsg({ ok: true, t: "Grazie! Il commento comparirà dopo la moderazione." });
  }

  if (!ready) return <p className="cb-note">Caricamento…</p>;

  if (!user) {
    return (
      <div className="reader-box">
        <h3>Accedi per commentare</h3>
        {sentTo ? (
          <p className="notice ok">Ti abbiamo scritto a <b>{sentTo}</b>: apri il link nell&apos;email per accedere e tornare a questa pagina.</p>
        ) : (
          <form onSubmit={login} className="comment-form">
            <p className="cb-note">Inserisci la tua email: ti inviamo un link per accedere, senza password.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="La tua email" autoComplete="email" required />
            <button className="btn" disabled={busy}>{busy ? "Invio…" : "Accedi"}</button>
            <p className="cb-note">Continuando dichiari di aver letto l&apos;<a href="/privacy-policy">informativa privacy</a> e le <a href="/note-legali">note legali</a> sui commenti.</p>
          </form>
        )}
        {msg && <p className={`notice${msg.ok ? " ok" : ""}`}>{msg.t}</p>}
      </div>
    );
  }

  return (
    <div className="reader-box">
      <p className="cb-note">Accesso come <b>{user.email}</b> · <button type="button" className="linklike" onClick={() => supabaseBrowser().auth.signOut()}>Esci</button></p>
      <form onSubmit={send} className="comment-form">
        <input type="text" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="hp" name="website" />
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Il tuo nome" required minLength={2} maxLength={60} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Scrivi un commento (niente link)…" rows={4} required minLength={3} maxLength={1500} />
        <button className="btn" disabled={busy}>{busy ? "Invio…" : "Invia commento"}</button>
      </form>
      {msg && <p className={`notice${msg.ok ? " ok" : ""}`}>{msg.t}</p>}
    </div>
  );
}
