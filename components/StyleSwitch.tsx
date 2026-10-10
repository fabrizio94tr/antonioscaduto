"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const STYLES = [
  { id: "classic", label: "Classico" },
  { id: "new", label: "Pagina" },
  { id: "bold", label: "Volt" },
  { id: "cds", label: "Quotidiano" },
] as const;
type Style = (typeof STYLES)[number]["id"];
const IDS: string[] = STYLES.map((s) => s.id);

/**
 * Slider degli stili grafici: permette ai lettori (e al cliente) di confrontare le versioni del sito.
 * La scelta resta salvata sul dispositivo. Il cambio usa le View Transitions (cerchio che si allarga dal punto del click).
 * Link diretti: ?stile=classico | pagina | volt | quotidiano.
 */
export default function StyleSwitch() {
  const [style, setStyle] = useState<Style>("classic");
  const [hint, setHint] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    const cur = document.documentElement.dataset.style ?? "classic";
    setStyle((IDS.includes(cur) ? cur : "classic") as Style);
    try {
      if (!localStorage.getItem("style-hint")) {
        const t1 = setTimeout(() => setHint(true), 1800);
        const t2 = setTimeout(() => setHint(false), 9000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    } catch {}
  }, []);

  if (path.startsWith("/admin") || path.startsWith("/anteprima")) return null;

  const index = Math.max(0, IDS.indexOf(style));

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
    if (e.key === "ArrowLeft") { e.preventDefault(); choose(STYLES[(index + STYLES.length - 1) % STYLES.length].id, e); }
    if (e.key === "ArrowRight") { e.preventDefault(); choose(STYLES[(index + 1) % STYLES.length].id, e); }
  };

  return (
    <div className="style-switch" data-s={style} ref={ref}>
      {hint && <div className="style-hint" role="status">Prova gli altri <b>stili</b> ✨<i /></div>}
      <div className="ss-track" role="radiogroup" aria-label="Stile grafico del sito" onKeyDown={onKey} style={{ ["--n" as string]: STYLES.length, ["--i" as string]: index }}>
        <span className="ss-thumb" aria-hidden />
        {STYLES.map((s) => (
          <button key={s.id} role="radio" aria-checked={style === s.id} tabIndex={style === s.id ? 0 : -1} onClick={(e) => choose(s.id, e)}>{s.label}</button>
        ))}
      </div>
    </div>
  );
}
