import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Pagination from "@/components/Pagination";
import { countArticles, fmtStamp, getArticles, getCategories } from "@/lib/data";
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
    <main className="wrap">
      <h1 className="page-title">{cat.name}</h1>
      {cat.description && <p className="updated">{cat.description}</p>}
      <ul className="timeline">
        {articles.length === 0 && <li>Nessun articolo in questa categoria.</li>}
        {articles.map((a) => (
          <li key={a.id}>
            <time dateTime={a.published_at}>{fmtStamp(a.published_at)}</time>
            <Link href={`/${a.slug}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
      <Pagination page={page} total={total} size={SIZE} href={(p) => `/category/${slug}${p > 1 ? `?pagina=${p}` : ""}`} />
    </main>
  );
}
