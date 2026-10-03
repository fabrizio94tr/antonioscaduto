import Link from "next/link";

const links = [
  ["cosa-offriamo", "Cosa offriamo"],
  ["vuoi-collaborare-con-noi", "Vuoi collaborare con noi?"],
  ["chi-siamo", "Chi siamo"],
  ["contatti", "Contatti"],
  ["privacy-policy", "Privacy Policy"],
  ["cookie-policy", "Cookie Policy"],
];


export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <ul>
          {links.map(([s, n]) => (
            <li key={s}>
              <Link href={`/${s}`}>{n}</Link>
            </li>
          ))}
          <li><a href="/feed.xml">RSS</a></li>
        </ul>
        <p>Copyright © {new Date().getFullYear()} Antonio Scaduto. Tutti i diritti riservati.</p>
      </div>
    </footer>
  );
}
