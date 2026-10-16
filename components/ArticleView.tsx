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
import { fmtLong, fmtStamp } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";
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
          {a.category && !HIDDEN_CATEGORIES.has(a.category.slug) && <Link href={`/category/${a.category.slug}`} className="cat-pill only-clean">{a.category.name}</Link>}
          <ReliabilityBadge value={a.reliability} />
          <h1>{a.category && !HIDDEN_CATEGORIES.has(a.category.slug) && <span className="t-badge only-live">{a.category.name}</span>}{a.title}</h1>
          <div className="clean-share only-clean">
            <div className="cs-icons">
              {(() => {
                const u = encodeURIComponent(`${SITE_URL}/${a.slug}`);
                const t = encodeURIComponent(a.title);
                const items: [string, string, string, string][] = [
                  ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`, "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z", "fb"],
                  ["X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`, "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z", "x"],
                  ["WhatsApp", `https://wa.me/?text=${t}%20${u}`, "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z", "wa"],
                  ["Telegram", `https://t.me/share/url?url=${u}&text=${t}`, "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z", "tg"],
                ];
                return items.map(([name, href, d, k]) => (
                  <a key={k} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Condividi su ${name}`}>
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden><path d={d} /></svg>
                  </a>
                ));
              })()}
            </div>
            <time className="cs-date" dateTime={a.published_at}>{fmtStamp(a.published_at)}</time>
          </div>
          {a.excerpt && <p className="lead">{a.excerpt}</p>}
          <p className="meta">
            <span>{fmtLong(a.published_at)}</span>
            <span>di {a.author_name ?? "Antonio Scaduto"}</span>
            <span>{readingMinutes(a.content)} min di lettura</span>
          </p>
          {a.image_url && <div className="cover"><Cover src={a.image_url} alt={a.title} priority /><span className="cover-credit only-live">{settings.site_title}</span></div>}
          <div className="art-bar only-live">
            <span className="credit">© foto di {settings.site_title}</span>
            <span className="acts">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${a.slug}`)}`} target="_blank" rel="noopener noreferrer" className="fb">Condividi</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${a.slug}`)}`} target="_blank" rel="noopener noreferrer" className="tw">Tweet</a>
            </span>
          </div>
          <div className="art-author only-live">
            <span className="av">{settings.author_photo ? <Cover src={settings.author_photo} alt={settings.author_name} /> : (a.author_name ?? settings.author_name ?? "A").slice(0, 1)}</span>
            <span className="who"><small>Autore</small><b>{a.author_name ?? settings.author_name}</b><small>{fmtLong(a.published_at)}{a.category ? ` · ${a.category.name}` : ""}</small></span>
            {a.category && <Link href={`/category/${a.category.slug}`} className="pill">Altre notizie</Link>}
          </div>
          <div className="no-clean"><ReadingTools text={plain.slice(0, 12000)} /></div>
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
