import ArticleForm from "@/components/ArticleForm";
import { getCategories } from "@/lib/data";
import { getSettings } from "@/lib/settings";

export default async function NewArticle() {
  const [categories, s] = await Promise.all([getCategories(), getSettings()]);
  return (
    <>
      <h1>Nuovo articolo</h1>
      <ArticleForm categories={categories} siteTitle={s.site_title} />
    </>
  );
}
