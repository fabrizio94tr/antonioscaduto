import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeAction } from "@/app/actions";

export const metadata: Metadata = { title: "Disiscrizione newsletter", robots: { index: false } };

export default async function Unsub({ searchParams }: { searchParams: Promise<{ t?: string; esito?: string }> }) {
  const { t, esito } = await searchParams;
  return (
    <main className="wrap">
      <h1 className="page-title">Disiscrizione newsletter</h1>
      {esito === "ok" ? (
        <p>Sei stato disiscritto. <Link href="/" className="tag">Torna alla home</Link></p>
      ) : t ? (
        <form action={unsubscribeAction}>
          <input type="hidden" name="token" value={t} />
          <p style={{ marginBottom: 12 }}>Vuoi smettere di ricevere la newsletter?</p>
          <button className="btn">Conferma disiscrizione</button>
        </form>
      ) : <p>Link non valido.</p>}
    </main>
  );
}
