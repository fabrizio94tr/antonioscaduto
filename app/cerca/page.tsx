import type { Metadata } from "next";
import Link from "next/link";
import { fmtStamp, searchArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Cerca" };

export default async function Cerca({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = await searchArticles(q);
  return (
    <main className="wrap">
      <h1 className="page-title">Cerca</h1>
      <form action="/cerca" className="searchbox">
        <input type="search" name="q" defaultValue={q} placeholder="Cerca giocatori, squadre, notizie…" autoFocus />
        <button className="btn">Cerca</button>
      </form>
      {q && <p className="updated">{results.length} risultati per “{q}”</p>}
      <ul className="timeline">
        {results.map((a) => (
          <li key={a.id}>
            <time dateTime={a.published_at}>{fmtStamp(a.published_at)}</time>
            <div>
              <span className="tag">{a.category?.name}</span><br />
              <Link href={`/articolo/${a.slug}`}>{a.title}</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
