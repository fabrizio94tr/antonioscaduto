import type { Metadata } from "next";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { fmtStamp, searchArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Cerca", robots: { index: false, follow: true } };
const SIZE = 30;

export default async function Cerca({ searchParams }: { searchParams: Promise<{ q?: string; pagina?: string }> }) {
  const { q = "", pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10) || 1);
  // chiedo un risultato in più per sapere se esiste la pagina successiva
  const found = await searchArticles(q, SIZE + 1, page);
  const results = found.slice(0, SIZE);
  const hasMore = found.length > SIZE;
  return (
    <main className="wrap">
      <h1 className="page-title">Cerca</h1>
      <form action="/cerca" className="searchbox">
        <input type="search" name="q" defaultValue={q} placeholder="Cerca giocatori, squadre, notizie…" autoFocus />
        <button className="btn">Cerca</button>
      </form>
      {q && results.length === 0 && <p className="updated">Nessun risultato per “{q}”.</p>}
      <ul className="timeline">
        {results.map((a) => (
          <li key={a.id}>
            <time dateTime={a.published_at}>{fmtStamp(a.published_at)}</time>
            <div>
              <span className="tag">{a.category?.name}</span><br />
              <Link href={`/${a.slug}`}>{a.title}</Link>
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={page} total={hasMore ? (page + 1) * SIZE : page * SIZE} size={SIZE} href={(p) => `/cerca?q=${encodeURIComponent(q)}&pagina=${p}`} />
    </main>
  );
}
