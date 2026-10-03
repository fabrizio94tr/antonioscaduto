import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleView from "@/components/ArticleView";
import { renderContent } from "@/lib/content";
import { getArticle, getPage, getRelated } from "@/lib/data";
import { articleMetadata, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const [s, a] = [await getSettings(), await getArticle(slug)];
  if (a) return articleMetadata(a, s);
  const p = await getPage(slug);
  return p ? pageMetadata(p, s) : {};
}

export default async function SlugPage({ params }: P) {
  const { slug } = await params;
  const a = await getArticle(slug);
  if (!a) {
    const p = await getPage(slug);
    if (!p) notFound();
    return (
      <main className="wrap">
        <div className="article">
          <h1 className="page-title">{p.title}</h1>
          <div className="body" dangerouslySetInnerHTML={{ __html: renderContent(p.content) }} />
        </div>
      </main>
    );
  }

  const [related, settings] = await Promise.all([getRelated(a), getSettings()]);
  return <ArticleView a={a} related={related} settings={settings} />;
}
