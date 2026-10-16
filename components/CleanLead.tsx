"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type LeadSlide = { slug: string; title: string; image: string | null; cat: string };

/** Apertura a schede scorrevoli (swipe/scroll con aggancio) con puntini: stile "Pulita". */
export default function CleanLead({ slides }: { slides: LeadSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const paused = useRef(false);

  const go = useCallback((i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, []);

  const onScroll = () => {
    const el = track.current;
    if (el) setCur(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (paused.current || document.hidden) return;
      const el = track.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  return (
    <div className="clean-lead" onPointerDown={() => (paused.current = true)} onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
      <div className="cl-track" ref={track} onScroll={onScroll}>
        {slides.map((s, i) => (
          <Link key={s.slug} href={`/${s.slug}`} className="cl-slide" aria-label={s.title}>
            {s.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" {...(i === 0 ? { fetchPriority: "high" as const } : {})} />
            ) : <span className="ph" aria-hidden />}
            <span className="cl-cap">
              <em>{s.cat}</em>
              <strong>{s.title}</strong>
            </span>
          </Link>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="cl-dots" role="tablist" aria-label="Notizie in evidenza">
          {slides.map((s, i) => <button key={s.slug} role="tab" aria-selected={i === cur} aria-label={`Notizia ${i + 1}`} className={i === cur ? "on" : ""} onClick={() => go(i)} />)}
        </div>
      )}
    </div>
  );
}
