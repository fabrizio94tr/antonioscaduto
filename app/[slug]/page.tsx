import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/data";

export const revalidate = 300;

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getPage((await params).slug);
  return p ? { title: p.title } : {};
}

export default async function StaticPage({ params }: P) {
  const p = await getPage((await params).slug);
  if (!p) notFound();
  return (
    <main className="wrap">
      <div className="article">
        <h1 className="page-title">{p.title}</h1>
        <div className="body">
          {p.content.split(/\n{2,}/).map((t, i) => <p key={i}>{t}</p>)}
        </div>
      </div>
    </main>
  );
}
