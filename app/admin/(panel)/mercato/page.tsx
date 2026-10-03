import { deleteTransfer, saveTransfer } from "../../actions";
import { supabaseServer } from "@/lib/supabase";
import type { Transfer } from "@/lib/types";

const STATI = ["rumors", "trattativa", "vicino", "ufficiale", "sfumato"];

function TransferForm({ t }: { t?: Transfer }) {
  return (
    <form action={saveTransfer} className="f narrow">
      {t && <input type="hidden" name="id" value={t.id} />}
      <label>Giocatore<input type="text" name="player" defaultValue={t?.player} required /></label>
      <label>Da<input type="text" name="from_club" defaultValue={t?.from_club ?? ""} /></label>
      <label>A<input type="text" name="to_club" defaultValue={t?.to_club ?? ""} /></label>
      <label>Stato
        <select name="status" defaultValue={t?.status ?? "rumors"}>{STATI.map((s) => <option key={s}>{s}</option>)}</select>
      </label>
      <label>Cifra<input type="text" name="fee" defaultValue={t?.fee ?? ""} placeholder="es. 15 mln" /></label>
      <label>Nota<input type="text" name="note" defaultValue={t?.note ?? ""} /></label>
      <label>Slug dell&apos;articolo collegato<input type="text" name="article_slug" defaultValue={t?.article_slug ?? ""} /></label>
      <button className="btn">Salva</button>
    </form>
  );
}

export default async function Mercato({ searchParams }: { searchParams: Promise<{ salvato?: string }> }) {
  const sb = await supabaseServer();
  const { data } = await sb.from("transfers").select("*").order("updated_at", { ascending: false }).limit(200);
  return (
    <>
      <h1>Mercato Live</h1>
      {(await searchParams).salvato && <p className="notice ok">Salvato ✓</p>}
      <details className="card-box"><summary><b>+ Nuova trattativa</b></summary><TransferForm /></details>
      {((data ?? []) as Transfer[]).map((t) => (
        <details key={t.id} className="card-box">
          <summary><b>{t.player}</b> — {t.from_club ?? "?"} → {t.to_club ?? "?"} <span className="badge">{t.status}</span></summary>
          <TransferForm t={t} />
          <form action={deleteTransfer}><input type="hidden" name="id" value={t.id} /><button className="btn danger">Elimina</button></form>
        </details>
      ))}
    </>
  );
}
