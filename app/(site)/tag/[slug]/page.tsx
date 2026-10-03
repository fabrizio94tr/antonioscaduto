import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fmtStamp, getArticlesByTag, getTag } from "@/lib/data";
import { IS_STAGING, SITE_URL } from "@/lib/seo";

export const revalidate = 300;
const SIZE = 30;

type P = { params: Promise<{ slug: string }>; searchParams: Promise<{ pagina?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const tag = await getTag((await params).slug);
  if (!tag) return {};
  return {
    title: `${tag.name}: ultime notizie e news`,
    description: `Tutte le ultime notizie su ${tag.name}: news, calciomercato, interviste e approfondimenti.`,
    alternates: { canonical: `${SITE_URL}/tag/${tag.slug}` },
    robots: IS_STAGING ? { index: false, follow: true } : undefined,
  };
}

export default async function TagPage({ params, searchParams }: P) {
  const { slug } = await params;
  const page = Math.max(1, parseInt((await searchParams).pagina ?? "1", 10) || 1);
  const tag = await getTag(slug);
  if (!tag) notFound();
  const articles = await getArticlesByTag(tag.name, page, SIZE);
  const pages = Math.ceil(tag.n / SIZE);
  return (
    <main className="wrap">
      <h1 className="page-title">{tag.name}</h1>
      <p className="updated">{tag.n} articoli</p>
      <ul className="timeline">
        {articles.map((a) => (
          <li key={a.id}>
            <time dateTime={a.published_at}>{fmtStamp(a.published_at)}</time>
            <div>
              <span className="tag">{a.category?.name}</span><br />
              <Link href={`/${a.slug}`}>{a.title}</Link>
            </div>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav className="pager">
          {page > 1 && <Link href={`/tag/${slug}${page > 2 ? `?pagina=${page - 1}` : ""}`}>← Più recenti</Link>}
          <strong>{page}</strong> / {pages}
          {page < pages && <Link href={`/tag/${slug}?pagina=${page + 1}`}>Meno recenti →</Link>}
        </nav>
      )}
    </main>
  );
}
