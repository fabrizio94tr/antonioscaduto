import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsItem from "@/components/NewsItem";
import Pagination from "@/components/Pagination";
import { getArticlesByTag, getTag } from "@/lib/data";
import { IS_STAGING, SITE_URL } from "@/lib/seo";
import { teamColors, textOn } from "@/lib/teams";

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
  const colors = teamColors(slug);
  return (
    <>
      <section className={`page-hero ${colors ? "team-hero" : ""}`} style={colors ? { ["--t1" as string]: colors[0], ["--t2" as string]: colors[1], ["--tx" as string]: textOn(colors[0]) } : undefined}>
        <div className="wrap">
          <h1>{tag.name}</h1>
          <p>{tag.n} articoli{colors ? " · speciale squadra" : ""}</p>
        </div>
      </section>
      <main className="wrap">
        <div style={{ maxWidth: 860 }}>{articles.map((a, i) => <NewsItem key={a.id} a={a} i={i} />)}</div>
        <Pagination page={page} total={tag.n} size={SIZE} href={(p) => `/tag/${slug}${p > 1 ? `?pagina=${p}` : ""}`} />
      </main>
    </>
  );
}
