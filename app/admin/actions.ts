"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slug";
import { sendPush } from "@/lib/push";
import { SITE_URL } from "@/lib/seo";
import { supabaseServer } from "@/lib/supabase";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const nul = (f: FormData, k: string) => str(f, k) || null;

async function requireUser() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return sb;
}

async function requireAdmin() {
  const sb = await requireUser();
  const { data } = await sb.auth.getUser();
  if ((data.user?.app_metadata as { role?: string } | undefined)?.role === "editor") redirect("/admin?permessi=1");
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
    reliability: nul(formData, "reliability"),
    published: intent === "publish",
    published_at: when ? new Date(when).toISOString() : new Date().toISOString(),
    meta_title: nul(formData, "meta_title"),
    meta_description: nul(formData, "meta_description"),
    canonical_url: nul(formData, "canonical_url"),
    og_image_url: nul(formData, "og_image_url"),
    noindex: formData.get("noindex") === "on",
    focus_keyword: nul(formData, "focus_keyword"),
  };
  const { data: saved, error } = id
    ? await sb.from("articles").update(row).eq("id", id).select("id,notified").single()
    : await sb.from("articles").insert(row).select("id,notified").single();
  if (error) {
    return { error: error.code === "23505" ? "Esiste già un articolo con questo slug (URL). Cambialo." : error.message };
  }
  // notifica push una sola volta per gli articoli "ultim'ora" già in uscita
  if (row.published && row.breaking && saved && !saved.notified && new Date(row.published_at) <= new Date()) {
    try {
      await sendPush({ title: row.title, body: row.excerpt ?? undefined, path: `/${slug}` });
      await sb.from("articles").update({ notified: true }).eq("id", saved.id);
    } catch { /* la notifica non deve bloccare il salvataggio */ }
  }
  await sb.rpc("refresh_tag_index");
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
  const sb = await requireAdmin();
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
  const sb = await requireAdmin();
  await sb.from("pages").delete().eq("slug", str(formData, "slug"));
  refresh();
  redirect("/admin/pagine");
}

/* ---------- categorie ---------- */
export async function saveCategory(formData: FormData) {
  const sb = await requireAdmin();
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
  const sb = await requireAdmin();
  const keys = ["site_title", "tagline", "meta_description", "og_image", "contact_email", "facebook", "instagram", "x", "youtube", "telegram", "ga_id", "gsc_verification", "adsense_client", "ad_slot_article", "ad_slot_sidebar", "ad_slot_home", "sponsor_image", "sponsor_link", "newsletter_from", "author_name", "author_bio", "author_photo", "logo_spin", "intro", "style_default", "style_switch"];
  const rows = keys.map((key) => ({ key, value: str(formData, key) }));
  await sb.from("settings").upsert(rows);
  refresh();
  redirect("/admin/impostazioni?salvato=1");
}

/* ---------- commenti ---------- */
export async function moderateComment(formData: FormData) {
  const sb = await requireUser();
  const id = str(formData, "id");
  if (str(formData, "op") === "approve") await sb.from("comments").update({ approved: true }).eq("id", id);
  else await sb.from("comments").delete().eq("id", id);
  revalidatePath("/admin/commenti");
  redirect("/admin/commenti");
}

/* ---------- cronologia ---------- */
export async function restoreRevision(formData: FormData) {
  const sb = await requireUser();
  const { data: rev } = await sb.from("article_revisions").select("*").eq("id", str(formData, "id")).maybeSingle();
  if (!rev) redirect("/admin/articoli");
  await sb.from("articles").update({
    title: rev.title, excerpt: rev.excerpt, content: rev.content, meta_title: rev.meta_title, meta_description: rev.meta_description,
  }).eq("id", rev.article_id);
  refresh();
  redirect(`/admin/articoli/${rev.article_id}?ripristinato=1`);
}

/* ---------- newsletter ---------- */
export async function sendNewsletter(formData: FormData) {
  const sb = await requireAdmin();
  const key = process.env.RESEND_API_KEY;
  if (!key) redirect("/admin/newsletter?esito=" + encodeURIComponent("Invio non configurato: manca RESEND_API_KEY su Vercel."));
  const subject = str(formData, "subject");
  const intro = str(formData, "intro");
  const ids = formData.getAll("article").map(String);
  if (!subject || !ids.length) redirect("/admin/newsletter?esito=" + encodeURIComponent("Servono oggetto e almeno un articolo."));

  const { data: arts } = await sb.from("articles").select("title,slug,image_url,meta_description").in("id", ids).order("published_at", { ascending: false });
  const { data: st } = await sb.from("settings").select("key,value").in("key", ["site_title", "newsletter_from", "contact_email"]);
  const cfg = Object.fromEntries((st ?? []).map((r) => [r.key, r.value]));
  const from = cfg.newsletter_from;
  if (!from) redirect("/admin/newsletter?esito=" + encodeURIComponent("Imposta il mittente in Impostazioni → Newsletter."));

  const test = str(formData, "op") === "test";
  const { data: u } = await sb.auth.getUser();
  const { data: subs } = test
    ? { data: [{ email: u.user!.email!, token: "00000000-0000-0000-0000-000000000000" }] }
    : await sb.from("subscribers").select("email,token");

  const esc = (t: string) => t.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
  const body = (token: string) => `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
<h1 style="font-size:22px;border-bottom:3px solid #d90429;padding-bottom:8px">${esc(cfg.site_title ?? "Antonio Scaduto")}</h1>
${intro ? `<p style="font-size:16px;line-height:1.5">${esc(intro).replace(/\n/g, "<br>")}</p>` : ""}
${(arts ?? []).map((a) => `<div style="margin:18px 0;border-bottom:1px solid #eee;padding-bottom:14px">
${a.image_url ? `<a href="${SITE_URL}/${a.slug}"><img src="${a.image_url}" alt="" style="width:100%;height:auto;border-radius:4px"></a>` : ""}
<h2 style="font-size:18px;margin:8px 0"><a href="${SITE_URL}/${a.slug}" style="color:#111;text-decoration:none">${esc(a.title)}</a></h2>
${a.meta_description ? `<p style="color:#555;font-size:14px;margin:0">${esc(a.meta_description)}</p>` : ""}</div>`).join("")}
<p style="font-size:12px;color:#888">Ricevi questa email perché ti sei iscritto alla newsletter. <a href="${SITE_URL}/disiscrizione?t=${token}">Disiscriviti</a></p></div>`;

  let sent = 0;
  const list = subs ?? [];
  for (let i = 0; i < list.length; i += 100) {
    const batch = list.slice(i, i + 100).map((r) => ({
      from, to: [r.email], subject: test ? `[PROVA] ${subject}` : subject, html: body(r.token),
      headers: { "List-Unsubscribe": `<${SITE_URL}/disiscrizione?t=${r.token}>` },
    }));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(batch),
    });
    if (!res.ok) redirect("/admin/newsletter?esito=" + encodeURIComponent(`Errore Resend (${res.status}) dopo ${sent} invii: ${(await res.text()).slice(0, 150)}`));
    sent += batch.length;
  }
  redirect("/admin/newsletter?esito=" + encodeURIComponent(test ? "Email di prova inviata a te." : `Newsletter inviata a ${sent} iscritti.`));
}
