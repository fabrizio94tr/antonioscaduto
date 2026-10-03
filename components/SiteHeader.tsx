import Link from "next/link";
import { getCategories } from "@/lib/data";
import ThemeToggle from "./ThemeToggle";
import Ticker from "./Ticker";

export default async function SiteHeader() {
  const cats = (await getCategories()).filter((c) => c.in_menu);
  return (
    <header>
      <div className="topbar">
        <div className="wrap">
          <Link href="/" className="logo">
            Antonio <span>Scaduto</span>
          </Link>
          <p className="tagline">Il calcio a 360 gradi</p>
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
                <Link href={`/categoria/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <Ticker />
    </header>
  );
}
