import Link from "next/link";
import Cover from "@/components/Cover";
import Newsletter from "@/components/Newsletter";
import { fmtLong, fmtStamp, getArticles, getMostRead } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [all, editoriali, focus, mostRead] = await Promise.all([
    getArticles({ limit: 40 }),
    getArticles({ category: "editoriale", limit: 4 }),
    getArticles({ featured: true, limit: 8 }),
    getMostRead(5),
  ]);
  const heroes = focus.length >= 4 ? focus.slice(0, 4) : all.slice(0, 4);
  const [main, ...side] = heroes;
  const used = new Set(heroes.map((a) => a.id));
  const latest = all.filter((a) => !used.has(a.id)).slice(0, 12);
  const grid = all.filter((a) => a.image_url).slice(0, 6);

  return (
    <main className="wrap">
      {all[0] && <p className="updated">Ultimo aggiornamento: {fmtLong(all[0].published_at)}</p>}

      {main && (
        <section className="hero">
          <Link href={`/${main.slug}`} className="hero-main">
            <Cover src={main.image_url} alt={main.title} />
            <div className="cap">
              <span className="tag">{main.category?.name}</span>
              <h2>{main.title}</h2>
            </div>
          </Link>
          <div className="hero-side">
            {side.slice(0, 2).map((a) => (
              <Link key={a.id} href={`/${a.slug}`}>
                <Cover src={a.image_url} alt={a.title} />
                <div className="cap">
                  <span className="tag">{a.category?.name}</span>
                  <h3>{a.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="cols">
        <section>
          <h2 className="section-title"><span>Ultime notizie</span></h2>
          <ul className="timeline">
            {latest.map((a) => (
              <li key={a.id}>
                <time dateTime={a.published_at}>{fmtStamp(a.published_at)}</time>
                <div>
                  <span className="tag">{a.category?.name}</span>
                  <br />
                  <Link href={`/${a.slug}`}>{a.title}</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside>
          {editoriali.length > 0 && (
            <>
              <h2 className="section-title"><span>Editoriale</span></h2>
              <ul className="side-list">
                {editoriali.map((a) => (
                  <li key={a.id}>
                    <time>{fmtStamp(a.published_at)}</time>
                    <Link href={`/${a.slug}`}>{a.title}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {mostRead.length > 0 && (
            <>
              <h2 className="section-title"><span>Più letti</span></h2>
              <ol className="side-list ranked">
                {mostRead.map((a) => (
                  <li key={a.id}><Link href={`/${a.slug}`}>{a.title}</Link></li>
                ))}
              </ol>
            </>
          )}
          <Newsletter />
          <div className="box">
            <h2 className="tag">Chi è Antonio Scaduto</h2>
            <p>Il calcio a 360 gradi: notizie, calciomercato, interviste ed esclusive dal mondo del pallone.</p>
            <Link href="/chi-siamo" className="btn">Scopri di più</Link>
          </div>
        </aside>
      </div>

      {grid.length > 0 && (
        <section>
          <h2 className="section-title"><span>In evidenza</span></h2>
          <div className="grid">
            {grid.map((a) => (
              <Link key={a.id} href={`/${a.slug}`} className="card">
                <div className="img"><Cover src={a.image_url} alt="" /></div>
                <span className="tag">{a.category?.name}</span>
                <h3>{a.title}</h3>
                <time>{fmtStamp(a.published_at)}</time>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
