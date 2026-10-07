import Link from "next/link";
import { getTransfers } from "@/lib/data";
import { HEAT, STATUS_LABEL } from "@/lib/transfers";

/** Termometro del calciomercato: le trattative più recenti con barra di "calore". */
export default async function MercatoRadar({ limit = 5 }: { limit?: number }) {
  const list = (await getTransfers(limit));
  if (!list.length) return null;
  return (
    <section className="widget" data-reveal>
      <h2>Mercato Radar <Link href="/mercato">Tutto →</Link></h2>
      {list.map((t, n) => (
        <div key={t.id} className="radar-row">
          <div className="radar-top">
            {t.article_slug ? <Link href={`/${t.article_slug}`}>{t.player}</Link> : t.player}
            <span>{STATUS_LABEL[t.status]}</span>
          </div>
          {(t.from_club || t.to_club) && <div className="radar-route">{t.from_club ?? "?"} → {t.to_club ?? "?"}{t.fee ? ` · ${t.fee}` : ""}</div>}
          <div className={`heat heat-${t.status}`} style={{ ["--w" as string]: `${HEAT[t.status]}%`, ["--i" as string]: n }} role="img" aria-label={`Temperatura ${HEAT[t.status]} su 100`}><i /></div>
        </div>
      ))}
    </section>
  );
}
