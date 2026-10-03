import { supabaseServer } from "@/lib/supabase";

export default async function Stats() {
  const sb = await supabaseServer();
  const days = 14;
  const since = new Date(Date.now() - (days - 1) * 864e5).toISOString().slice(0, 10);
  const [{ data: daily }, { data: searches }, { data: top }] = await Promise.all([
    sb.from("article_views_daily").select("day,views,article:articles(title,slug)").gte("day", since).limit(10000),
    sb.from("search_log").select("q,results").gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()).limit(5000),
    sb.from("articles").select("title,slug,views").eq("published", true).order("views", { ascending: false }).limit(10),
  ]);

  const perDay = new Map<string, number>();
  const perArticle = new Map<string, { title: string; slug: string; v: number }>();
  for (const r of (daily ?? []) as unknown as { day: string; views: number; article: { title: string; slug: string } | null }[]) {
    perDay.set(r.day, (perDay.get(r.day) ?? 0) + r.views);
    if (r.article) {
      const e = perArticle.get(r.article.slug) ?? { ...r.article, v: 0 };
      e.v += r.views; perArticle.set(r.article.slug, e);
    }
  }
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 864e5).toISOString().slice(0, 10);
    return { d, v: perDay.get(d) ?? 0 };
  });
  const max = Math.max(1, ...series.map((x) => x.v));
  const total = series.reduce((a, b) => a + b.v, 0);

  const q = new Map<string, { n: number; zero: number }>();
  for (const s of searches ?? []) {
    const e = q.get(s.q) ?? { n: 0, zero: 0 };
    e.n++; if (!s.results) e.zero++; q.set(s.q, e);
  }
  const topQ = [...q.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 12);
  const week = [...perArticle.values()].sort((a, b) => b.v - a.v).slice(0, 10);

  return (
    <>
      <h1>Statistiche</h1>
      <p className="updated">Letture degli ultimi {days} giorni: <b>{total}</b> (conteggio interno, senza cookie). Per i dati completi usa Google Analytics.</p>
      <div className="bars" role="img" aria-label="Letture per giorno">
        {series.map((x) => (
          <div key={x.d} className="bar" title={`${x.d}: ${x.v}`}>
            <span style={{ height: `${(x.v / max) * 100}%` }} />
            <small>{x.d.slice(8)}</small>
          </div>
        ))}
      </div>
      <div className="two">
        <section>
          <h2>Articoli più letti (14 giorni)</h2>
          <table><tbody>{week.map((a) => <tr key={a.slug}><td>{a.title}</td><td>{a.v}</td></tr>)}{!week.length && <tr><td>Ancora nessun dato.</td></tr>}</tbody></table>
          <h2>Più letti di sempre</h2>
          <table><tbody>{(top ?? []).map((a) => <tr key={a.slug}><td>{a.title}</td><td>{a.views}</td></tr>)}</tbody></table>
        </section>
        <section>
          <h2>Ricerche più frequenti (30 giorni)</h2>
          <table>
            <thead><tr><th>Cerca</th><th>Volte</th><th>Senza risultati</th></tr></thead>
            <tbody>{topQ.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v.n}</td><td>{v.zero || ""}</td></tr>)}{!topQ.length && <tr><td colSpan={3}>Nessuna ricerca.</td></tr>}</tbody>
          </table>
          <p className="updated">Le ricerche senza risultati sono contenuti che i lettori cercano e che non avete.</p>
        </section>
      </div>
    </>
  );
}
