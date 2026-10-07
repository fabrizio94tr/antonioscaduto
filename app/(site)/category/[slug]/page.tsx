import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsItem from "@/components/NewsItem";
import Pagination from "@/components/Pagination";
import { countArticles, getArticles, getCategories } from "@/lib/data";
import { categoryMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;
const SIZE = 30;

type P = { params: Promise<{ slug: string }>; searchParams: Promise<{ pagina?: string }> };
const pageNum = (v?: string) => Math.max(1, parseInt(v ?? "1", 10) || 1);

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  return cat ? categoryMetadata(cat, await getSettings(), pageNum((await searchParams).pagina)) : {};
}

export default async function CategoryPage({ params, searchParams }: P) {
  const { slug } = await params;
  const page = pageNum((await searchParams).pagina);
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();
  const [articles, total] = await Promise.all([getArticles({ category: slug, limit: SIZE, page }), countArticles(slug)]);
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>{cat.name}</h1>
          <p>{total} articoli{cat.description ? ` · ${cat.description}` : ""}</p>
        </div>
      </section>
      <main className="wrap">
        {articles.length === 0 && <p style={{ padding: 20 }}>Nessun articolo in questa categoria.</p>}
        <div style={{ maxWidth: 860 }}>{articles.map((a, i) => <NewsItem key={a.id} a={a} i={i} />)}</div>
        <Pagination page={page} total={total} size={SIZE} href={(p) => `/category/${slug}${p > 1 ? `?pagina=${p}` : ""}`} />
      </main>
    </>
  );
}
