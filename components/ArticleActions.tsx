"use client";

import { useEffect, useState } from "react";

/** Barra sotto il titolo come alfredopedulla.com: "Condividi" a sinistra, cuore (mi piace) e commenti a destra. */
export default function ArticleActions({ slug, title, url, likes, comments }: { slug: string; title: string; url: string; likes: number; comments: number }) {
  const key = `like:${slug}`;
  const [count, setCount] = useState(likes);
  const [liked, setLiked] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    try { setLiked(localStorage.getItem(key) === "1"); } catch { /* memoria del browser non disponibile */ }
  }, [key]);

  const like = async () => {
    const delta = liked ? -1 : 1;
    setLiked(!liked);
    setCount((c) => Math.max(0, c + delta));
    try { localStorage.setItem(key, liked ? "0" : "1"); } catch { /* ignora */ }
    try {
      const r = await fetch("/api/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, delta }) });
      const j = await r.json();
      if (typeof j.likes === "number") setCount(j.likes);
    } catch { /* il conteggio si riallinea al prossimo caricamento */ }
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* annullato: niente */ return; }
    }
    setMenu((m) => !m);
  };

  const goComments = () => {
    const box = document.querySelector<HTMLDetailsElement>("#commenti details");
    if (box) box.open = true;
    document.getElementById("commenti")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  return (
    <div className="art-actions">
      <div className="aa-share">
        <button type="button" className="aa-btn" onClick={share} aria-expanded={menu}>
          <svg viewBox="0 0 50 50" width="24" height="24" fill="currentColor" aria-hidden><path d="M30.3 13.7 25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z" /><path d="M24 7h2v21h-2z" /><path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z" /></svg>
          Condividi
        </button>
        {menu && (
          <div className="aa-menu">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noopener noreferrer">X</a>
            <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer">Telegram</a>
          </div>
        )}
      </div>
      <div className="aa-pills">
        <button type="button" className={`aa-pill ${liked ? "on" : ""}`} onClick={like} aria-pressed={liked} aria-label={liked ? "Togli mi piace" : "Metti mi piace"}>
          <svg width="17" height="16" viewBox="0 0 17 16" aria-hidden><path d="M15.17 8.13 8.5 14.72 1.84 8.13A4.42 4.42 0 0 1 .5 5a4.3 4.3 0 0 1 1.32-3.09A4.5 4.5 0 0 1 8.5 2.4a4.5 4.5 0 0 1 6.68-.48A4.3 4.3 0 0 1 16.5 5c0 1.17-.47 2.29-1.33 3.13Z" fill={liked ? "#e0245e" : "none"} stroke={liked ? "#e0245e" : "currentColor"} strokeLinecap="round" strokeLinejoin="round" /></svg>
          {count}
        </button>
        <button type="button" className="aa-pill" onClick={goComments} aria-label="Vai ai commenti">
          <svg width="17" height="15" viewBox="0 0 17 15" fill="none" aria-hidden><path d="M.5 14.5l1.14-3.41C-.39 8.09.39 4.21 3.47 2.03 6.55-.16 10.97.02 13.82 2.44c2.85 2.42 3.24 6.34.9 9.17-2.34 2.83-6.68 3.69-10.17 2.01L.5 14.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {comments}
        </button>
      </div>
    </div>
  );
}
