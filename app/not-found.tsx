import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap">
      <h1 className="page-title">Pagina non trovata</h1>
      <p><Link href="/" className="tag">Torna alla home</Link></p>
    </main>
  );
}
