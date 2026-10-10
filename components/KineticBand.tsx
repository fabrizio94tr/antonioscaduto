"use client";

import { useEffect, useRef } from "react";

/** Banda di testo gigante (solo stile Volt): scorre da sola e accelera / inverte la direzione con lo scroll. */
export default function KineticBand({ word }: { word: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, vel = 0, last = window.scrollY, raf = 0, visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); });
    io.observe(el);
    function tick() {
      raf = 0;
      if (!visible) return;
      const root = document.documentElement;
      if (root.dataset.style === "bold" && el) {
        const dy = window.scrollY - last;
        last = window.scrollY;
        vel = vel * 0.92 + dy * 0.3;
        const half = el.scrollWidth / 2;
        if (half > 0) {
          x = (x + 0.8 + vel) % half;
          if (x < 0) x += half;
          el.style.transform = `translate3d(${-x}px, 0, 0)`;
        }
      } else last = window.scrollY;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const text = word.repeat(4);
  return (
    <div className="kinetic only-bold" aria-hidden="true">
      <div className="kinetic-track" ref={track}><span>{text}</span><span>{text}</span></div>
    </div>
  );
}
