"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Hit = { slug: string; title: string; cat: string; at: string };

/** Ricerca istantanea: si apre con "/" o Ctrl/⌘+K. Frecce per scegliere, Invio per aprire. */
export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [sel, setSel] = useState(0);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => { setOpen(false); setQ(""); setHits([]); setSel(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "") || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") close();
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-search", onOpen); };
  }, [close]);

  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 30); }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        setHits(await r.json()); setSel(0);
      } catch { /* annullata */ } finally { setLoading(false); }
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  if (!open) return null;

  const go = (h?: Hit) => { close(); router.push(h ? `/${h.slug}` : `/cerca?q=${encodeURIComponent(q.trim())}`); };

  return (
    <div className="sx" role="dialog" aria-modal="true" aria-label="Cerca" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="sx-box">
        <input
          ref={input} className="sx-input" value={q} placeholder="Cerca giocatori, squadre, notizie…" aria-label="Cerca"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, hits.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
            if (e.key === "Enter") { e.preventDefault(); go(hits[sel]); }
          }}
        />
        <div className="sx-list" role="listbox">
          {hits.map((h, i) => (
            <a key={h.slug} href={`/${h.slug}`} role="option" aria-selected={i === sel} className="sx-item"
               onClick={(e) => { e.preventDefault(); go(h); }} onMouseEnter={() => setSel(i)}>
              <small>{h.cat}</small>{h.title}
            </a>
          ))}
          {q.trim().length >= 2 && !loading && !hits.length && <div className="sx-item">Nessun risultato per “{q}”. Premi Invio per cercare ovunque.</div>}
        </div>
        <div className="sx-foot"><span>↑↓ scegli · ↵ apri · esc chiudi</span><span>{q.trim().length >= 2 ? "↵ senza selezione = tutti i risultati" : "scrivi almeno 2 lettere"}</span></div>
      </div>
    </div>
  );
}
