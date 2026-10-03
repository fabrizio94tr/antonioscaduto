import Link from "next/link";
import { getCategories } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import ThemeToggle from "./ThemeToggle";
import PushButton from "./PushButton";
import Ticker from "./Ticker";
import { scoresEnabled } from "@/lib/scores";

export default async function SiteHeader() {
  const [allCats, settings] = await Promise.all([getCategories(), getSettings()]);
  const cats = allCats.filter((c) => c.in_menu);
  return (
    <header>
      <div className="topbar">
        <div className="wrap">
          <Link href="/" className="logo">
            {settings.site_title.split(" ").slice(0, -1).join(" ")} <span>{settings.site_title.split(" ").slice(-1)}</span>
          </Link>
          <p className="tagline">{settings.tagline}</p>
          <div className="tools">
            <form action="/cerca" className="mini-search" role="search">
              <input type="search" name="q" placeholder="Cerca…" aria-label="Cerca" />
            </form>
            {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && <PushButton vapid={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY} />}
            <ThemeToggle />
          </div>
        </div>
      </div>
      <nav className="nav" aria-label="Categorie">
        <div className="wrap">
          <ul>
            <li><Link href="/mercato" className="live">● Mercato Live</Link></li>
            {scoresEnabled && <li><Link href="/risultati">Risultati</Link></li>}
            {cats.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <Ticker />
    </header>
  );
}
