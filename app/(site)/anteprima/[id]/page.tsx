import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleView from "@/components/ArticleView";
import { getRelated } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { supabaseServer } from "@/lib/supabase";
import type { Article } from "@/lib/types";

export const metadata: Metadata = { title: "Anteprima", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Anteprima di bozze e articoli programmati: protetta dal middleware (serve il login). */
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from("articles").select("*, category:categories(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const a = data as unknown as Article;
  return <ArticleView a={a} related={await getRelated(a)} settings={await getSettings()} preview />;
}
