"use client";

export default function CookieButton() {
  return <button className="linklike" onClick={() => window.dispatchEvent(new Event("open-consent"))}>Gestisci cookie</button>;
}
