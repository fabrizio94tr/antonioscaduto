import Link from "next/link";
import LogoBall from "./LogoBall";
import NavLinks, { type NavItem } from "./NavLinks";
import PushButton from "./PushButton";
import ScrollState from "./ScrollState";
import SearchOverlay from "./SearchOverlay";
import SearchTrigger from "./SearchTrigger";
import ThemeToggle from "./ThemeToggle";
import Ticker from "./Ticker";
import { getCategories, getLatestPublished } from "@/lib/data";
import { scoresEnabled } from "@/lib/scores";
import { getSettings } from "@/lib/settings";

const dateFmt = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });

export default async function SiteHeader() {
  const [allCats, settings, latest] = await Promise.all([getCategories(), getSettings(), getLatestPublished()]);
  const mode = settings.logo_spin === "kick" ? "kick" : settings.logo_spin === "spin" || settings.logo_spin === "1" ? "spin" : "";
  const items: NavItem[] = [
    { href: "/mercato", label: "Mercato Live", live: true },
    ...(scoresEnabled ? [{ href: "/risultati", label: "Risultati" }] : []),
    ...allCats.filter((c) => c.in_menu).map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
  ];
  return (
    <>
      <ScrollState />
      <header className="site-hdr">
        {/* testata da giornale: visibile solo nello stile "Nuovo" */}
        <div className="mast only-new">
          <div className="wrap">
            <span>Edizione di {dateFmt.format(new Date())}</span>
            <span>{latest ? `Aggiornato alle ${timeFmt.format(new Date(latest))}` : "Il calcio, ogni giorno"}</span>
          </div>
        </div>
        <div className="hdr-top">
          <div className="wrap hdr-in">
            <Link href="/" className="logo" aria-label={`${settings.site_title} – home`}>
              <LogoBall mode={mode} />
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
      </header>
      {/* barra fissa: sibling dell'header, altrimenti "sticky" si fermerebbe con lui */}
      <nav className="nav" aria-label="Categorie">
        <div className="wrap nav-in">
          <Link href="/" className="nav-logo" aria-label="Home" tabIndex={-1}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ball.svg" alt="" width={22} height={22} />
            <span>{settings.site_title}</span>
          </Link>
          <NavLinks items={items} />
        </div>
      </nav>
      <Ticker />
      <SearchOverlay />
    </>
  );
}
