"use client";

import { useEffect } from "react";

const KEY = "intro-seen";

/** Segna l'intro come vista, la chiude dopo la durata dell'animazione o con "Salta" / tasto Esc. */
export default function IntroControl() {
  const close = () => document.documentElement.classList.remove("intro-on");

  useEffect(() => {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    const t = setTimeout(close, 2900);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, []);

  return <button className="intro-skip" onClick={close} aria-label="Salta l'intro">Salta ›</button>;
}
