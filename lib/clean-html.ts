import sanitizeHtml from "sanitize-html";

/**
 * Toglie dal testo degli articoli la pubblicità che arriva con il copia-incolla da altri siti
 * (segnaposto Nexilia, link sponsorizzati Taboola/MGID/Criteo…, banner, elenchi "altri articoli").
 * Usato al salvataggio e, per sicurezza, anche quando l'articolo viene mostrato.
 */
const AD_HOST = /(^|\.)(nexilia\.it|mgid\.com|taboola\.com|taboola-display\.com|criteo\.com|criteo\.net|adform\.net|outbrain\.com|doubleclick\.net|googlesyndication\.com|googleadservices\.com|teads\.tv|smartadserver\.com|sascdn\.com|mediago\.io|eadv\.it|temu\.com|adsafeprotected\.com|ploynest\.com|brainberries\.co|wp-royal-themes\.com|amazon-adsystem\.com|[a-z0-9-]+\.top)$/i;
const JUNK_TEXT = /^(pubblicit[àa]|sponsorizzat[oa]|contenuti sponsorizzati|mostra i commenti|pubblicit[àa]\s*mostra i commenti|potrebbe interessarti anche|ti potrebbe interessare|advertisement|copyright ©.*nexilia.*|ordina ora|clicca qui|scopri di più|scopri ora|acquista ora|read more|learn more|shop now)$/i;
const AD_URL_TEXT = /^\s*https?:\/\/\S*(taboola|googlesyndication|safeframe|doubleclick|adsafeprotected|teads|criteo|mgid|smartadserver)\S*\s*$/i;
const RELATED_TITLE = /^(ALTRI ARTICOLI|ULTIMI ARTICOLI|ULTIME NOTIZIE|ARTICOLI CHE POTREBBERO)[A-Z ]*$/;

const host = (u?: string) => { try { return new URL(u ?? "", "https://x.invalid").hostname; } catch { return ""; } };
const norm = (t: string) => t.replace(/ /g, " ").replace(/\s+/g, " ").trim();

export function isAdFrame(frame: sanitizeHtml.IFrame): boolean {
  const { tag, attribs } = frame;
  const t = norm(frame.text ?? "");
  if (tag === "img") return AD_HOST.test(host(attribs.src)) || /^blob:/.test(attribs.src ?? "");
  if (tag === "a") {
    if (attribs.href) {
      if (AD_HOST.test(host(attribs.href)) || /alfredopedulla\.com\/api\/goToNexilia|taboola|outbrain|utm_medium=(rtb|native|cpc)/i.test(attribs.href)) return true;
      return frame.text === "" && !frame.mediaChildren.length && !/antonioscaduto/.test(host(attribs.href)); // link esterno vuoto (resto di un annuncio)
    }
    return /\|$/.test(t); // card pubblicitaria senza link: "Marca|"
  }
  if (tag === "ul" || tag === "ol") return (t.match(/\d\d\/\d\d\/20\d\d/g)?.length ?? 0) >= 3; // elenco "altri articoli" con le date
  if (["p", "h2", "h3", "h4", "div", "figure", "span", "strong"].includes(tag)) {
    if (frame.mediaChildren.length) return false;
    if (frame.text === "" && tag !== "span" && tag !== "strong") return true; // paragrafo/contenitore vuoto (nemmeno uno spazio)
    return JUNK_TEXT.test(t) || AD_URL_TEXT.test(t) || (RELATED_TITLE.test(t) && t.length < 70);
  }
  return false;
}

/** Ripulisce l'HTML lasciando invariati tag e attributi (la sicurezza la fa renderContent). */
export function stripAds(html: string): string {
  if (!html) return html;
  return sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    allowVulnerableTags: true,
    exclusiveFilter: isAdFrame,
  }).replace(/(PUBBLICIT[ÀA])?MOSTRA I COMMENTI/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
