"use client";

import { useEffect, useRef } from "react";

export default function AdUnit({ client, slot }: { client: string; slot: string }) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    const push = () => {
      if (!window.__consent?.marketing || !ref.current || ref.current.dataset.done) return;
      ref.current.dataset.done = "1";
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
    };
    push();
    window.addEventListener("consent-change", push);
    return () => window.removeEventListener("consent-change", push);
  }, []);
  return (
    <div className="ad">
      <small>Pubblicità</small>
      <ins ref={ref} className="adsbygoogle" style={{ display: "block" }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
