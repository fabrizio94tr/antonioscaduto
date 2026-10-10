import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import AuthorCard from "@/components/AuthorCard";
import HeroSlider, { type HeroSlide } from "@/components/HeroSlider";
import MercatoRadar from "@/components/MercatoRadar";
import NewsItem from "@/components/NewsItem";
import NewsPoller from "@/components/NewsPoller";
import Newsletter from "@/components/Newsletter";
import SocialCtas from "@/components/SocialCtas";
import StatsBand from "@/components/StatsBand";
import StandingsWidget from "@/components/StandingsWidget";
import { fmtLong, fmtStamp, getArticles, getHotTags, getMostRead } from "@/lib/data";
import { heroName } from "@/lib/hero";

export const revalidate = 60;

export default async function Home() {
  const [all, featured, editoriali, mercato, serieA, mostRead, hotTags] = await Promise.all([
    getArticles({ limit: 30 }),
    getArticles({ featured: true, limit: 4 }),
    getArticles({ category: "editoriale", limit: 1 }),
    getArticles({ category: "calciomercato", limit: 4 }),
    getArticles({ category: "serie-a", limit: 4 }),
    getMostRead(5),
    getHotTags(14),
  ]);

  // hero: articoli "in evidenza" (con immagine), altrimenti le ultime con immagine
  const withImg = (l: typeof all) => l.filter((a) => a.image_url);
  const pool = featured.length >= 3 ? featured : [...featured, ...withImg(all).filter((a) => !featured.some((f) => f.id === a.id))];
  const heroes = pool.slice(0, 4);
  const slides: HeroSlide[] = heroes.map((a) => ({
    slug: a.slug, title: a.title, image: a.image_url, cat: a.category?.name ?? "News",
    name: heroName(a.title, a.tags, a.category?.name ?? ""), when: fmtStamp(a.published_at), reliability: a.reliability,
  }));
  const used = new Set(heroes.map((a) => a.id));
  const latest = all.filter((a) => !used.has(a.id)).slice(0, 10);
  const edit = editoriali[0];
  const mercatoList = mercato.filter((a) => !used.has(a.id) && !latest.some((l) => l.id === a.id)).slice(0, 4);
  const serieAList = serieA.filter((a) => !used.has(a.id) && !latest.some((l) => l.id === a.id)).slice(0, 4);

  return (
    <main className="wrap">
      {all[0] && <p className="updated">Ultimo aggiornamento: {fmtLong(all[0].published_at)}</p>}
      <AdSlot slot="home" />

      <div className="cols">
        <div className="home-main">
          {slides.length > 0 && <HeroSlider slides={slides} />}

          {hotTags.length > 0 && (
            <nav className="chips hot" aria-label="Argomenti">
              <strong>Argomenti</strong>
              {hotTags.map((t) => <Link key={t.slug} href={`/tag/${t.slug}`}>{t.name}</Link>)}
            </nav>
          )}

          <StatsBand hotTag={hotTags[0]?.name} />

          <h2 className="section-title"><span>Ultime notizie</span><Link href="/category/news">Tutte →</Link></h2>
          <div>{latest.slice(0, 6).map((a, i) => <NewsItem key={a.id} a={a} i={i} />)}</div>

          {edit && (
            <Link href={`/${edit.slug}`} className="edit-strip" data-reveal>
              <div><div className="tg">Editoriale</div><div className="tt">{edit.title}</div></div>
              <span className="go" aria-hidden>→</span>
            </Link>
          )}

          <AdSlot slot="article" />

          {latest.length > 6 && <div>{latest.slice(6).map((a, i) => <NewsItem key={a.id} a={a} i={i} />)}</div>}

          {mercatoList.length > 0 && (
            <>
              <h2 className="section-title"><span>Calciomercato</span><Link href="/category/calciomercato">Tutte →</Link></h2>
              <div>{mercatoList.map((a, i) => <NewsItem key={a.id} a={a} i={i} />)}</div>
            </>
          )}
          {serieAList.length > 0 && (
            <>
              <h2 className="section-title"><span>Serie A</span><Link href="/category/serie-a">Tutte →</Link></h2>
              <div>{serieAList.map((a, i) => <NewsItem key={a.id} a={a} i={i} />)}</div>
            </>
          )}
        </div>

        <aside className="side">
          <MercatoRadar />
          <StandingsWidget />
          {mostRead.length > 0 && (
            <section className="widget" data-reveal>
              <h2>Più letti</h2>
              <ol className="ranked">{mostRead.map((a) => <li key={a.id}><Link href={`/${a.slug}`}>{a.title}</Link></li>)}</ol>
            </section>
          )}
          <div className="side-sticky">
            <AdSlot slot="sidebar" />
            <SocialCtas />
            <Newsletter />
            <AuthorCard />
          </div>
        </aside>
      </div>
      {all[0] && <NewsPoller since={all[0].published_at} />}
    </main>
  );
}
