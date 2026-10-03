import Link from "next/link";

export default function Pagination({ page, total, size, href }: { page: number; total: number; size: number; href: (p: number) => string }) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;
  const nums = Array.from(new Set([1, page - 1, page, page + 1, pages])).filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return (
    <nav className="pager" aria-label="Paginazione">
      {page > 1 && <Link href={href(page - 1)} rel="prev">← Più recenti</Link>}
      {nums.map((n, i) => (
        <span key={n}>
          {i > 0 && n - nums[i - 1] > 1 && <span className="gap">…</span>}
          {n === page ? <strong>{n}</strong> : <Link href={href(n)}>{n}</Link>}
        </span>
      ))}
      {page < pages && <Link href={href(page + 1)} rel="next">Meno recenti →</Link>}
    </nav>
  );
}
