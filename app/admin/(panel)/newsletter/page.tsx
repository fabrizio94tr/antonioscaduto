import { sendNewsletter } from "../../actions";
import { fmtStamp } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase";

export default async function Newsletter({ searchParams }: { searchParams: Promise<{ esito?: string }> }) {
  const sb = await supabaseServer();
  const [{ data: subs, count }, { data: arts }] = await Promise.all([
    sb.from("subscribers").select("email,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(200),
    sb.from("articles").select("id,title,published_at").eq("published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }).limit(15),
  ]);
  const esito = (await searchParams).esito;
  return (
    <>
      <div className="row"><h1>Newsletter <small>({count ?? 0} iscritti)</small></h1><a href="/api/admin/iscritti" className="btn ghost">Scarica CSV</a></div>
      {esito && <p className="notice ok">{esito}</p>}
      <form action={sendNewsletter} className="f narrow card-box">
        <h2>Nuova newsletter</h2>
        <label>Oggetto<input type="text" name="subject" required /></label>
        <label>Introduzione (facoltativa)<textarea name="intro" rows={3} /></label>
        <fieldset className="card-box">
          <legend><b>Articoli da includere</b></legend>
          {(arts ?? []).map((a, i) => (
            <label key={a.id} className="chk"><input type="checkbox" name="article" value={a.id} defaultChecked={i < 5} /> {a.title}</label>
          ))}
        </fieldset>
        <div className="btn-row">
          <button className="btn ghost" name="op" value="test">Invia prova a me</button>
          <button className="btn" name="op" value="send">Invia a tutti gli iscritti</button>
        </div>
        <small>Richiede un account Resend e la variabile RESEND_API_KEY. Prova sempre prima l&apos;invio a te.</small>
      </form>
      <h2>Iscritti recenti</h2>
      <table>
        <thead><tr><th>Email</th><th>Iscritto il</th></tr></thead>
        <tbody>{(subs ?? []).map((s) => <tr key={s.email}><td>{s.email}</td><td>{fmtStamp(s.created_at)}</td></tr>)}</tbody>
      </table>
    </>
  );
}
