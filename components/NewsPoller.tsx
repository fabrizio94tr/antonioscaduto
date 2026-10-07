"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Ogni minuto controlla se sono uscite nuove notizie e mostra la pillola "↑ N nuove notizie". */
export default function NewsPoller({ since }: { since: string }) {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let stop = false;
    const check = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch(`/api/latest?since=${encodeURIComponent(since)}`);
        const j = await r.json();
        if (!stop) setCount(j.count ?? 0);
      } catch { /* offline: riproveremo */ }
    };
    const id = setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => { stop = true; clearInterval(id); document.removeEventListener("visibilitychange", check); };
  }, [since]);

  return (
    <button
      className={`fresh-pill ${count > 0 ? "show" : ""}`} aria-live="polite" tabIndex={count ? 0 : -1}
      onClick={() => { setCount(0); window.scrollTo({ top: 0, behavior: "smooth" }); router.refresh(); }}
    >
      ↑ {count} {count === 1 ? "nuova notizia" : "nuove notizie"}
    </button>
  );
}
