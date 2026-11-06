import ArticleActions from "./ArticleActions";
import { getArticleStats } from "@/lib/data";
import { SITE_URL } from "@/lib/site-url";

export default async function ArticleActionsServer({ id, slug, title }: { id: string; slug: string; title: string }) {
  const { likes, comments } = await getArticleStats(id);
  return <ArticleActions slug={slug} title={title} url={`${SITE_URL}/${slug}`} likes={likes} comments={comments} />;
}
