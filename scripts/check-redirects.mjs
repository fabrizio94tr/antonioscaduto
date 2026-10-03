#!/usr/bin/env node
/**
 * Controlla che i vecchi URL di WordPress funzionino sul nuovo sito.
 *   node scripts/check-redirects.mjs https://antonioscaduto.vercel.app [--n 60]
 * Prende articoli, categorie, tag e pagine reali dal vecchio sito e verifica lo stato HTTP sul nuovo.
 */
const NEW = (process.argv[2] ?? "https://antonioscaduto.vercel.app").replace(/\/$/, "");
const OLD = "https://www.antonioscaduto.com";
const N = process.argv.includes("--n") ? parseInt(process.argv[process.argv.indexOf("--n") + 1], 10) : 60;

const json = async (p) => (await fetch(`${OLD}/wp-json/wp/v2/${p}`)).json();
const path = (u) => new URL(u).pathname;

async function check(p) {
  const r = await fetch(NEW + p, { redirect: "manual" });
  const loc = r.headers.get("location");
  return { p, status: r.status, loc };
}

const posts = [...await json(`posts?per_page=${N}&page=1&_fields=link`), ...await json(`posts?per_page=${Math.floor(N / 2)}&page=40&_fields=link`)];
const cats = await json("categories?per_page=100&_fields=link,count");
const tags = await json("tags?per_page=20&orderby=count&order=desc&_fields=link");
const pages = await json("pages?per_page=20&_fields=link");
const urls = [...posts, ...cats.filter((c) => c.count > 0), ...tags, ...pages].map((x) => path(x.link));
urls.push("/feed/", "/page/2/", "/?s=milan", "/sitemap.xml", "/robots.txt", "/news-sitemap.xml");

const bad = [];
let ok = 0;
for (let i = 0; i < urls.length; i += 8) {
  for (const r of await Promise.all(urls.slice(i, i + 8).map(check))) {
    // trailing slash: Next risponde 308 → stessa pagina, è corretto
    if (r.status === 200 || ((r.status === 308 || r.status === 307) && r.loc)) ok++;
    else bad.push(r);
  }
}
console.log(`${ok}/${urls.length} OK`);
for (const b of bad) console.log(`✗ ${b.status} ${b.p}`);
process.exit(bad.length ? 1 : 0);
