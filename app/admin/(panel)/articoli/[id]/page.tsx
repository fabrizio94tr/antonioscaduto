import { notFound } from "next/navigation";
import { restoreRevision } from "../../../actions";
import { fmtStamp } from "@/lib/data";
import ArticleForm from "@/components/ArticleForm";
import { getCategories } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { supabaseServer } from "@/lib/supabase";
import type { Article } from "@/lib/types";

export default async function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ripristinato?: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const [categories, s, { data: revs }] = await Promise.all([
    getCategories(), getSettings(),
    sb.from("article_revisions").select("id,title,saved_at").eq("article_id", id).order("saved_at", { ascending: false }).limit(15),
  ]);
  return (
    <>
      <div className="row">
        <h1>Modifica articolo</h1>
        <a href={`/anteprima/${id}`} target="_blank" rel="noopener noreferrer" className="btn ghost">👁 Anteprima</a>
      </div>
      {(await searchParams).ripristinato && <p className="notice ok">Versione ripristinata ✓</p>}
      <ArticleForm article={data as Article} categories={categories} siteTitle={s.site_title} />
      {!!revs?.length && (
        <details className="card-box" style={{ marginTop: 20 }}>
          <summary><b>Cronologia modifiche</b> ({revs.length})</summary>
          {revs.map((r) => (
            <form key={r.id} action={restoreRevision} className="row">
              <input type="hidden" name="id" value={r.id} />
              <span>{fmtStamp(r.saved_at)} — {r.title}</span>
              <button className="btn ghost">Ripristina</button>
            </form>
          ))}
        </details>
      )}
    </>
  );
}
