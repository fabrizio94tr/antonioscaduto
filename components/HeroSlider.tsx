"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import ReliabilityBadge from "./Reliability";
import type { Reliability } from "@/lib/types";

export type HeroSlide = { slug: string; title: string; image: string | null; cat: string; name: string; when: string; reliability?: Reliability | null };

const DUR = 7000;

/** Hero a rotazione stile "storie": barre di avanzamento, pausa al passaggio del mouse, niente autoplay con "riduci movimento". */
export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => { reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);

  useEffect(() => {
    if (paused || reduced.current || slides.length < 2) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), DUR);
    return () => clearTimeout(t);
  }, [i, paused, slides.length]);

  return (
    <section
      className={`hero ${paused ? "paused" : ""}`} aria-roledescription="carosello" aria-label="Notizie principali"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      <div className="hero-slides">
        {slides.map((s, n) => (
          <Link key={s.slug} href={`/${s.slug}`} className={`hero-slide ${n === i ? "on" : ""}`} aria-hidden={n !== i} tabIndex={n === i ? 0 : -1}>
            <div className="hero-img">
              {s.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={s.image} alt="" loading={n === 0 ? "eager" : "lazy"} decoding="async" {...(n === 0 ? { fetchPriority: "high" as const } : {})} />
                : <div className="ph" />}
            </div>
            <div className="hero-cap">
              {s.name && <div className="hero-name">{s.name}</div>}
              <span className="hero-cat">{s.cat}</span> <ReliabilityBadge value={s.reliability} />
              <h2 className="hero-title">{s.title}</h2>
              <div className="hero-meta">{s.when}</div>
            </div>
          </Link>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="hero-bars" style={{ ["--dur" as string]: `${DUR}ms` }}>
          {slides.map((s, n) => (
            <button key={s.slug} className={`hero-bar ${n === i ? "on" : n < i ? "done" : ""}`} aria-label={`Vai alla notizia ${n + 1}: ${s.title}`} onClick={() => setI(n)}>
              <i />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
