"use client";

export default function CookieButton() {
  const open = () => {
    // con AdSense il messaggio è di Google Funding Choices
    if (window.__fc) {
      const q = (window.googlefc = window.googlefc || {}).callbackQueue = window.googlefc?.callbackQueue || [];
      q.push({ CONSENT_DATA_READY: () => window.googlefc?.showRevocationMessage?.() });
      return;
    }
    window.dispatchEvent(new Event("open-consent"));
  };
  return <button className="linklike" onClick={open}>Gestisci cookie</button>;
}
