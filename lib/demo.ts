import type { Article, Category, Page } from "./types";

const names: [string, string][] = [
  ["news", "News"], ["calciomercato", "Calciomercato"], ["champions-league", "Champions League"],
  ["editoriale", "Editoriale"], ["premier-league", "Premier League"], ["europa-league", "Europa League"],
  ["serie-a", "Serie A"], ["conference-league", "Conference League"], ["serie-b", "Serie B"],
  ["esclusiva", "Esclusiva"], ["altro", "Altro"],
];

export const demoCategories: Category[] = names.map(([slug, name], i) => ({
  id: slug, slug, name, position: i + 1, in_menu: true,
}));
const cat = (s: string) => demoCategories.find((c) => c.slug === s)!;

const lorem =
  "Contenuto dimostrativo. Questo testo verrà sostituito dagli articoli reali pubblicati dal pannello di amministrazione.\n\nIl calcio a 360 gradi: notizie, interviste, calciomercato e approfondimenti.";

const raw: [string, string, string, string, boolean][] = [
  ["Bruno Fernandes: “Ronaldo è e resterà un’icona. Non ci sono divisioni nella Nazionale”", "news", "Il centrocampista del Portogallo risponde sul caso Ronaldo e sul clima nello spogliatoio.", "2026-10-03T19:16:00", true],
  ["Milan, Gila: “Il nostro livello è l’Europa League, ma siamo ambiziosi”", "serie-a", "Il difensore parla di ambizioni e del ruolo dei compagni di reparto.", "2026-10-03T18:52:00", true],
  ["Ufficiale: Ruocco rinnova con il Mantova", "serie-b", "Il club biancorosso ha comunicato il prolungamento del contratto.", "2026-10-03T18:16:00", true],
  ["Mancio e gli spot solo se vince", "editoriale", "L’editoriale del giorno.", "2026-10-03T17:37:00", false],
  ["Genoa: trauma distorsivo alla caviglia per Colombo", "serie-a", "Gli esami hanno evidenziato un trauma distorsivo.", "2026-10-03T21:00:00", false],
  ["Calciomercato: i nomi caldi in vista di gennaio", "calciomercato", "Le piste più calde del prossimo mercato invernale.", "2026-10-03T16:32:00", false],
  ["Champions League: il quadro completo della nuova giornata", "champions-league", "Tutti i risultati e le chiavi tattiche.", "2026-10-03T15:10:00", false],
  ["Premier League, il big match della settimana", "premier-league", "Anteprima e probabili formazioni.", "2026-10-03T14:00:00", false],
  ["Esclusiva: parla l’agente del giovane talento", "esclusiva", "Le parole in esclusiva sul futuro del ragazzo.", "2026-10-03T12:30:00", false],
];

export const demoArticles: Article[] = raw.map(([title, c, excerpt, d, featured], i) => ({
  id: `demo-${i}`,
  slug: `demo-${i + 1}`,
  title,
  excerpt,
  content: lorem,
  image_url: null,
  category_id: c,
  featured,
  published: true,
  published_at: new Date(d + "+02:00").toISOString(),
  category: cat(c),
}));

export const demoPages: Page[] = [
  { slug: "cosa-offriamo", title: "Cosa offriamo", content: "Contenuto da definire con il cliente." },
  { slug: "vuoi-collaborare-con-noi", title: "Vuoi collaborare con noi?", content: "Contenuto da definire con il cliente." },
  { slug: "chi-siamo", title: "Chi siamo", content: "Contenuto da definire con il cliente." },
  { slug: "contatti", title: "Contatti", content: "Contenuto da definire con il cliente." },
  { slug: "privacy-policy", title: "Privacy Policy", content: "Da completare." },
  { slug: "cookie-policy", title: "Cookie Policy", content: "Da completare." },
];

import type { Transfer } from "./types";
export const demoTransfers: Transfer[] = [
  { id: "t1", player: "Ruocco", from_club: "Mantova", to_club: "Mantova", status: "ufficiale", fee: "—", note: "Rinnovo di contratto", article_slug: "demo-3", updated_at: "2026-10-03T16:16:00Z" },
  { id: "t2", player: "Giovane talento", from_club: "Serie B", to_club: "Serie A", status: "trattativa", fee: "8 mln", note: "Contatti avviati", article_slug: null, updated_at: "2026-10-03T12:30:00Z" },
  { id: "t3", player: "Attaccante straniero", from_club: "Premier League", to_club: "Serie A", status: "rumors", fee: null, note: "Sondaggio", article_slug: null, updated_at: "2026-10-02T10:00:00Z" },
  { id: "t4", player: "Centrocampista", from_club: "Liga", to_club: "Milan", status: "vicino", fee: "15 mln", note: "Ultimi dettagli", article_slug: null, updated_at: "2026-10-02T09:00:00Z" },
];
