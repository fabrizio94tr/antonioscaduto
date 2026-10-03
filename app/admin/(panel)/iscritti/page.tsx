import { fmtStamp } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase";

export default async function Subscribers() {
  const sb = await supabaseServer();
  const { data, count } = await sb.from("subscribers").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(500);
  return (
    <>
      <div className="row"><h1>Newsletter <small>({count ?? 0} iscritti)</small></h1><a href="/api/admin/iscritti" className="btn">Scarica CSV</a></div>
      <table>
        <thead><tr><th>Email</th><th>Iscritto il</th></tr></thead>
        <tbody>{(data ?? []).map((s) => <tr key={s.id}><td>{s.email}</td><td>{fmtStamp(s.created_at)}</td></tr>)}</tbody>
      </table>
    </>
  );
}
