#!/usr/bin/env node
/**
 * Importa articoli, categorie e pagine dal vecchio WordPress (REST API) dentro Supabase.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-wordpress.mjs [--limit 200] [--since 2025-01-01]
 *
 * - Si può rilanciare senza problemi: gli articoli sono "upsert" per slug (nessun duplicato).
 * - Gli URL delle immagini vengono spostati su antonioscaduto.altervista.org, così continuano
 *   a funzionare quando il dominio www.antonioscaduto.com punterà al nuovo sito.
 * - La chiave service_role serve SOLO qui: non va mai messa nel sito, su Vercel o nel repo.
 */
const WP = process.env.WP_URL ?? "https://www.antonioscaduto.com";
const IMG_HOST = process.env.WP_IMAGE_HOST ?? "https://antonioscaduto.altervista.org";
const SB = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SB || !KEY) { console.error("Servono SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const LIMIT = arg("limit") ? parseInt(arg("limit"), 10) : Infinity;
const SINCE = arg("since");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "antonioscaduto-migration/1.0" } });
      if (r.status === 400) return { body: [], total: 0, pages: 0 }; // pagina oltre la fine
      if (!r.ok) throw new Error(`${r.status}`);
      return { body: await r.json(), total: +r.headers.get("x-wp-total") || 0, pages: +r.headers.get("x-wp-totalpages") || 0 };
    } catch (e) { if (i === tries - 1) throw new Error(`${url}: ${e.message}`); await sleep(1500 * (i + 1)); }
  }
}

async function sb(path, { method = "GET", body, prefer } = {}) {
  const r = await fetch(`${SB}/rest/v1/${path}`, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: prefer ?? "return=minimal" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`Supabase ${method} ${path}: ${r.status} ${await r.text()}`);
  return prefer?.includes("representation") ? r.json() : null;
}

const decode = (s = "") => s
  .replace(/&#8217;/g, "’").replace(/&#8216;/g, "‘").replace(/&#8220;/g, "“").replace(/&#8221;/g, "”")
  .replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/&#038;|&amp;/g, "&").replace(/&#8230;/g, "…")
  .replace(/&quot;/g, '"').replace(/&#039;|&#8217;/g, "'").replace(/&nbsp;/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const strip = (h = "") => decode(h.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const fixImg = (s) => s ? s.replace(/https?:\/\/(www\.)?antonioscaduto\.com\/wp-content\//g, `${IMG_HOST}/wp-content/`) : s;

/** Pulisce l'HTML di WordPress: classi/attributi inutili, blocchi vuoti, script. */
function cleanHtml(html = "") {
  return fixImg(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s(class|style|id|data-[\w-]+|srcset|sizes|decoding|fetchpriority)="[^"]*"/gi, "")
    .replace(/<p>\s*(&nbsp;)?\s*<\/p>/gi, "")
    .trim();
}

async function main() {
  console.log("→ Categorie");
  const { body: wpCats } = await getJson(`${WP}/wp-json/wp/v2/categories?per_page=100&_fields=id,slug,name,count,description`);
  const existing = await sb("categories?select=id,slug,position", { prefer: "return=representation" });
  const have = new Map(existing.map((c) => [c.slug, c]));
  let pos = Math.max(0, ...existing.map((c) => c.position));
  const newCats = wpCats.filter((c) => !have.has(c.slug) && c.count > 0).map((c) => ({ slug: c.slug, name: decode(c.name), position: ++pos, in_menu: false }));
  if (newCats.length) await sb("categories", { method: "POST", body: newCats, prefer: "resolution=ignore-duplicates,return=minimal" });
  const cats = await sb("categories?select=id,slug", { prefer: "return=representation" });
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));
  const catByWpId = new Map(wpCats.map((c) => [c.id, catBySlug.get(c.slug)]));
  // categoria di ripiego per "uncategorized" → News
  const fallbackCat = catBySlug.get("news");

  console.log("→ Tag");
  const tagName = new Map();
  for (let p = 1; ; p++) {
    const { body } = await getJson(`${WP}/wp-json/wp/v2/tags?per_page=100&page=${p}&_fields=id,name`);
    if (!body.length) break;
    body.forEach((t) => tagName.set(t.id, decode(t.name)));
    if (body.length < 100) break;
  }

  console.log("→ Pagine");
  const { body: wpPages } = await getJson(`${WP}/wp-json/wp/v2/pages?per_page=100&_fields=slug,title,content,yoast_head_json`);
  const skip = new Set(["hjj"]);
  const pages = wpPages.filter((p) => !skip.has(p.slug)).map((p) => ({
    slug: p.slug, title: decode(p.title.rendered), content: cleanHtml(p.content.rendered),
    meta_title: p.yoast_head_json?.title && p.yoast_head_json.title !== decode(p.title.rendered) ? p.yoast_head_json.title : null,
    meta_description: p.yoast_head_json?.description ?? null,
  }));
  if (pages.length) await sb("pages?on_conflict=slug", { method: "POST", body: pages, prefer: "resolution=merge-duplicates,return=minimal" });

  console.log("→ Articoli");
  const fields = "id,date,date_gmt,modified_gmt,slug,status,title,content,excerpt,categories,tags,sticky,yoast_head_json,_links,_embedded";
  const after = SINCE ? `&after=${SINCE}T00:00:00` : "";
  let done = 0, page = 1, totalPages = 1;
  while (page <= totalPages && done < LIMIT) {
    const { body, pages: tp, total } = await getJson(`${WP}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=wp:featuredmedia,author&orderby=date&order=desc${after}`);
    totalPages = tp; if (page === 1) console.log(`  ${total} articoli da importare`);
    if (!body.length) break;
    const rows = body.map((p) => {
      const y = p.yoast_head_json ?? {};
      const title = decode(p.title.rendered);
      const media = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
      const cover = fixImg(media || y.og_image?.[0]?.url || null);
      const excerpt = strip(p.excerpt?.rendered);
      const metaTitle = y.title && y.title !== title ? decode(y.title) : null;
      return {
        wp_id: p.id,
        slug: p.slug,
        title,
        excerpt: excerpt && excerpt.length > 3 ? excerpt.slice(0, 400) : null,
        content: cleanHtml(p.content.rendered),
        image_url: cover,
        category_id: p.categories.map((id) => catByWpId.get(id)).find(Boolean) ?? fallbackCat,
        tags: p.tags.map((id) => tagName.get(id)).filter(Boolean),
        author_name: decode(p._embedded?.author?.[0]?.name ?? "Antonio Scaduto") === "antonioscaduto" ? "Antonio Scaduto" : decode(p._embedded?.author?.[0]?.name ?? "Antonio Scaduto"),
        featured: false,
        published: p.status === "publish",
        published_at: new Date(p.date_gmt + "Z").toISOString(),
        updated_at: new Date(p.modified_gmt + "Z").toISOString(),
        meta_title: metaTitle,
        meta_description: y.description ? decode(y.description) : null,
        og_image_url: fixImg(y.og_image?.[0]?.url ?? null),
        noindex: y.robots?.index === "noindex",
      };
    });
    await sb("articles?on_conflict=slug", { method: "POST", body: rows, prefer: "resolution=merge-duplicates,return=minimal" });
    done += rows.length;
    process.stdout.write(`\r  importati ${done}${Number.isFinite(LIMIT) ? "" : ` / ${total}`}   `);
    page++;
    await sleep(300);
  }
  console.log("\n✓ Import completato");
}

main().catch((e) => { console.error("\n✗", e.message); process.exit(1); });
