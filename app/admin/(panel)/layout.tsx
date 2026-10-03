import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../actions";
import { hasSupabase, supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const nav = [
  ["/admin", "📊 Panoramica"],
  ["/admin/articoli", "📰 Articoli"],
  ["/admin/pagine", "📄 Pagine"],
  ["/admin/categorie", "🏷 Categorie"],
  ["/admin/mercato", "🔁 Mercato Live"],
  ["/admin/iscritti", "✉️ Newsletter"],
  ["/admin/impostazioni", "⚙️ Impostazioni"],
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) return <p className="notice" style={{ margin: 24 }}>Supabase non configurato (vedi .env.example).</p>;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return (
    <div className="panel">
      <aside className="panel-nav">
        <Link href="/admin" className="panel-logo">Redazione</Link>
        <nav>
          {nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="panel-foot">
          <Link href="/" target="_blank">Vai al sito ↗</Link>
          <small>{data.user.email}</small>
          <form action={logout}><button className="linklike">Esci</button></form>
        </div>
      </aside>
      <main className="panel-main">{children}</main>
    </div>
  );
}
