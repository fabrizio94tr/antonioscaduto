import Link from "next/link";
import AdSlot from "./AdSlot";
import AuthorCard from "./AuthorCard";
import Comments from "./Comments";
import Cover from "./Cover";
import MercatoRadar from "./MercatoRadar";
import NewsItem from "./NewsItem";
import ReadingTools from "./ReadingTools";
import ReliabilityBadge from "./Reliability";
import ShareButtons from "./ShareButtons";
import ViewCounter from "./ViewCounter";
import { readingMinutes, renderContent, stripHtml } from "@/lib/content";
import { fmtLong } from "@/lib/data";
import { articleJsonLd } from "@/lib/seo";
import { slugify } from "@/lib/slug";
import { HIDDEN_CATEGORIES } from "@/lib/teams";
import type { Article, Settings } from "@/lib/types";

export default function ArticleView({ a, related, settings, preview = false }: { a: Article; related: Article[]; settings: Settings; preview?: boolean }) {
  const plain = stripHtml(a.content);
  const dropcap = /^[\p{L}]/u.test(plain);
  return (
    <main className="wrap">
      {preview && (
        <p className="notice" style={{ marginTop: 16 }}>
          👁 Anteprima {a.published ? "" : "(bozza non pubblicata)"} — <Link href={`/admin/articoli/${a.id}`}><b>← Torna all&apos;editor</b></Link>
        </p>
      )}
      <div className="art-layout">
        <article className="article" id="articolo">
          <nav className="crumbs" aria-label="Percorso">
            <Link href="/">Home</Link>{a.category && !HIDDEN_CATEGORIES.has(a.category.slug) && <> / <Link href={`/category/${a.category.slug}`}>{a.category.name}</Link></>}
          </nav>
          <ReliabilityBadge value={a.reliability} />
          <h1>{a.title}</h1>
          {a.excerpt && <p className="lead">{a.excerpt}</p>}
          <p className="meta">
            <span>{fmtLong(a.published_at)}</span>
            <span>di {a.author_name ?? "Antonio Scaduto"}</span>
            <span>{readingMinutes(a.content)} min di lettura</span>
          </p>
          {a.image_url && <div className="cover"><Cover src={a.image_url} alt={a.title} priority /></div>}
          <ReadingTools text={plain.slice(0, 12000)} />
          <div className={`prose ${dropcap ? "dropcap" : ""}`} dangerouslySetInnerHTML={{ __html: renderContent(a.content) }} />
          {!!a.tags?.length && (
            <ul className="tags">
              {a.tags.map((t) => <li key={t}><Link href={`/tag/${slugify(t)}`}>#{t}</Link></li>)}
            </ul>
          )}
          <AdSlot slot="article" />
          <ShareButtons title={a.title} path={`/${a.slug}`} />
          {!preview && <ViewCounter slug={a.slug} />}
          {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(a, settings)) }} />}
          {!preview && <Comments articleId={a.id} slug={a.slug} />}
        </article>

        <aside className="art-side">
          <AdSlot slot="sidebar" />
          {related.length > 0 && (
            <section className="widget">
              <h2>Ti potrebbe interessare</h2>
              {related.map((r, i) => <NewsItem key={r.id} a={r} i={i} />)}
            </section>
          )}
          <MercatoRadar limit={4} />
          <AuthorCard />
        </aside>
      </div>
    </main>
  );
}
