import Link from "next/link";
import { fmtTime, getArticles, getBreaking } from "@/lib/data";

/** Striscia scorrevole: "ULTIM'ORA" (rosso) se ci sono notizie marcate così, altrimenti "LIVE" con le ultime uscite. */
export default async function Ticker() {
  const breaking = await getBreaking();
  const hot = breaking.length > 0;
  const items = hot ? breaking : await getArticles({ limit: 8 });
  if (!items.length) return null;
  const row = (hidden: boolean) =>
    items.map((a) => (
      <Link key={(hidden ? "b" : "a") + a.id} href={`/${a.slug}`} tabIndex={hidden ? -1 : 0} aria-hidden={hidden || undefined}>
        <time>{fmtTime(a.published_at)}</time>{a.title}
      </Link>
    ));
  return (
    <div className="ticker" role="region" aria-label="Ultime notizie">
      <div className="wrap">
        <span className={`ticker-badge ${hot ? "hot" : ""}`}><i />{hot ? "ULTIM'ORA" : "LIVE"}</span>
        <div className="marquee">
          <div className="marquee-track">{row(false)}{row(true)}</div>
        </div>
      </div>
    </div>
  );
}
