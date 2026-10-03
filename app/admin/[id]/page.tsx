import { notFound } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";
import { getCategories } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <h1>Modifica articolo</h1>
      <ArticleForm article={data as Article} categories={await getCategories()} />
    </>
  );
}
