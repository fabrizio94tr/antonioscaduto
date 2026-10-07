import type { Metadata } from "next";
import NewsItem from "@/components/NewsItem";
import Pagination from "@/components/Pagination";
import { searchArticles } from "@/lib/data";
import { hasSupabase, supabasePublic } from "@/lib/supabase";

export const metadata: Metadata = { title: "Cerca", robots: { index: false, follow: true } };
const SIZE = 30;

export default async function Cerca({ searchParams }: { searchParams: Promise<{ q?: string; pagina?: string }> }) {
  const { q = "", pagina } = await searchParams;
  const page = Math.max(1, parseInt(pagina ?? "1", 10) || 1);
  // chiedo un risultato in più per sapere se esiste la pagina successiva
  const found = await searchArticles(q, SIZE + 1, page);
  const results = found.slice(0, SIZE);
  const hasMore = found.length > SIZE;
  if (hasSupabase && page === 1 && q.trim().length >= 2) {
    await supabasePublic().from("search_log").insert({ q: q.trim().toLowerCase().slice(0, 100), results: results.length });
  }
  return (
    <main className="wrap">
      <h1 className="page-title">Cerca</h1>
      <form action="/cerca" className="searchbox">
        <input type="search" name="q" defaultValue={q} placeholder="Cerca giocatori, squadre, notizie…" autoFocus />
        <button className="btn">Cerca</button>
      </form>
      {q && results.length === 0 && <p className="updated">Nessun risultato per “{q}”.</p>}
      <div style={{ maxWidth: 860 }}>{results.map((a, n) => <NewsItem key={a.id} a={a} i={n} />)}</div>
      <Pagination page={page} total={hasMore ? (page + 1) * SIZE : page * SIZE} size={SIZE} href={(p) => `/cerca?q=${encodeURIComponent(q)}&pagina=${p}`} />
    </main>
  );
}
