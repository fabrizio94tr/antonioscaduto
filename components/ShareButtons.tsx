"use client";

import { useState } from "react";

export default function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => new URL(path, window.location.origin).toString();
  const open = (base: string) => window.open(base + encodeURIComponent(url()), "_blank", "noopener");
  const copy = async () => {
    await navigator.clipboard.writeText(url());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const native = () => (navigator.share ? navigator.share({ title, url: url() }) : copy());
  return (
    <div className="share">
      <button onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent(title + " " + url()), "_blank", "noopener")}>WhatsApp</button>
      <button onClick={() => open("https://t.me/share/url?text=" + encodeURIComponent(title) + "&url=")}>Telegram</button>
      <button onClick={() => open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) + "&url=")}>X</button>
      <button onClick={native}>{copied ? "Copiato ✓" : "Condividi / Copia link"}</button>
    </div>
  );
}
