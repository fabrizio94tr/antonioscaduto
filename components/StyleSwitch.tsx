"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Style = "classic" | "new";

/**
 * Slider "Classico / Nuovo": permette ai lettori (e al cliente) di confrontare le due versioni grafiche.
 * La scelta resta salvata sul dispositivo. Il cambio usa le View Transitions (cerchio che si allarga dal punto del click).
 * Si può anche aprire il sito direttamente nello stile voluto con ?stile=nuovo o ?stile=classico.
 */
export default function StyleSwitch() {
  const [style, setStyle] = useState<Style>("classic");
  const [hint, setHint] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    setStyle(document.documentElement.dataset.style === "new" ? "new" : "classic");
    try {
      if (!localStorage.getItem("style-hint")) {
        const t1 = setTimeout(() => setHint(true), 1800);
        const t2 = setTimeout(() => setHint(false), 9000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    } catch {}
  }, []);

  const apply = (v: Style) => {
    document.documentElement.dataset.style = v;
    try { localStorage.setItem("style", v); localStorage.setItem("style-hint", "1"); } catch {}
    setStyle(v);
    setHint(false);
  };

  const choose = (v: Style, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (v === style) return;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduced) { apply(v); return; }
    const rect = ref.current?.getBoundingClientRect();
    const x = (e && "clientX" in e && e.clientX) || (rect ? rect.left + rect.width / 2 : innerWidth / 2);
    const y = (e && "clientY" in e && e.clientY) || (rect ? rect.top + rect.height / 2 : innerHeight - 40);
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = doc.startViewTransition(() => apply(v));
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(.65, 0, .25, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); choose("classic", e); }
    if (e.key === "ArrowRight") { e.preventDefault(); choose("new", e); }
  };

  if (path.startsWith("/admin") || path.startsWith("/anteprima")) return null;

  return (
    <div className={`style-switch ${style}`} ref={ref}>
      {hint && <div className="style-hint" role="status">Prova lo stile <b>Nuovo</b> ✨<i /></div>}
      <div className="ss-track" role="radiogroup" aria-label="Stile grafico del sito" onKeyDown={onKey}>
        <span className="ss-thumb" aria-hidden />
        <button role="radio" aria-checked={style === "classic"} tabIndex={style === "classic" ? 0 : -1} onClick={(e) => choose("classic", e)}>Classico</button>
        <button role="radio" aria-checked={style === "new"} tabIndex={style === "new" ? 0 : -1} onClick={(e) => choose("new", e)}>Nuovo</button>
      </div>
    </div>
  );
}
