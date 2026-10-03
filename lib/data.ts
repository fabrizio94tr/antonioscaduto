import { hasSupabase, supabaseServer } from "./supabase";
import { demoArticles, demoCategories, demoPages } from "./demo";
import type { Article, Category, Page } from "./types";

const byDate = (a: Article, b: Article) => +new Date(b.published_at) - +new Date(a.published_at);

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return demoCategories;
  const sb = await supabaseServer();
  const { data } = await sb.from("categories").select("*").order("position");
  return data ?? [];
}

type Opts = { category?: string; featured?: boolean; limit?: number };

export async function getArticles({ category, featured, limit = 30 }: Opts = {}): Promise<Article[]> {
  if (!hasSupabase) {
    return demoArticles
      .filter((a) => (!category || a.category?.slug === category) && (!featured || a.featured))
      .sort(byDate)
      .slice(0, limit);
  }
  const sb = await supabaseServer();
  let q = sb
    .from("articles")
    .select("*, category:categories!inner(*)")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (category) q = q.eq("category.slug", category);
  if (featured) q = q.eq("featured", true);
  const { data } = await q;
  return (data as Article[]) ?? [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!hasSupabase) return demoArticles.find((a) => a.slug === slug) ?? null;
  const sb = await supabaseServer();
  const { data } = await sb.from("articles").select("*, category:categories(*)").eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Article) ?? null;
}

export async function getPage(slug: string): Promise<Page | null> {
  if (!hasSupabase) return demoPages.find((p) => p.slug === slug) ?? null;
  const sb = await supabaseServer();
  const { data } = await sb.from("pages").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
}

const dtf = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", ...o });
export const fmtStamp = (iso: string) =>
  `${dtf({ day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso))} | ${dtf({ hour: "2-digit", minute: "2-digit" }).format(new Date(iso))}`;
export const fmtLong = (iso: string) => dtf({ dateStyle: "full", timeStyle: "short" }).format(new Date(iso));

import { demoTransfers } from "./demo";
import type { Transfer } from "./types";

export async function getTransfers(limit = 100): Promise<Transfer[]> {
  if (!hasSupabase) return demoTransfers;
  const sb = await supabaseServer();
  const { data } = await sb.from("transfers").select("*").order("updated_at", { ascending: false }).limit(limit);
  return (data as Transfer[]) ?? [];
}

export async function getMostRead(limit = 5): Promise<Article[]> {
  if (!hasSupabase) return demoArticles.slice(0, limit);
  const sb = await supabaseServer();
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const { data } = await sb
    .from("articles").select("*, category:categories(*)")
    .eq("published", true).gte("published_at", since)
    .order("views", { ascending: false }).limit(limit);
  return (data as Article[]) ?? [];
}

export async function getBreaking(): Promise<Article[]> {
  if (!hasSupabase) return demoArticles.slice(0, 4);
  const sb = await supabaseServer();
  const { data } = await sb.from("articles").select("id,slug,title,published_at").eq("published", true).eq("breaking", true).order("published_at", { ascending: false }).limit(5);
  return (data as Article[]) ?? [];
}

export async function searchArticles(q: string, limit = 40): Promise<Article[]> {
  const term = q.trim();
  if (!term) return [];
  if (!hasSupabase) return demoArticles.filter((a) => (a.title + (a.excerpt ?? "")).toLowerCase().includes(term.toLowerCase()));
  const sb = await supabaseServer();
  const safe = term.replace(/[%,()]/g, " ");
  const { data } = await sb
    .from("articles").select("*, category:categories(*)")
    .eq("published", true).or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%,content.ilike.%${safe}%`)
    .order("published_at", { ascending: false }).limit(limit);
  return (data as Article[]) ?? [];
}

export async function getRelated(a: Article, limit = 3): Promise<Article[]> {
  const list = await getArticles({ category: a.category?.slug, limit: limit + 1 });
  return list.filter((x) => x.id !== a.id).slice(0, limit);
}

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 200));
