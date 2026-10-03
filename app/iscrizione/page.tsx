import Link from "next/link";

export default async function Iscrizione({ searchParams }: { searchParams: Promise<{ esito?: string }> }) {
  const { esito } = await searchParams;
  return (
    <main className="wrap">
      <h1 className="page-title">{esito === "ok" ? "Iscrizione completata" : "Email non valida"}</h1>
      <p>{esito === "ok" ? "Grazie! Riceverai le nostre notizie via email." : "Controlla l'indirizzo e riprova."} <Link href="/" className="tag">Torna alla home</Link></p>
    </main>
  );
}
