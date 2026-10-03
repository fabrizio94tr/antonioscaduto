import Link from "next/link";
import { getCategories } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import ThemeToggle from "./ThemeToggle";
import Ticker from "./Ticker";

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
            <ThemeToggle />
          </div>
        </div>
      </div>
      <nav className="nav" aria-label="Categorie">
        <div className="wrap">
          <ul>
            <li><Link href="/mercato" className="live">● Mercato Live</Link></li>
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
