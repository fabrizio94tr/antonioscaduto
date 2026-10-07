"use client";

import { useEffect, useRef } from "react";
import BallShape from "./BallShape";

/** Pallone del logo. Modalità (Impostazioni → "logo_spin"): "" fermo (default), "spin" rotola con lo scroll, "kick" palleggia all'apertura e al passaggio del mouse. */
export default function LogoBall({ mode = "" }: { mode?: "" | "spin" | "kick" }) {
  const spin = mode === "spin";
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!spin || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => { raf = 0; ref.current?.style.setProperty("--rot", `${window.scrollY * 0.45}deg`); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [spin]);
  return (
<svg ref={ref} className="ball" data-mode={mode || undefined} viewBox="0 0 24 24" aria-hidden="true">
      <BallShape />
    </svg>
  );
}
