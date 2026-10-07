"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button onClick={toggle} className="icon-btn" aria-label={dark ? "Passa al tema chiaro" : "Passa alla modalità notte"} title={dark ? "Giorno" : "Notte"}>
      {dark ? "☀" : "☾"}
    </button>
  );
}
