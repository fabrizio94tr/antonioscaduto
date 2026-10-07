/** Colori sociali delle principali squadre: [colore principale, secondo colore]. Le pagine /tag/<squadra> si "vestono" di questi. */
export const TEAM_COLORS: Record<string, [string, string]> = {
  juventus: ["#111111", "#f2f2f2"],
  milan: ["#b3121f", "#111111"],
  inter: ["#0a2a66", "#1b9bd8"],
  napoli: ["#0b86c9", "#ffffff"],
  roma: ["#7d1d2b", "#f0b73d"],
  lazio: ["#6cc4ee", "#ffffff"],
  atalanta: ["#17315e", "#1d78c0"],
  fiorentina: ["#4b2480", "#d8c8f0"],
  torino: ["#7a1620", "#d8b36a"],
  bologna: ["#0f2a5e", "#b6192c"],
  genoa: ["#8a1020", "#0a2b5c"],
  cagliari: ["#8a1a2b", "#0a2b5c"],
  udinese: ["#1a1a1a", "#d9d9d9"],
  lecce: ["#d4a000", "#b01327"],
  verona: ["#16336b", "#f0c400"],
  como: ["#0d3a8c", "#ffffff"],
  parma: ["#f2c200", "#0a2b5c"],
  sassuolo: ["#0a7a3c", "#111111"],
  pisa: ["#10223f", "#2a7dd0"],
  cremonese: ["#8a8a8a", "#b01327"],
  sampdoria: ["#0b3d91", "#ffffff"],
  palermo: ["#e6a0b7", "#111111"],
  venezia: ["#0a5b3c", "#e07a1a"],
  monza: ["#c1121f", "#ffffff"],
  empoli: ["#1d5fb4", "#ffffff"],
};

export const teamColors = (slug: string) => TEAM_COLORS[slug] ?? null;

/** Colore del testo (bianco o quasi nero) leggibile sopra lo sfondo dato. */
export function textOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#10140f" : "#ffffff";
}

/** Categorie "tecniche" ereditate da WordPress: non vanno mostrate ai lettori. */
export const HIDDEN_CATEGORIES = new Set(["uncategorized", "senza-categoria"]);
