import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Cover from "@/components/Cover";
import ShareButtons from "@/components/ShareButtons";
import ViewCounter from "@/components/ViewCounter";
import { renderContent, readingMinutes } from "@/lib/content";
import { fmtLong, fmtStamp, getArticle, getPage, getRelated } from "@/lib/data";
import { articleJsonLd, articleMetadata, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const [s, a] = [await getSettings(), await getArticle(slug)];
  if (a) return articleMetadata(a, s);
  const p = await getPage(slug);
  return p ? pageMetadata(p, s) : {};
}

export default async function SlugPage({ params }: P) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) {
    const p = await getPage(slug);
    if (!p) notFound();
    return (
      <main className="wrap">
        <div className="article">
          <h1 className="page-title">{p.title}</h1>
          <div className="body" dangerouslySetInnerHTML={{ __html: renderContent(p.content) }} />
        </div>
      </main>
    );
  }

  const [related, settings] = await Promise.all([getRelated(a), getSettings()]);
  return (
    <main className="wrap">
      <article className="article">
        {a.category && <Link href={`/category/${a.category.slug}`} className="tag">{a.category.name}</Link>}
        <h1>{a.title}</h1>
        {a.excerpt && <p className="lead">{a.excerpt}</p>}
        <p className="meta">
          {fmtLong(a.published_at)} · di {a.author_name ?? "Antonio Scaduto"} · {readingMinutes(a.content)} min di lettura
        </p>
        <ShareButtons title={a.title} path={`/${a.slug}`} />
        {a.image_url && <div className="cover"><Cover src={a.image_url} alt={a.title} /></div>}
        <div className="body" dangerouslySetInnerHTML={{ __html: renderContent(a.content) }} />
        {!!a.tags?.length && (
          <ul className="tags">
            {a.tags.map((t) => <li key={t}><Link href={`/cerca?q=${encodeURIComponent(t)}`}>#{t}</Link></li>)}
          </ul>
        )}
        <ShareButtons title={a.title} path={`/${a.slug}`} />
        <ViewCounter slug={a.slug} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(a, settings)) }} />
      </article>
      {related.length > 0 && (
        <section>
          <h2 className="section-title"><span>Correlati</span></h2>
          <ul className="timeline">
            {related.map((r) => (
              <li key={r.id}>
                <time>{fmtStamp(r.published_at)}</time>
                <Link href={`/${r.slug}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
