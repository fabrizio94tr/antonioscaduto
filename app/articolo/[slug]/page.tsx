import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Cover from "@/components/Cover";
import ShareButtons from "@/components/ShareButtons";
import ViewCounter from "@/components/ViewCounter";
import { fmtLong, fmtStamp, getArticle, getRelated, readingMinutes } from "@/lib/data";

export const revalidate = 60;

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.excerpt ?? undefined,
    openGraph: { title: a.title, description: a.excerpt ?? undefined, images: a.image_url ? [a.image_url] : undefined },
  };
}

export default async function ArticlePage({ params }: P) {
  const a = await getArticle((await params).slug);
  if (!a) notFound();
  const related = await getRelated(a);
  const ld = {
    "@context": "https://schema.org", "@type": "NewsArticle", headline: a.title,
    datePublished: a.published_at, image: a.image_url ? [a.image_url] : undefined,
    author: { "@type": "Person", name: "Antonio Scaduto" },
  };
  return (
    <main className="wrap">
      <article className="article">
        {a.category && (
          <Link href={`/categoria/${a.category.slug}`} className="tag">{a.category.name}</Link>
        )}
        <h1>{a.title}</h1>
        {a.excerpt && <p className="lead">{a.excerpt}</p>}
        <p className="meta">{fmtLong(a.published_at)} · {readingMinutes(a.content)} min di lettura</p>
        <ShareButtons title={a.title} path={`/articolo/${a.slug}`} />
        {a.image_url && <div className="cover"><Cover src={a.image_url} alt={a.title} /></div>}
        <div className="body">
          {a.content.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <ShareButtons title={a.title} path={`/articolo/${a.slug}`} />
        <ViewCounter slug={a.slug} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </article>
      {related.length > 0 && (
        <section>
          <h2 className="section-title"><span>Correlati</span></h2>
          <ul className="timeline">
            {related.map((r) => (
              <li key={r.id}>
                <time>{fmtStamp(r.published_at)}</time>
                <Link href={`/articolo/${r.slug}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
