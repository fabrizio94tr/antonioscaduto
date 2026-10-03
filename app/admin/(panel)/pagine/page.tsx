import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";

export default async function PagesList({ searchParams }: { searchParams: Promise<{ salvato?: string }> }) {
  const sb = await supabaseServer();
  const { data } = await sb.from("pages").select("slug,title,noindex").order("title");
  const { salvato } = await searchParams;
  return (
    <>
      <div className="row"><h1>Pagine</h1><Link href="/admin/pagine/new" className="btn">+ Nuova pagina</Link></div>
      {salvato && <p className="notice ok">Salvato ✓</p>}
      <table>
        <thead><tr><th>Titolo</th><th>URL</th><th></th></tr></thead>
        <tbody>
          {(data ?? []).map((p) => (
            <tr key={p.slug}>
              <td><Link href={`/admin/pagine/${p.slug}`}>{p.title}</Link></td>
              <td>/{p.slug}</td>
              <td>{p.noindex && <span className="badge">noindex</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
