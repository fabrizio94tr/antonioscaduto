import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatches, getStandings, LEAGUES, scoresEnabled } from "@/lib/scores";

export const metadata: Metadata = { title: "Risultati e classifiche", description: "Risultati live, prossime partite e classifiche dei principali campionati." };
export const dynamic = "force-dynamic";

const dtf = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const LIVE = new Set(["IN_PLAY", "PAUSED", "LIVE"]);

export default async function Risultati({ searchParams }: { searchParams: Promise<{ lega?: string }> }) {
  if (!scoresEnabled) notFound();
  const code = (await searchParams).lega && LEAGUES[(await searchParams).lega!] ? (await searchParams).lega! : "SA";
  const [matches, table] = await Promise.all([getMatches(code), getStandings(code)]);
  return (
    <main className="wrap">
      <h1 className="page-title">Risultati e classifiche</h1>
      <div className="chips">
        {Object.entries(LEAGUES).map(([k, v]) => <Link key={k} href={`/risultati?lega=${k}`} className={k === code ? "on" : ""}>{v}</Link>)}
      </div>
      <div className="cols">
        <section>
          <h2 className="section-title"><span>Partite</span></h2>
          <ul className="timeline matches">
            {!matches.length && <li>Nessuna partita in programma.</li>}
            {matches.map((m) => {
              const f = m.score.fullTime;
              const live = LIVE.has(m.status);
              return (
                <li key={m.id}>
                  <time>{live ? <b style={{ color: "var(--accent)" }}>● LIVE</b> : dtf.format(new Date(m.utcDate))}</time>
                  <div className="match">
                    <span>{m.homeTeam.shortName ?? m.homeTeam.name}</span>
                    <b>{f.home ?? "–"} - {f.away ?? "–"}</b>
                    <span>{m.awayTeam.shortName ?? m.awayTeam.name}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <aside>
          <h2 className="section-title"><span>Classifica</span></h2>
          <div className="table-scroll">
            <table className="mercato">
              <thead><tr><th>#</th><th>Squadra</th><th>G</th><th>DR</th><th>Pt</th></tr></thead>
              <tbody>
                {table.map((r) => (
                  <tr key={r.position}>
                    <td>{r.position}</td><td>{r.team.shortName ?? r.team.name}</td><td>{r.playedGames}</td>
                    <td>{r.goalsFor - r.goalsAgainst}</td><td><b>{r.points}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </main>
  );
}
