import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <h1 className="page-title">Pagina non trovata</h1>
        <p><Link href="/" className="tag">Torna alla home</Link></p>
      </main>
      <SiteFooter />
    </>
  );
}
