import Link from "next/link";
import { getBreaking } from "@/lib/data";

export default async function Ticker() {
  const items = await getBreaking();
  if (!items.length) return null;
  return (
    <div className="ticker" role="region" aria-label="Ultime ore">
      <div className="wrap">
        <strong>ULTIM'ORA</strong>
        <div className="ticker-track">
          {items.map((a) => (
            <Link key={a.id} href={`/${a.slug}`}>{a.title}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
