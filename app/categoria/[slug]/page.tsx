import Link from "next/link";
import { notFound } from "next/navigation";
import { fmtStamp, getArticles, getCategories } from "@/lib/data";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();
  const articles = await getArticles({ category: slug, limit: 60 });
  return (
    <main className="wrap">
      <h1 className="page-title">{cat.name}</h1>
      <ul className="timeline">
        {articles.length === 0 && <li>Nessun articolo in questa categoria.</li>}
        {articles.map((a) => (
          <li key={a.id}>
            <time dateTime={a.published_at}>{fmtStamp(a.published_at)}</time>
            <Link href={`/articolo/${a.slug}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
