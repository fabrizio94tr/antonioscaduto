"use client";

import { useEffect } from "react";

/** Il pannello admin ha sempre lo stile classico, qualunque stile abbia scelto il lettore. */
export default function ForceClassic() {
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.dataset.style;
    el.dataset.style = "classic";
    return () => { if (prev) el.dataset.style = prev; };
  }, []);
  return null;
}
