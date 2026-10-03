import { hasSupabase, supabasePublic } from "./supabase";
import { demoArticles, demoCategories, demoPages, demoTransfers } from "./demo";
import type { Article, Category, Page, Transfer } from "./types";

const byDate = (a: Article, b: Article) => +new Date(b.published_at) - +new Date(a.published_at);
const nowIso = () => new Date().toISOString();

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabase) return demoCategories;
  const sb = supabasePublic();
  const { data } = await sb.from("categories").select("*").order("position");
  return data ?? [];
}

type Opts = { category?: string; featured?: boolean; limit?: number; page?: number };

export async function getArticles({ category, featured, limit = 30, page = 1 }: Opts = {}): Promise<Article[]> {
  if (!hasSupabase) {
    return demoArticles
      .filter((a) => (!category || a.category?.slug === category) && (!featured || a.featured))
      .sort(byDate)
      .slice((page - 1) * limit, page * limit);
  }
  const sb = supabasePublic();
  // "!inner" solo quando serve filtrare per categoria (join più leggero altrimenti)
  let q = sb
    .from("articles")
    .select(category ? "*, category:categories!inner(*)" : "*, category:categories(*)")
    .eq("published", true)
    .lte("published_at", nowIso())
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (category) q = q.eq("category.slug", category);
  if (featured) q = q.eq("featured", true);
  const { data } = await q;
  return (data as unknown as Article[]) ?? [];
}

export async function countArticles(category?: string): Promise<number> {
  if (!hasSupabase) return demoArticles.filter((a) => !category || a.category?.slug === category).length;
  const sb = supabasePublic();
  let q = sb
    .from("articles")
    .select(category ? "id, category:categories!inner(slug)" : "id", { count: "exact", head: true })
    .eq("published", true)
    .lte("published_at", nowIso());
  if (category) q = q.eq("category.slug", category);
  const { count } = await q;
  return count ?? 0;
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!hasSupabase) return demoArticles.find((a) => a.slug === slug) ?? null;
  const sb = supabasePublic();
  const { data } = await sb
    .from("articles").select("*, category:categories(*)")
    .eq("slug", slug).eq("published", true).lte("published_at", nowIso()).maybeSingle();
  return (data as unknown as Article) ?? null;
}

export async function getPage(slug: string): Promise<Page | null> {
  if (!hasSupabase) return demoPages.find((p) => p.slug === slug) ?? null;
  const sb = supabasePublic();
  const { data } = await sb.from("pages").select("*").eq("slug", slug).maybeSingle();
  return data ?? null;
}

export async function getTransfers(limit = 100): Promise<Transfer[]> {
  if (!hasSupabase) return demoTransfers;
  const sb = supabasePublic();
  const { data } = await sb.from("transfers").select("*").order("updated_at", { ascending: false }).limit(limit);
  return (data as Transfer[]) ?? [];
}

export async function getMostRead(limit = 5): Promise<Article[]> {
  if (!hasSupabase) return demoArticles.slice(0, limit);
  const sb = supabasePublic();
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const { data } = await sb
    .from("articles").select("id,slug,title,published_at,views,category:categories(name,slug)")
    .eq("published", true).gte("published_at", since).lte("published_at", nowIso())
    .order("views", { ascending: false }).limit(limit);
  return (data as unknown as Article[]) ?? [];
}

export async function getBreaking(): Promise<Article[]> {
  if (!hasSupabase) return demoArticles.slice(0, 4);
  const sb = supabasePublic();
  const { data } = await sb
    .from("articles").select("id,slug,title,published_at")
    .eq("published", true).eq("breaking", true).lte("published_at", nowIso())
    .order("published_at", { ascending: false }).limit(5);
  return (data as unknown as Article[]) ?? [];
}

export async function searchArticles(q: string, limit = 40, page = 1): Promise<Article[]> {
  const term = q.trim();
  if (!term) return [];
  if (!hasSupabase) return demoArticles.filter((a) => (a.title + (a.excerpt ?? "")).toLowerCase().includes(term.toLowerCase()));
  const sb = supabasePublic();
  const safe = term.replace(/[%,()*:"\\]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return [];
  const { data } = await sb
    .from("articles").select("id,slug,title,excerpt,published_at,image_url,category:categories(name,slug)")
    .eq("published", true).lte("published_at", nowIso())
    .or(`title.ilike.%${safe}%,fts.wfts(italian).${safe}`)
    .order("published_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  return (data as unknown as Article[]) ?? [];
}

export async function getRelated(a: Article, limit = 3): Promise<Article[]> {
  const list = await getArticles({ category: a.category?.slug, limit: limit + 1 });
  return list.filter((x) => x.id !== a.id).slice(0, limit);
}

/** Per le sitemap: slug + data, a blocchi da 1000 (limite di PostgREST). */
export async function getSlugChunk(chunk: number, size = 1000) {
  if (!hasSupabase) return demoArticles.map((a) => ({ slug: a.slug, published_at: a.published_at, updated_at: a.published_at }));
  const sb = supabasePublic();
  const { data } = await sb
    .from("articles").select("slug,published_at,updated_at")
    .eq("published", true).eq("noindex", false).lte("published_at", nowIso())
    .order("published_at", { ascending: false })
    .range(chunk * size, chunk * size + size - 1);
  return data ?? [];
}

const dtf = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", ...o });
export const fmtStamp = (iso: string) =>
  `${dtf({ day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso))} | ${dtf({ hour: "2-digit", minute: "2-digit" }).format(new Date(iso))}`;
export const fmtLong = (iso: string) => dtf({ dateStyle: "full", timeStyle: "short" }).format(new Date(iso));
