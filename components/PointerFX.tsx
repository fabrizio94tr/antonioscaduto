"use client";

import { useEffect } from "react";

/**
 * Effetti legati al puntatore (solo mouse, non touch):
 *  - tutti gli stili: un riflettore segue il mouse sulle schede (--mx/--my)
 *  - Volt: inclinazione 3D delle schede, pulsanti "magnetici" e un pallone che insegue il cursore
 */
export default function PointerFX() {
  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;

    const ball = document.createElement("img");
    ball.src = "/ball.svg"; ball.alt = ""; ball.className = "cursor-ball"; ball.setAttribute("aria-hidden", "true");
    document.body.appendChild(ball);

    let tx = -100, ty = -100, x = -100, y = -100, rot = 0, raf = 0;
    const loop = () => {
      raf = 0;
      if (root.dataset.style === "bold") {
        const dx = tx - x, dy = ty - y;
        x += dx * 0.16; y += dy * 0.16; rot += dx * 0.6;
        ball.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0) rotate(${rot}deg)`;
        if (Math.abs(dx) + Math.abs(dy) > 0.3) raf = requestAnimationFrame(loop);
      }
    };

    const reset = (el: HTMLElement) => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };

    const onMove = (e: PointerEvent) => {
      const st = root.dataset.style;
      const t = e.target as HTMLElement | null;
      const card = t?.closest?.(".nl-item, .widget, .edit-strip") as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        const px = e.clientX - r.left, py = e.clientY - r.top;
        card.style.setProperty("--mx", `${px}px`);
        card.style.setProperty("--my", `${py}px`);
        if (st === "bold" && card.classList.contains("nl-item") && !card.closest(".widget")) {
          card.style.setProperty("--ry", `${(px / r.width - 0.5) * 9}deg`);
          card.style.setProperty("--rx", `${-(py / r.height - 0.5) * 7}deg`);
        }
      }
      if (st === "bold") {
        tx = e.clientX; ty = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
        const btn = t?.closest?.(".btn") as HTMLElement | null;
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.style.setProperty("--bx", `${(e.clientX - (r.left + r.width / 2)) * 0.25}px`);
          btn.style.setProperty("--by", `${(e.clientY - (r.top + r.height / 2)) * 0.35}px`);
        }
      }
    };
    const onOut = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const card = t?.closest?.(".nl-item") as HTMLElement | null;
      if (card && !card.contains(e.relatedTarget as Node)) reset(card);
      const btn = t?.closest?.(".btn") as HTMLElement | null;
      if (btn && !btn.contains(e.relatedTarget as Node)) { btn.style.setProperty("--bx", "0px"); btn.style.setProperty("--by", "0px"); }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      if (raf) cancelAnimationFrame(raf);
      ball.remove();
    };
  }, []);
  return null;
}
