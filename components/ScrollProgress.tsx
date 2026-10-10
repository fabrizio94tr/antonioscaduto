"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Sottile barra di avanzamento della pagina (colore dello stile). Nasconde sé stessa negli articoli, che hanno la propria. */
export default function ScrollProgress() {
  const path = usePathname();
  useEffect(() => {
    const el = document.documentElement;
    let raf = 0;
    const upd = () => {
      raf = 0;
      const h = el.scrollHeight - window.innerHeight;
      el.style.setProperty("--sp", String(h > 0 ? Math.min(1, window.scrollY / h) : 0));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [path]);
  if (path.startsWith("/admin") || path.startsWith("/anteprima")) return null;
  return <div className="sp-bar" aria-hidden="true" />;
}
