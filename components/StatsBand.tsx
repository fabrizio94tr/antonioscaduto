import { countArticles, countNewerThan } from "@/lib/data";

/** Fascia "numeri del giorno": visibile solo nello stile Nuovo. */
export default async function StatsBand({ hotTag }: { hotTag?: string }) {
  const ago = (days: number) => new Date(Date.now() - days * 864e5).toISOString();
  const [d1, d7, d30, archive] = await Promise.all([countNewerThan(ago(1)), countNewerThan(ago(7)), countNewerThan(ago(30)), countArticles()]);
  // finestra più corta con dati; se il sito è fermo da giorni, allarga
  const recent = d1 > 0 ? { n: d1, label: "Articoli nelle ultime 24 ore" } : d7 > 0 ? { n: d7, label: "Articoli negli ultimi 7 giorni" } : d30 > 0 ? { n: d30, label: "Articoli negli ultimi 30 giorni" } : null;
  return (
    <div className="stats-band only-new" data-reveal>
      {recent && <div><b>{recent.n}</b><span>{recent.label}</span></div>}
      <div><b>{archive.toLocaleString("it-IT")}</b><span>Articoli in archivio</span></div>
      {hotTag && <div><b>{hotTag}</b><span>Il nome più caldo</span></div>}
    </div>
  );
}
