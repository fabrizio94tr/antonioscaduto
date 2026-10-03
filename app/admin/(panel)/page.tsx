import Link from "next/link";
import { fmtStamp } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase";

export default async function Overview() {
  const sb = await supabaseServer();
  const now = new Date().toISOString();
  const head = (q: any) => q.then((r: { count: number | null }) => r.count ?? 0);
  const [published, drafts, scheduled, noDesc, subs] = await Promise.all([
    head(sb.from("articles").select("id", { count: "exact", head: true }).eq("published", true).lte("published_at", now)),
    head(sb.from("articles").select("id", { count: "exact", head: true }).eq("published", false)),
    head(sb.from("articles").select("id", { count: "exact", head: true }).eq("published", true).gt("published_at", now)),
    head(sb.from("articles").select("id", { count: "exact", head: true }).eq("published", true).or("meta_description.is.null,meta_description.eq.")),
    head(sb.from("subscribers").select("id", { count: "exact", head: true })),
  ]);
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const [{ data: top }, { data: recentDrafts }] = await Promise.all([
    sb.from("articles").select("id,slug,title,views").eq("published", true).gte("published_at", since).order("views", { ascending: false }).limit(8),
    sb.from("articles").select("id,title,updated_at").eq("published", false).order("updated_at", { ascending: false }).limit(5),
  ]);

  return (
    <>
      <div className="row"><h1>Panoramica</h1><Link href="/admin/articoli/new" className="btn">+ Nuovo articolo</Link></div>
      <div className="stats">
        <Link href="/admin/articoli?stato=pubblicati"><b>{published}</b><span>Pubblicati</span></Link>
        <Link href="/admin/articoli?stato=bozze"><b>{drafts}</b><span>Bozze</span></Link>
        <Link href="/admin/articoli?stato=programmati"><b>{scheduled}</b><span>Programmati</span></Link>
        <Link href="/admin/iscritti"><b>{subs}</b><span>Iscritti newsletter</span></Link>
      </div>
      {noDesc > 0 && (
        <p className="notice">
          ⚠️ <b>{noDesc}</b> articoli pubblicati non hanno una meta description personalizzata (Google ne genera una automatica).{" "}
          <Link href="/admin/articoli?seo=senza-descrizione" className="tag">Vedi l&apos;elenco</Link>
        </p>
      )}
      <div className="two">
        <section>
          <h2>Più letti negli ultimi 7 giorni</h2>
          <table><tbody>
            {(top ?? []).map((a) => (
              <tr key={a.id}><td><Link href={`/admin/articoli/${a.id}`}>{a.title}</Link></td><td>{a.views ?? 0} 👁</td></tr>
            ))}
            {!top?.length && <tr><td>Ancora nessun dato.</td></tr>}
          </tbody></table>
        </section>
        <section>
          <h2>Ultime bozze</h2>
          <table><tbody>
            {(recentDrafts ?? []).map((a) => (
              <tr key={a.id}><td><Link href={`/admin/articoli/${a.id}`}>{a.title}</Link></td><td>{fmtStamp(a.updated_at)}</td></tr>
            ))}
            {!recentDrafts?.length && <tr><td>Nessuna bozza.</td></tr>}
          </tbody></table>
        </section>
      </div>
    </>
  );
}
