import Link from "next/link";
import { logout } from "./actions";
import { fmtStamp } from "@/lib/data";
import { hasSupabase, supabaseServer } from "@/lib/supabase";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!hasSupabase) return <p className="notice">Supabase non configurato.</p>;
  const sb = await supabaseServer();
  const { data } = await sb
    .from("articles")
    .select("*, category:categories(name)")
    .order("published_at", { ascending: false })
    .limit(100);
  const articles = (data ?? []) as (Article & { category: { name: string } | null })[];
  return (
    <>
      <div className="row">
        <h1>Articoli</h1>
        <div className="row">
          <Link href="/admin/new" className="btn">+ Nuovo articolo</Link>
          <form action={logout}><button className="btn">Esci</button></form>
        </div>
      </div>
      <table>
        <thead><tr><th>Titolo</th><th>Categoria</th><th>Data</th><th>Stato</th></tr></thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id}>
              <td><Link href={`/admin/${a.id}`}>{a.title}</Link></td>
              <td>{a.category?.name ?? "—"}</td>
              <td>{fmtStamp(a.published_at)}</td>
              <td>
                <span className="badge">{a.published ? "Pubblicato" : "Bozza"}</span>{" "}
                {a.featured && <span className="badge">In evidenza</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
