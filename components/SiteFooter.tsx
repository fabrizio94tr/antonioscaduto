import Link from "next/link";

const links = [
  ["cosa-offriamo", "Cosa offriamo"],
  ["vuoi-collaborare-con-noi", "Vuoi collaborare con noi?"],
  ["chi-siamo", "Chi siamo"],
  ["contatti", "Contatti"],
  ["privacy-policy", "Privacy Policy"],
  ["cookie-policy", "Cookie Policy"],
];


import CookieButton from "./CookieButton";
import { getSettings } from "@/lib/settings";

export default async function SiteFooter() {
  const s = await getSettings();
  const socials = [["facebook", "Facebook"], ["instagram", "Instagram"], ["x", "X"], ["youtube", "YouTube"], ["telegram", "Telegram"]].filter(([k]) => s[k]);
  return (
    <footer className="footer">
      <div className="wrap">
        <ul>
          {links.map(([s, n]) => (
            <li key={s}>
              <Link href={`/${s}`}>{n}</Link>
            </li>
          ))}
          {socials.map(([k, n]) => (
            <li key={k}><a href={s[k]} target="_blank" rel="noopener noreferrer">{n}</a></li>
          ))}
          {(s.ga_id || s.adsense_client) && <li><CookieButton /></li>}
          <li><a href="/feed.xml">RSS</a></li>
        </ul>
        <p>Copyright © {new Date().getFullYear()} {s.site_title}. Tutti i diritti riservati.</p>
      </div>
    </footer>
  );
}
