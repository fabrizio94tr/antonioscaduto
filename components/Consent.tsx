"use client";

import { useEffect, useState } from "react";

type Choice = { analytics: boolean; marketing: boolean };
const KEY = "cookie-consent-v1";
const MAX_AGE = 1000 * 60 * 60 * 24 * 182; // il consenso va richiesto di nuovo dopo circa 6 mesi (Garante privacy)

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; __consent?: Choice; adsbygoogle?: unknown[]; __fc?: boolean; googlefc?: { callbackQueue?: unknown[]; showRevocationMessage?: () => void } }
}

function loadScript(src: string, id: string, attrs: Record<string, string> = {}) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id; s.src = src; s.async = true;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

export default function Consent({ gaId, adsClient }: { gaId: string; adsClient: string }) {
  // Con AdSense il consenso lo gestisce Google Funding Choices (CMP certificata IAB TCF): niente banner proprio.
  const fc = Boolean(adsClient);
  const needed = !fc && Boolean(gaId);
  const [choice, setChoice] = useState<Choice | null | undefined>(undefined); // undefined = non ancora letto
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState<Choice>({ analytics: false, marketing: false });

  useEffect(() => {
    if (!fc) return;
    window.__fc = true;
    const pub = adsClient.replace(/^ca-/, "");
    // Consent Mode v2: tutto negato finché Funding Choices non comunica la scelta dell'utente
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer!.push(arguments); };
    window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", wait_for_update: 500 });
    loadScript(`https://fundingchoicesmessages.google.com/i/${pub}?ers=1`, "fc-script");
    // iframe "segnale" richiesto da Funding Choices
    if (!document.querySelector('iframe[name="googlefcPresent"]')) {
      const f = document.createElement("iframe"); f.name = "googlefcPresent"; f.style.cssText = "display:none;width:0;height:0;border:0"; f.setAttribute("aria-hidden", "true"); f.tabIndex = -1; document.body.appendChild(f);
    }
    loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`, "ads-script", { crossorigin: "anonymous" });
    if (gaId) {
      window.gtag("js", new Date());
      window.gtag("config", gaId, { anonymize_ip: true });
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, "ga-script");
    }
    window.dispatchEvent(new Event("consent-change"));
  }, [fc, adsClient, gaId]);

  useEffect(() => {
    if (fc) return;
    try {
      const raw = localStorage.getItem(KEY);
      const saved = raw ? (JSON.parse(raw) as Choice & { at?: number }) : null;
      setChoice(saved && saved.at && Date.now() - saved.at < MAX_AGE ? { analytics: !!saved.analytics, marketing: !!saved.marketing } : null);
    } catch { setChoice(null); }
    const reopen = () => setOpen(true);
    window.addEventListener("open-consent", reopen);
    return () => window.removeEventListener("open-consent", reopen);
  }, [fc]);

  useEffect(() => {
    if (fc || !choice) return;
    window.__consent = choice;
    if (choice.analytics && gaId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer!.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", gaId, { anonymize_ip: true });
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, "ga-script");
    }
    if (choice.marketing && adsClient) {
      loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`, "ads-script", { crossorigin: "anonymous" });
    }
    window.dispatchEvent(new Event("consent-change"));
  }, [fc, choice, gaId, adsClient]);

  const save = (c: Choice) => {
    try { localStorage.setItem(KEY, JSON.stringify({ ...c, at: Date.now() })); } catch {}
    setChoice(c); setOpen(false);
  };

  if (!needed || choice === undefined) return null;
  if (choice !== null && !open) return null;

  return (
    <div className="consent" role="dialog" aria-label="Preferenze cookie">
      <p>
        Usiamo cookie per misurare le visite{adsClient ? " e mostrare pubblicità" : ""}. Puoi accettare, rifiutare o scegliere.
        Maggiori informazioni nella <a href="/cookie-policy">Cookie Policy</a>.
      </p>
      <div className="consent-opts">
        <label><input type="checkbox" checked disabled /> Necessari</label>
        {gaId && <label><input type="checkbox" checked={custom.analytics} onChange={(e) => setCustom({ ...custom, analytics: e.target.checked })} /> Statistiche</label>}
        {adsClient && <label><input type="checkbox" checked={custom.marketing} onChange={(e) => setCustom({ ...custom, marketing: e.target.checked })} /> Pubblicità</label>}
      </div>
      <div className="consent-btns">
        <button onClick={() => save({ analytics: false, marketing: false })}>Solo necessari</button>
        <button onClick={() => save(custom)}>Salva scelta</button>
        <button className="primary" onClick={() => save({ analytics: true, marketing: true })}>Accetta tutto</button>
      </div>
    </div>
  );
}
