import Link from "next/link";
import AdSlot from "./AdSlot";
import Comments from "./Comments";
import Cover from "./Cover";
import ShareButtons from "./ShareButtons";
import ViewCounter from "./ViewCounter";
import { readingMinutes, renderContent } from "@/lib/content";
import { fmtLong, fmtStamp } from "@/lib/data";
import { articleJsonLd } from "@/lib/seo";
import { slugify } from "@/lib/slug";
import type { Article, Settings } from "@/lib/types";

export default function ArticleView({ a, related, settings, preview = false }: { a: Article; related: Article[]; settings: Settings; preview?: boolean }) {
  return (
    <main className="wrap">
      {preview && (
        <p className="notice" style={{ marginTop: 16 }}>
          👁 Anteprima {a.published ? "" : "(bozza non pubblicata)"} — <Link href={`/admin/articoli/${a.id}`}><b>← Torna all&apos;editor</b></Link>
        </p>
      )}
      <article className="article">
        {a.category && <Link href={`/category/${a.category.slug}`} className="tag">{a.category.name}</Link>}
        <h1>{a.title}</h1>
        {a.excerpt && <p className="lead">{a.excerpt}</p>}
        <p className="meta">
          {fmtLong(a.published_at)} · di {a.author_name ?? "Antonio Scaduto"} · {readingMinutes(a.content)} min di lettura
        </p>
        <ShareButtons title={a.title} path={`/${a.slug}`} />
        {a.image_url && <div className="cover"><Cover src={a.image_url} alt={a.title} priority /></div>}
        <div className="body" dangerouslySetInnerHTML={{ __html: renderContent(a.content) }} />
        {!!a.tags?.length && (
          <ul className="tags">
            {a.tags.map((t) => <li key={t}><Link href={`/tag/${slugify(t)}`}>#{t}</Link></li>)}
          </ul>
        )}
        <AdSlot slot="article" />
        <ShareButtons title={a.title} path={`/${a.slug}`} />
        {!preview && <ViewCounter slug={a.slug} />}
        {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(a, settings)) }} />}
      </article>
      {!preview && <div className="article" style={{ marginTop: 0 }}><Comments articleId={a.id} slug={a.slug} /></div>}
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
