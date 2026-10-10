import Link from "next/link";
import Cover from "./Cover";
import ReliabilityBadge from "./Reliability";
import { fmtStamp } from "@/lib/data";
import { HIDDEN_CATEGORIES } from "@/lib/teams";
import type { Article } from "@/lib/types";

export default function NewsItem({ a, i = 0 }: { a: Article; i?: number }) {
  return (
    <Link href={`/${a.slug}`} className="nl-item" data-reveal style={{ ["--i" as string]: Math.min(i, 8) }}>
      <div className="nl-thumb"><Cover src={a.image_url} /></div>
      <div className="nl-body">
        {a.category && !HIDDEN_CATEGORIES.has(a.category.slug) && <span className="chip" data-cat={a.category.slug}>{a.category.name}</span>}
        <ReliabilityBadge value={a.reliability} />
        <h3 className="nl-title">{a.title}</h3>
        <div className="nl-meta">{fmtStamp(a.published_at)}</div>
      </div>
    </Link>
  );
}
