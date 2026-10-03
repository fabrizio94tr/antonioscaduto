import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../actions";
import { hasSupabase, supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// [percorso, etichetta, solo admin]
const nav: [string, string, boolean][] = [
  ["/admin", "📊 Panoramica", false],
  ["/admin/articoli", "📰 Articoli", false],
  ["/admin/statistiche", "📈 Statistiche", false],
  ["/admin/commenti", "💬 Commenti", false],
  ["/admin/mercato", "🔁 Mercato Live", false],
  ["/admin/pagine", "📄 Pagine", true],
  ["/admin/categorie", "🏷 Categorie", true],
  ["/admin/newsletter", "✉️ Newsletter", true],
  ["/admin/impostazioni", "⚙️ Impostazioni", true],
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) return <p className="notice" style={{ margin: 24 }}>Supabase non configurato (vedi .env.example).</p>;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const isAdmin = (data.user.app_metadata as { role?: string } | undefined)?.role !== "editor";
  return (
    <div className="panel">
      <aside className="panel-nav">
        <Link href="/admin" className="panel-logo">Redazione</Link>
        <nav>
          {nav.filter(([, , adminOnly]) => isAdmin || !adminOnly).map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="panel-foot">
          <Link href="/" target="_blank">Vai al sito ↗</Link>
          <small>{data.user.email} · {isAdmin ? "admin" : "redattore"}</small>
          <form action={logout}><button className="linklike">Esci</button></form>
        </div>
      </aside>
      <main className="panel-main">{children}</main>
    </div>
  );
}
