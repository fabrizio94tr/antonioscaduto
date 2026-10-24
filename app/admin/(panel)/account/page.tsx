import { changePassword } from "../../actions";
import { supabaseServer } from "@/lib/supabase";

export default async function Account({ searchParams }: { searchParams: Promise<{ ok?: string; errore?: string }> }) {
  const sp = await searchParams;
  const { data } = await (await supabaseServer()).auth.getUser();
  return (
    <>
      <h1>Il mio account</h1>
      <p className="updated">Accesso con <b>{data.user?.email}</b></p>
      {sp.ok && <p className="notice ok">Password cambiata ✓ Da ora usa quella nuova per entrare.</p>}
      {sp.errore && <p className="notice">{sp.errore}</p>}
      <form action={changePassword} className="f narrow card-box">
        <h3>Cambia password</h3>
        <label>Nuova password <small>(almeno 10 caratteri)</small><input type="password" name="password" minLength={10} autoComplete="new-password" required /></label>
        <label>Ripeti la nuova password<input type="password" name="password2" minLength={10} autoComplete="new-password" required /></label>
        <button className="btn">Cambia password</button>
      </form>
    </>
  );
}
