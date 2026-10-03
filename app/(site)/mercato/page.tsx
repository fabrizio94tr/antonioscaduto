import type { Metadata } from "next";
import Link from "next/link";
import { fmtStamp, getTransfers } from "@/lib/data";
import type { TransferStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Calciomercato Live", description: "Tutte le trattative di calciomercato aggiornate in tempo reale, con stato e cifre." };
export const revalidate = 60;

const STATUS: Record<TransferStatus, string> = {
  ufficiale: "Ufficiale", vicino: "Vicino", trattativa: "In trattativa", rumors: "Rumors", sfumato: "Sfumato",
};

export default async function Mercato({ searchParams }: { searchParams: Promise<{ stato?: string; q?: string }> }) {
  const { stato, q = "" } = await searchParams;
  let list = await getTransfers();
  if (stato && stato in STATUS) list = list.filter((t) => t.status === stato);
  if (q) list = list.filter((t) => [t.player, t.from_club, t.to_club].join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="wrap">
      <h1 className="page-title">Calciomercato Live</h1>
      <p className="updated">Trattative con stato aggiornato dalla redazione.</p>
      <div className="chips">
        <Link href="/mercato" className={!stato ? "on" : ""}>Tutte</Link>
        {Object.entries(STATUS).map(([k, v]) => (
          <Link key={k} href={`/mercato?stato=${k}`} className={stato === k ? "on" : ""}>{v}</Link>
        ))}
      </div>
      <form action="/mercato" className="searchbox">
        {stato && <input type="hidden" name="stato" value={stato} />}
        <input type="search" name="q" defaultValue={q} placeholder="Giocatore o squadra…" />
        <button className="btn">Filtra</button>
      </form>
      <div className="table-scroll">
        <table className="mercato">
          <thead><tr><th>Giocatore</th><th>Da</th><th>A</th><th>Cifra</th><th>Stato</th><th>Agg.</th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={6}>Nessuna trattativa trovata.</td></tr>}
            {list.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.article_slug ? <Link href={`/${t.article_slug}`}>{t.player}</Link> : t.player}</strong>
                  {t.note && <div className="note">{t.note}</div>}
                </td>
                <td>{t.from_club ?? "—"}</td>
                <td>{t.to_club ?? "—"}</td>
                <td>{t.fee ?? "—"}</td>
                <td><span className={`st st-${t.status}`}>{STATUS[t.status]}</span></td>
                <td>{fmtStamp(t.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
