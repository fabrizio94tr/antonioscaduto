"use client";

export default function SearchTrigger() {
  return (
    <button className="search-trigger" onClick={() => window.dispatchEvent(new Event("open-search"))} aria-label="Cerca">
      <span aria-hidden>⌕</span> Cerca <kbd>/</kbd>
    </button>
  );
}
