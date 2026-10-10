"use client";

import { useEffect } from "react";

/** Aggiunge la classe "scrolled" a <html> dopo 80px di scroll (usata dal mini-logo nella barra fissa). */
export default function ScrollState() {
  useEffect(() => {
    const el = document.documentElement;
    let raf = 0;
    const upd = () => { raf = 0; el.classList.toggle("scrolled", window.scrollY > 80); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); el.classList.remove("scrolled"); };
  }, []);
  return null;
}
