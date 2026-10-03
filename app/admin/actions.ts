"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slug";
import { supabaseServer } from "@/lib/supabase";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const nul = (f: FormData, k: string) => str(f, k) || null;

async function requireUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return sb;
}

const refresh = () => revalidatePath("/", "layout");

/* ---------- auth ---------- */
export async function login(formData: FormData) {
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: str(formData, "email"), password: String(formData.get("password") ?? "") });
  if (error) redirect("/admin/login?error=1");
  redirect("/admin");
}

export async function logout() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/admin/login");
}

/* ---------- articoli ---------- */
export type SaveState = { error?: string } | null;

export async function saveArticle(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const sb = await requireUser();
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { error: "Il titolo è obbligatorio." };
  const slug = (slugify(str(formData, "slug") || title)) || `articolo-${Date.now()}`;
  const intent = str(formData, "intent"); // "draft" | "publish"
  const when = str(formData, "published_at");

  const row = {
    title,
    slug,
    excerpt: nul(formData, "excerpt"),
    content: String(formData.get("content") ?? ""),
    image_url: nul(formData, "image_url"),
    category_id: nul(formData, "category_id"),
    tags: str(formData, "tags").split(",").map((t) => t.trim()).filter(Boolean),
    author_name: str(formData, "author_name") || "Antonio Scaduto",
    featured: formData.get("featured") === "on",
    breaking: formData.get("breaking") === "on",
    published: intent === "publish",
    published_at: when ? new Date(when).toISOString() : new Date().toISOString(),
    meta_title: nul(formData, "meta_title"),
    meta_description: nul(formData, "meta_description"),
    canonical_url: nul(formData, "canonical_url"),
    og_image_url: nul(formData, "og_image_url"),
    noindex: formData.get("noindex") === "on",
    focus_keyword: nul(formData, "focus_keyword"),
  };
  const { error } = id ? await sb.from("articles").update(row).eq("id", id) : await sb.from("articles").insert(row);
  if (error) {
    return { error: error.code === "23505" ? "Esiste già un articolo con questo slug (URL). Cambialo." : error.message };
  }
  refresh();
  redirect("/admin/articoli?salvato=1");
}

export async function deleteArticle(formData: FormData) {
  const sb = await requireUser();
  await sb.from("articles").delete().eq("id", str(formData, "id"));
  refresh();
  redirect("/admin/articoli");
}

/* ---------- pagine ---------- */
export async function savePage(formData: FormData) {
  const sb = await requireUser();
  const original = str(formData, "original_slug");
  const title = str(formData, "title");
  const slug = (slugify(str(formData, "slug") || title)) || "pagina";
  const row = {
    slug, title,
    content: String(formData.get("content") ?? ""),
    meta_title: nul(formData, "meta_title"),
    meta_description: nul(formData, "meta_description"),
    noindex: formData.get("noindex") === "on",
  };
  const { error } = original ? await sb.from("pages").update(row).eq("slug", original) : await sb.from("pages").insert(row);
  if (error) redirect(`/admin/pagine/${original || "new"}?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/pagine?salvato=1");
}

export async function deletePage(formData: FormData) {
  const sb = await requireUser();
  await sb.from("pages").delete().eq("slug", str(formData, "slug"));
  refresh();
  redirect("/admin/pagine");
}

/* ---------- categorie ---------- */
export async function saveCategory(formData: FormData) {
  const sb = await requireUser();
  const row = {
    name: str(formData, "name"),
    position: parseInt(str(formData, "position"), 10) || 0,
    in_menu: formData.get("in_menu") === "on",
    description: nul(formData, "description"),
    meta_title: nul(formData, "meta_title"),
    meta_description: nul(formData, "meta_description"),
  };
  const id = str(formData, "id");
  if (id) await sb.from("categories").update(row).eq("id", id);
  else await sb.from("categories").insert({ ...row, slug: slugify(row.name) });
  refresh();
  redirect("/admin/categorie?salvato=1");
}

/* ---------- mercato ---------- */
export async function saveTransfer(formData: FormData) {
  const sb = await requireUser();
  const row = {
    player: str(formData, "player"),
    from_club: nul(formData, "from_club"),
    to_club: nul(formData, "to_club"),
    status: str(formData, "status") || "rumors",
    fee: nul(formData, "fee"),
    note: nul(formData, "note"),
    article_slug: nul(formData, "article_slug"),
    updated_at: new Date().toISOString(),
  };
  const id = str(formData, "id");
  if (id) await sb.from("transfers").update(row).eq("id", id);
  else await sb.from("transfers").insert(row);
  refresh();
  redirect("/admin/mercato?salvato=1");
}

export async function deleteTransfer(formData: FormData) {
  const sb = await requireUser();
  await sb.from("transfers").delete().eq("id", str(formData, "id"));
  refresh();
  redirect("/admin/mercato");
}

/* ---------- impostazioni ---------- */
export async function saveSettings(formData: FormData) {
  const sb = await requireUser();
  const keys = ["site_title", "tagline", "meta_description", "og_image", "contact_email", "facebook", "instagram", "x", "youtube", "telegram"];
  const rows = keys.map((key) => ({ key, value: str(formData, key) }));
  await sb.from("settings").upsert(rows);
  refresh();
  redirect("/admin/impostazioni?salvato=1");
}
