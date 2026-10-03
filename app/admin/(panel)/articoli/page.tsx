import Link from "next/link";
import Pagination from "@/components/Pagination";
import { fmtStamp } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase";
import type { Article } from "@/lib/types";

const SIZE = 25;
type SP = { q?: string; stato?: string; cat?: string; seo?: string; pagina?: string; salvato?: string };

export default async function ArticlesList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.pagina ?? "1", 10) || 1);
  const sb = await supabaseServer();
  const now = new Date().toISOString();

  const { data: cats } = await sb.from("categories").select("id,name").order("position");
  let q = sb
    .from("articles")
    .select("id,slug,title,published,published_at,views,noindex,meta_description,category:categories(name)", { count: "exact" })
    .order("published_at", { ascending: false })
    .range((page - 1) * SIZE, page * SIZE - 1);
  if (sp.q) q = q.ilike("title", `%${sp.q.replace(/[%,()]/g, " ")}%`);
  if (sp.cat) q = q.eq("category_id", sp.cat);
  if (sp.stato === "bozze") q = q.eq("published", false);
  if (sp.stato === "pubblicati") q = q.eq("published", true).lte("published_at", now);
  if (sp.stato === "programmati") q = q.eq("published", true).gt("published_at", now);
  if (sp.seo === "senza-descrizione") q = q.eq("published", true).or("meta_description.is.null,meta_description.eq.");
  const { data, count } = await q;
  const rows = (data ?? []) as unknown as (Article & { category: { name: string } | null })[];

  const base = new URLSearchParams();
  for (const k of ["q", "stato", "cat", "seo"] as const) if (sp[k]) base.set(k, sp[k]!);
  const href = (p: number) => `/admin/articoli?${new URLSearchParams({ ...Object.fromEntries(base), ...(p > 1 ? { pagina: String(p) } : {}) })}`;

  return (
    <>
      <div className="row"><h1>Articoli <small>({count ?? 0})</small></h1><Link href="/admin/articoli/new" className="btn">+ Nuovo articolo</Link></div>
      {sp.salvato && <p className="notice ok">Salvato ✓</p>}
      <form className="filters" action="/admin/articoli">
        <input type="search" name="q" defaultValue={sp.q} placeholder="Cerca per titolo…" />
        <select name="stato" defaultValue={sp.stato ?? ""}>
          <option value="">Tutti gli stati</option>
          <option value="pubblicati">Pubblicati</option>
          <option value="bozze">Bozze</option>
          <option value="programmati">Programmati</option>
        </select>
        <select name="cat" defaultValue={sp.cat ?? ""}>
          <option value="">Tutte le categorie</option>
          {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="seo" defaultValue={sp.seo ?? ""}>
          <option value="">SEO: tutti</option>
          <option value="senza-descrizione">Senza meta description</option>
        </select>
        <button className="btn">Filtra</button>
      </form>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Titolo</th><th>Categoria</th><th>Data</th><th>Stato</th><th>SEO</th><th>👁</th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td><Link href={`/admin/articoli/${a.id}`}>{a.title}</Link></td>
                <td>{a.category?.name ?? "—"}</td>
                <td>{fmtStamp(a.published_at)}</td>
                <td>
                  <span className="badge">{!a.published ? "Bozza" : new Date(a.published_at) > new Date() ? "Programmato" : "Pubblicato"}</span>
                </td>
                <td>
                  {a.noindex ? <span className="badge">noindex</span> : a.meta_description ? <span title="Meta description presente">✓</span> : <span title="Meta description mancante" style={{ color: "#c0392b" }}>✗</span>}
                </td>
                <td>{a.views ?? 0}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6}>Nessun articolo.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={count ?? 0} size={SIZE} href={href} />
    </>
  );
}
