"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Phase = "idle" | "cover" | "reveal";

/**
 * Transizione tra pagine: cliccando un link interno un "tendone" (diverso per ogni stile) copre lo schermo,
 * si cambia pagina, poi il tendone si ritira. Il pallone attraversa lo schermo.
 * Disattivata con "riduci movimento", per modificatori (Ctrl/⌘/Maiusc), link esterni, admin e stessa pagina.
 */
export default function RouteCurtain() {
  const router = useRouter();
  const path = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const pending = useRef(false);
  const timers = useRef<number[]>([]);

  const set = (p: Phase) => { phaseRef.current = p; setPhase(p); };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const reveal = () => {
    if (!pending.current) return;
    pending.current = false;
    set("reveal");
    later(() => set("idle"), 700);
  };

  // la nuova pagina è pronta: ritira il tendone
  useEffect(() => { if (pending.current && phaseRef.current === "cover") later(reveal, 80); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.hasAttribute("data-no-curtain")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (/^\/(admin|api|anteprima)/.test(url.pathname) || /^\/(admin|anteprima)/.test(location.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // stessa pagina / solo #ancora
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (phaseRef.current !== "idle") { e.preventDefault(); return; }
      e.preventDefault();
      e.stopPropagation();
      pending.current = true;
      set("cover");
      later(() => {
        const samePath = url.pathname === location.pathname;
        router.push(url.pathname + url.search + url.hash);
        later(reveal, samePath ? 500 : 3500); // rete di sicurezza se la pagina tarda
      }, 430);
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); timers.current.forEach(clearTimeout); };
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`curtain ${phase}`} aria-hidden="true">
      {Array.from({ length: 7 }, (_, k) => <i key={k} style={{ ["--k" as string]: k }} />)}
      <b className="curtain-word">Antonio Scaduto</b>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="curtain-ball" src="/ball.svg" alt="" />
    </div>
  );
}
