import Link from "next/link";
import Cover from "./Cover";
import type { Article } from "@/lib/types";

/** Carta con foto e titolo sovrimpresso (usata nel "primo piano" e nella colonna destra dello stile Diretta). */
export function TmwCard({ a, tag, lead = false }: { a: Article; tag?: string; lead?: boolean }) {
  return (
    <Link href={`/${a.slug}`} className={`tmw-card${lead ? " lead" : ""}`}>
      <span className="tmw-thumb">
        <Cover src={a.image_url} alt="" />
        <span className="tmw-cap">
          {tag && <em>{tag}</em>}
          <span className="tmw-title">{a.title}</span>
        </span>
      </span>
    </Link>
  );
}

/** "Primo piano" dello stile Diretta: tre carte in alto, apertura grande a sinistra e due carte a destra. */
export default function TmwTop({ list }: { list: Article[] }) {
  const [a, b, c, lead, d, e] = list;
  if (!a) return null;
  return (
    <section className="tmw-top only-live" aria-label="In primo piano">
      <div className="tmw-row3">{[a, b, c].filter(Boolean).map((x) => <TmwCard key={x.id} a={x} tag={x.category?.name} />)}</div>
      {lead && (
        <div className="tmw-lead">
          <TmwCard a={lead} lead />
          <div className="tmw-stack">{[d, e].filter(Boolean).map((x) => <TmwCard key={x.id} a={x} tag={x.category?.name} />)}</div>
        </div>
      )}
    </section>
  );
}
