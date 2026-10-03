import { login } from "../actions";
import { hasSupabase } from "@/lib/supabase";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <h1>Accesso redazione</h1>
      {!hasSupabase && <p className="notice">Supabase non è configurato: imposta le variabili d’ambiente (vedi .env.example).</p>}
      {error && <p className="notice">Credenziali non valide.</p>}
      <form action={login} className="f" style={{ maxWidth: 360 }}>
        <label>Email<input type="email" name="email" required /></label>
        <label>Password<input type="password" name="password" required /></label>
        <button className="btn">Accedi</button>
      </form>
    </>
  );
}
