import { SITE_URL } from "./site-url";
export { SITE_URL };
/** Finché il sito è su *.vercel.app (demo) non deve essere indicizzato. */
export const IS_STAGING = SITE_URL.includes("vercel.app") || SITE_URL.includes("localhost");

export const articlePath = (slug: string) => `/${slug}`;

import type { Metadata } from "next";
import type { Article, Category, Page, Settings } from "./types";
import { autoDescription } from "./content";

const abs = (u: string) => (u.startsWith("http") ? u : SITE_URL + u);

export function articleMetadata(a: Article, s: Settings): Metadata {
  const title = a.meta_title?.trim() || a.title;
  const description = a.meta_description?.trim() || a.excerpt || autoDescription(a.content);
  const image = a.og_image_url || a.image_url || s.og_image || undefined;
  const url = a.canonical_url?.trim() || abs(articlePath(a.slug));
  return {
    title,
    description,
    keywords: a.tags?.length ? a.tags : undefined,
    authors: [{ name: a.author_name ?? s.site_title }],
    alternates: { canonical: url },
    robots: a.noindex || IS_STAGING ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "article", title, description, url, siteName: s.site_title, locale: "it_IT",
      publishedTime: a.published_at, modifiedTime: a.updated_at ?? a.published_at,
      section: a.category?.name, tags: a.tags, images: image ? [image] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export function pageMetadata(p: Page, s: Settings): Metadata {
  const title = p.meta_title?.trim() || p.title;
  const description = p.meta_description?.trim() || autoDescription(p.content);
  return {
    title, description,
    alternates: { canonical: abs(`/${p.slug}`) },
    robots: p.noindex || IS_STAGING ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: abs(`/${p.slug}`), siteName: s.site_title, locale: "it_IT", images: s.og_image ? [s.og_image] : undefined },
  };
}

export function categoryMetadata(c: Category, s: Settings, page: number): Metadata {
  const title = (c.meta_title?.trim() || `${c.name} – ultime notizie`) + (page > 1 ? ` (pagina ${page})` : "");
  const description = c.meta_description?.trim() || c.description || `Tutte le notizie di ${c.name} su ${s.site_title}.`;
  const path = `/category/${c.slug}` + (page > 1 ? `?pagina=${page}` : "");
  return {
    title, description,
    alternates: { canonical: abs(path) },
    robots: IS_STAGING ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: abs(path), siteName: s.site_title, locale: "it_IT" },
  };
}

export function articleJsonLd(a: Article, s: Settings) {
  const url = a.canonical_url?.trim() || abs(articlePath(a.slug));
  const image = a.og_image_url || a.image_url;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        headline: a.meta_title || a.title,
        description: a.meta_description || a.excerpt || autoDescription(a.content),
        image: image ? [image] : undefined,
        datePublished: a.published_at,
        dateModified: a.updated_at ?? a.published_at,
        articleSection: a.category?.name,
        keywords: a.tags?.join(", ") || undefined,
        inLanguage: "it-IT",
        author: { "@type": "Person", name: a.author_name ?? "Antonio Scaduto" },
        publisher: { "@type": "Organization", name: s.site_title, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          ...(a.category ? [{ "@type": "ListItem", position: 2, name: a.category.name, item: `${SITE_URL}/category/${a.category.slug}` }] : []),
          { "@type": "ListItem", position: a.category ? 3 : 2, name: a.title, item: url },
        ],
      },
    ],
  };
}
