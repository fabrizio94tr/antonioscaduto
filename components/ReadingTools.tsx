"use client";

import { useEffect, useRef, useState } from "react";

/** Barra di avanzamento, zoom del testo (A−/A+) e ascolto vocale dell'articolo (Web Speech API del browser). */
export default function ReadingTools({ text }: { text: string }) {
  const [size, setSize] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const queue = useRef<string[]>([]);

  useEffect(() => {
    setCanSpeak("speechSynthesis" in window);
    try { const v = parseFloat(localStorage.getItem("fs") ?? "1"); if (v >= 0.85 && v <= 1.4) setSize(v); } catch {}
    const bar = document.documentElement;
    let raf = 0;
    const upd = () => {
      raf = 0;
      const el = document.getElementById("articolo");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height)));
      bar.style.setProperty("--p", String(p));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); window.speechSynthesis?.cancel(); bar.style.removeProperty("--p"); };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--fs", String(size));
    try { localStorage.setItem("fs", String(size)); } catch {}
  }, [size]);

  const speakNext = () => {
    const next = queue.current.shift();
    if (!next) { setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(next);
    u.lang = "it-IT"; u.rate = 1.02;
    u.onend = speakNext;
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) { queue.current = []; synth.cancel(); setSpeaking(false); return; }
    // frasi brevi: alcuni browser interrompono le letture troppo lunghe
    queue.current = (text.match(/[^.!?]+[.!?]+["”»]?\s*|[^.!?]+$/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
    setSpeaking(true);
    speakNext();
  };

  return (
    <>
      <div className="read-progress" aria-hidden />
      <div className="tools-row" role="group" aria-label="Strumenti di lettura">
        <span className="tool-group">
          <button className="tool-btn" onClick={() => setSize((s) => Math.max(0.85, +(s - 0.1).toFixed(2)))} aria-label="Riduci il testo">A−</button>
          <button className="tool-btn" onClick={() => setSize((s) => Math.min(1.4, +(s + 0.1).toFixed(2)))} aria-label="Ingrandisci il testo">A+</button>
        </span>
        {canSpeak && (
          <button className={`tool-btn ${speaking ? "on" : ""}`} onClick={toggle} aria-pressed={speaking}>
            {speaking ? "■ Ferma" : "🔊 Ascolta"}
          </button>
        )}
      </div>
    </>
  );
}
