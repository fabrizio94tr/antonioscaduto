import Link from "next/link";
import { moderateComment } from "../../actions";
import { fmtStamp } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase";

type Row = { id: string; author: string; body: string; approved: boolean; created_at: string; article: { slug: string; title: string } | null };

export default async function CommentsAdmin({ searchParams }: { searchParams: Promise<{ tutti?: string }> }) {
  const all = (await searchParams).tutti === "1";
  const sb = await supabaseServer();
  let q = sb.from("comments").select("id,author,body,approved,created_at,article:articles(slug,title)").order("created_at", { ascending: false }).limit(100);
  if (!all) q = q.eq("approved", false);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Row[];
  return (
    <>
      <div className="row">
        <h1>Commenti {all ? "(tutti)" : "da moderare"}</h1>
        <Link href={all ? "/admin/commenti" : "/admin/commenti?tutti=1"} className="btn ghost">{all ? "Solo da moderare" : "Mostra tutti"}</Link>
      </div>
      {!rows.length && <p>Nessun commento.</p>}
      {rows.map((c) => (
        <div key={c.id} className="card-box">
          <div><b>{c.author}</b> · {fmtStamp(c.created_at)} · su <Link href={`/${c.article?.slug}`} target="_blank">{c.article?.title}</Link> {c.approved && <span className="badge">approvato</span>}</div>
          <p>{c.body}</p>
          <form action={moderateComment} className="btn-row">
            <input type="hidden" name="id" value={c.id} />
            {!c.approved && <button className="btn" name="op" value="approve">Approva</button>}
            <button className="btn danger" name="op" value="delete" style={{ marginTop: 0 }}>Elimina</button>
          </form>
        </div>
      ))}
    </>
  );
}
