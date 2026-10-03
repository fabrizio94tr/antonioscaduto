#!/usr/bin/env node
/**
 * Sposta le immagini di copertina dal vecchio hosting (Altervista) a Supabase Storage,
 * ridimensionate (max 1200px) e convertite in WebP.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-images.mjs [--limit 500] [--content]
 *
 * - Riprendibile: lavora solo sugli articoli la cui immagine è ancora sul vecchio host.
 * - --content sposta anche le immagini dentro il testo degli articoli (molte di più).
 * - Attenzione allo spazio: ~50-70 KB a immagine. Il piano gratuito Supabase ha 1 GB di storage.
 */
import sharp from "sharp";

const SB = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OLD = process.env.OLD_IMAGE_HOST ?? "antonioscaduto.altervista.org";
if (!SB || !KEY) { console.error("Servono SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : undefined; };
const LIMIT = arg("limit") ? parseInt(arg("limit"), 10) : Infinity;
const CONTENT = process.argv.includes("--content");
const CONC = 6;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const cache = new Map(); // url vecchio → url nuovo (evita di rifare la stessa immagine)

async function migrateOne(url, key) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url, { headers: { "User-Agent": "antonioscaduto-migration/1.0" } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const out = await sharp(input).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
  const path = `wp/${key}.webp`;
  const up = await fetch(`${SB}/storage/v1/object/media/${path}`, {
    method: "POST", headers: { ...H, "Content-Type": "image/webp", "x-upsert": "true", "cache-control": "max-age=31536000" }, body: out,
  });
  if (!up.ok) throw new Error(`upload ${up.status} ${await up.text()}`);
  const pub = `${SB}/storage/v1/object/public/media/${path}`;
  cache.set(url, pub);
  return pub;
}

const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

async function processArticle(a) {
  const patch = {};
  if (a.image_url?.includes(OLD)) patch.image_url = await migrateOne(a.image_url, `${a.wp_id ?? a.id}-cover`);
  if (a.og_image_url?.includes(OLD)) patch.og_image_url = patch.image_url && a.og_image_url === a.image_url ? patch.image_url : await migrateOne(a.og_image_url, `${a.wp_id ?? a.id}-og`);
  if (CONTENT && a.content?.includes(OLD)) {
    const urls = [...new Set([...a.content.matchAll(new RegExp(`https?://${OLD.replace(/\./g, "\\.")}/wp-content/[^"'\\s)]+`, "g"))].map((m) => m[0]))];
    let html = a.content;
    for (const u of urls) {
      try { html = html.split(u).join(await migrateOne(u, `${a.wp_id ?? a.id}-${hash(u)}`)); } catch { /* resta l'URL vecchio */ }
    }
    if (html !== a.content) patch.content = html;
  }
  if (Object.keys(patch).length) {
    const r = await fetch(`${SB}/rest/v1/articles?id=eq.${a.id}`, { method: "PATCH", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(patch) });
    if (!r.ok) throw new Error(`update ${r.status}`);
  }
}

async function main() {
  const cols = "id,wp_id,image_url,og_image_url" + (CONTENT ? ",content" : "");
  const filter = CONTENT ? `or=(image_url.like.*${OLD}*,og_image_url.like.*${OLD}*,content.like.*${OLD}*)` : `or=(image_url.like.*${OLD}*,og_image_url.like.*${OLD}*)`;
  let last = "00000000-0000-0000-0000-000000000000", done = 0, failed = 0;
  while (done + failed < LIMIT) {
    const r = await fetch(`${SB}/rest/v1/articles?select=${cols}&${filter}&id=gt.${last}&order=id&limit=60`, { headers: H });
    if (!r.ok) throw new Error(`lettura ${r.status} ${await r.text()}`);
    const rows = await r.json();
    if (!rows.length) break;
    last = rows[rows.length - 1].id;
    for (let i = 0; i < rows.length; i += CONC) {
      await Promise.all(rows.slice(i, i + CONC).map((a) => processArticle(a).then(() => done++).catch((e) => { failed++; if (failed <= 10) console.error(`\n  ✗ ${a.wp_id ?? a.id}: ${e.message}`); })));
    }
    process.stdout.write(`\r  migrati ${done}, errori ${failed}   `);
  }
  console.log(`\n✓ Fine: ${done} articoli aggiornati, ${failed} errori`);
}
main().catch((e) => { console.error("\n✗", e.message); process.exit(1); });
