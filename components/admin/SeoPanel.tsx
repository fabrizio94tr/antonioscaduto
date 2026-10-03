"use client";

import { SITE_URL } from "@/lib/site-url";
import { stripHtml, wordCount } from "@/lib/text";

type Props = {
  title: string; slug: string; content: string; excerpt: string; hasImage: boolean;
  metaTitle: string; metaDescription: string; focusKeyword: string; ogImage: string; siteTitle: string;
};

type Check = { ok: boolean; label: string; hint?: string };

export function seoChecks(p: Props): Check[] {
  const kw = p.focusKeyword.trim().toLowerCase();
  const title = (p.metaTitle || p.title).toLowerCase();
  const desc = (p.metaDescription || p.excerpt).toLowerCase();
  const text = stripHtml(p.content).toLowerCase();
  const first = text.split(/\s+/).slice(0, 100).join(" ");
  const slugKw = kw.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
  const words = wordCount(p.content);
  const mt = (p.metaTitle || p.title).length;
  const md = (p.metaDescription || "").length;
  const c: Check[] = [
    { ok: mt >= 30 && mt <= 60, label: `Titolo SEO tra 30 e 60 caratteri (ora ${mt})`, hint: "Google taglia i titoli oltre ~60 caratteri." },
    { ok: md >= 120 && md <= 160, label: `Meta description tra 120 e 160 caratteri (ora ${md})`, hint: md === 0 ? "Vuota: Google ne genererà una automatica." : undefined },
    { ok: p.slug.length > 0 && p.slug.length <= 75, label: "URL (slug) breve, massimo 75 caratteri" },
    { ok: words >= 300, label: `Testo di almeno 300 parole (ora ${words})` },
    { ok: p.hasImage, label: "Immagine di copertina presente" },
    { ok: /<h2/i.test(p.content) || words < 300, label: "Sottotitoli H2 nel testo lungo" },
    { ok: /<a\s/i.test(p.content), label: "Almeno un link nel testo (interno o esterno)" },
    { ok: !/<img(?![^>]*alt="[^"]+")/i.test(p.content), label: "Tutte le immagini nel testo hanno il testo alternativo" },
  ];
  if (kw) {
    c.unshift(
      { ok: p.title.toLowerCase().includes(kw) || title.includes(kw), label: "Parola chiave nel titolo" },
      { ok: desc.includes(kw), label: "Parola chiave nella meta description" },
      { ok: p.slug.includes(slugKw), label: "Parola chiave nello slug" },
      { ok: first.includes(kw), label: "Parola chiave nelle prime 100 parole" },
    );
  }
  return c;
}

export default function SeoPanel(p: Props) {
  const title = (p.metaTitle || p.title || "Titolo dell'articolo").slice(0, 70);
  const desc = p.metaDescription || p.excerpt || stripHtml(p.content).slice(0, 160);
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const checks = seoChecks(p);
  const score = checks.filter((c) => c.ok).length;
  const level = score / checks.length;

  return (
    <div className="seo">
      <h3>Anteprima su Google</h3>
      <div className="serp">
        <div className="serp-url">{host} › {p.slug || "slug-articolo"}</div>
        <div className="serp-title">{title.length > 60 ? title.slice(0, 60) + "…" : title}</div>
        <div className="serp-desc">{desc.length > 160 ? desc.slice(0, 160) + "…" : desc || "Nessuna descrizione."}</div>
      </div>
      <h3 style={{ marginTop: 16 }}>Anteprima social</h3>
      <div className="og">
        <div className="og-img" style={p.ogImage ? { backgroundImage: `url(${p.ogImage})` } : undefined}>{!p.ogImage && "Nessuna immagine"}</div>
        <div className="og-body">
          <small>{host.toUpperCase()}</small>
          <strong>{p.metaTitle || p.title || "Titolo"}</strong>
        </div>
      </div>
      <h3 style={{ marginTop: 16 }}>
        Controllo SEO{" "}
        <span className={`score ${level > 0.8 ? "good" : level > 0.5 ? "mid" : "bad"}`}>{score}/{checks.length}</span>
      </h3>
      <ul className="checks">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? "ok" : "ko"} title={c.hint}>
            {c.ok ? "✓" : "✗"} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
