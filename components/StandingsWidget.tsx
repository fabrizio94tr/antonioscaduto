import Link from "next/link";
import { getStandings, scoresEnabled } from "@/lib/scores";

export default async function StandingsWidget() {
  if (!scoresEnabled) return null;
  const rows = (await getStandings("SA")).slice(0, 6);
  if (!rows.length) return null;
  return (
    <section className="widget" data-reveal>
      <h2>Classifica Serie A <Link href="/risultati">Completa →</Link></h2>
      {rows.map((r) => (
        <div key={r.position} className="srow"><b>{r.position}</b><span>{r.team.shortName ?? r.team.name}</span><em>{r.points}</em></div>
      ))}
    </section>
  );
}
