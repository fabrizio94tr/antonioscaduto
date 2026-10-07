"use client";

import { useEffect, useRef } from "react";

/** Il pallone del logo rotola mentre scorri la pagina. */
export default function LogoBall() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => { raf = 0; ref.current?.style.setProperty("--rot", `${window.scrollY * 0.45}deg`); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <svg ref={ref} className="ball" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.2l3.8 2.8-1.5 4.4h-4.6L8.2 10z" fill="currentColor" />
      <path d="M12 7.2V2M15.8 10l5-1.6M14.3 14.4l3 4M9.7 14.4l-3 4M8.2 10L3.2 8.4" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  );
}
