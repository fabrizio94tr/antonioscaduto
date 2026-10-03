import sanitizeHtml from "sanitize-html";

export { stripHtml, wordCount, readingMinutes, autoDescription } from "./text";

const looksLikeHtml = (s: string) => /^\s*<[a-z!]/i.test(s);

/** Converte il contenuto salvato (HTML o testo semplice) in HTML sicuro da mostrare. */
export function renderContent(raw: string): string {
  const html = looksLikeHtml(raw)
    ? raw
    : raw.split(/\n{2,}/).map((p) => `<p>${p.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</p>`).join("");
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "h2", "h3", "h4", "blockquote", "figure", "figcaption", "img", "iframe", "hr", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "open.spotify.com"],
    transformTags: {
      img: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, loading: "lazy" } }),
      a: (tag, attribs) => ({
        tagName: tag,
        attribs: attribs.href?.startsWith("http") && !attribs.href.includes("antonioscaduto")
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : attribs,
      }),
    },
  });
}

