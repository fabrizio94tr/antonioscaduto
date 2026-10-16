"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavItem } from "./NavLinks";

/** Tre linee a destra dell'intestazione: apre il menu a tutto schermo con ricerca e categorie (stile "Pulita"). */
export default function CleanMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); document.documentElement.classList.remove("menu-open"); };
  }, [open]);
  return (
    <>
      <button className={`clean-burger only-clean${open ? " active" : ""}`} onClick={() => setOpen(!open)} aria-label={open ? "Chiudi menu" : "Apri menu"} aria-expanded={open}>
        <svg width="26" height="14" viewBox="0 0 26 14" fill="none" aria-hidden>
          <path d="M1 1H25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1 7H25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1 13H25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="clean-menu only-clean" role="dialog" aria-label="Menu">
          <form action="/cerca" className="clean-search" onSubmit={() => setOpen(false)}>
            <input type="search" name="q" placeholder="Cerca" aria-label="Cerca" autoFocus />
            <button aria-label="Cerca">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden><path d="M0 13q0-2.6 1-5t2.800-4.200 4.200-2.800 5-1 5 1 4.200 2.800 2.800 4.200 1 5q0 3.600-2 6.800l7 7q.9.9.9 2.100t-.9 2.100-2.100.9-2.100-.9l-7-7q-3.200 2-6.800 2-2.600 0-5-1t-4.200-2.800-2.800-4.100-1-5.100zM4 13q0 2.500 1.200 4.500t3.300 3.300 4.500 1.200q1.800 0 3.500-.7t2.900-1.900 1.900-2.900.7-3.500-.7-3.500-1.900-2.800-2.900-1.900-3.500-.7q-2.400 0-4.500 1.200t-3.300 3.300-1.200 4.500z" /></svg>
            </button>
          </form>
          <ul>
            <li><Link href="/" onClick={() => setOpen(false)}>Home</Link></li>
            {items.map((i) => <li key={i.href}><Link href={i.href} onClick={() => setOpen(false)}>{i.label}</Link></li>)}
          </ul>
        </div>
      )}
    </>
  );
}
