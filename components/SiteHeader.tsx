import Link from "next/link";
import LogoBall from "./LogoBall";
import NavLinks, { type NavItem } from "./NavLinks";
import PushButton from "./PushButton";
import SearchOverlay from "./SearchOverlay";
import SearchTrigger from "./SearchTrigger";
import ThemeToggle from "./ThemeToggle";
import Ticker from "./Ticker";
import { getCategories } from "@/lib/data";
import { scoresEnabled } from "@/lib/scores";
import { getSettings } from "@/lib/settings";

export default async function SiteHeader() {
  const [allCats, settings] = await Promise.all([getCategories(), getSettings()]);
  const items: NavItem[] = [
    { href: "/mercato", label: "Mercato Live", live: true },
    ...(scoresEnabled ? [{ href: "/risultati", label: "Risultati" }] : []),
    ...allCats.filter((c) => c.in_menu).map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
  ];
  return (
    <header>
      <div className="site-hdr">
        <div className="hdr-top">
          <div className="wrap hdr-in">
            <Link href="/" className="logo" aria-label={`${settings.site_title} – home`}>
              <LogoBall />
              {settings.site_title}
            </Link>
            <div className="tools">
              <SearchTrigger />
              {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && <PushButton vapid={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY} />}
              <ThemeToggle />
            </div>
          </div>
        </div>
        <p className="tagline">{settings.tagline}</p>
      </div>
      <nav className="nav" aria-label="Categorie">
        <div className="wrap"><NavLinks items={items} /></div>
      </nav>
      <Ticker />
      <SearchOverlay />
    </header>
  );
}
