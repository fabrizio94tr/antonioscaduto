import ArticleForm from "@/components/ArticleForm";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewArticle() {
  return (
    <>
      <h1>Nuovo articolo</h1>
      <ArticleForm categories={await getCategories()} />
    </>
  );
}
